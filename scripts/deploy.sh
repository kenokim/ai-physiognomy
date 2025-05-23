#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ai-physiognomy"
AWS_REGION="ap-northeast-2"

echo -e "${GREEN}🚀 Starting deployment of AI Physiognomy application...${NC}"

# Check if required tools are installed
check_requirements() {
    echo -e "${YELLOW}📋 Checking requirements...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed${NC}"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements satisfied${NC}"
}

# Get Google AI API Key
get_api_key() {
    if [ -z "$GOOGLE_AI_API_KEY" ]; then
        echo -e "${YELLOW}🔑 Please enter your Google AI API Key:${NC}"
        read -s GOOGLE_AI_API_KEY
        export GOOGLE_AI_API_KEY
    fi
    
    if [ -z "$GOOGLE_AI_API_KEY" ]; then
        echo -e "${RED}❌ Google AI API Key is required${NC}"
        exit 1
    fi
}

# Initialize Terraform
init_terraform() {
    echo -e "${YELLOW}🏗️  Initializing Terraform...${NC}"
    cd terraform
    terraform init
    cd ..
}

# Plan Terraform deployment
plan_terraform() {
    echo -e "${YELLOW}📋 Planning Terraform deployment...${NC}"
    cd terraform
    terraform plan -var="google_ai_api_key=$GOOGLE_AI_API_KEY"
    cd ..
}

# Apply Terraform
apply_terraform() {
    echo -e "${YELLOW}🚀 Applying Terraform configuration...${NC}"
    cd terraform
    terraform apply -var="google_ai_api_key=$GOOGLE_AI_API_KEY" -auto-approve
    
    # Get ECR repository URLs
    BACKEND_ECR_URL=$(terraform output -raw ecr_backend_repository_url)
    FRONTEND_ECR_URL=$(terraform output -raw ecr_frontend_repository_url)
    LOAD_BALANCER_URL=$(terraform output -raw load_balancer_url)
    
    cd ..
    
    echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
    echo -e "${GREEN}Backend ECR: $BACKEND_ECR_URL${NC}"
    echo -e "${GREEN}Frontend ECR: $FRONTEND_ECR_URL${NC}"
}

# Build and push Docker images
build_and_push_images() {
    echo -e "${YELLOW}🐳 Building and pushing Docker images...${NC}"
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $BACKEND_ECR_URL
    
    # Build and push backend
    echo -e "${YELLOW}📦 Building backend image...${NC}"
    docker build -t $PROJECT_NAME-backend ./backend
    docker tag $PROJECT_NAME-backend:latest $BACKEND_ECR_URL:latest
    docker push $BACKEND_ECR_URL:latest
    
    # Build and push frontend
    echo -e "${YELLOW}📦 Building frontend image...${NC}"
    docker build -t $PROJECT_NAME-frontend ./frontend
    docker tag $PROJECT_NAME-frontend:latest $FRONTEND_ECR_URL:latest
    docker push $FRONTEND_ECR_URL:latest
    
    echo -e "${GREEN}✅ Docker images pushed successfully${NC}"
}

# Update ECS services
update_ecs_services() {
    echo -e "${YELLOW}🔄 Updating ECS services...${NC}"
    
    # Force new deployment
    aws ecs update-service --cluster $PROJECT_NAME-cluster --service $PROJECT_NAME-backend --force-new-deployment --region $AWS_REGION
    aws ecs update-service --cluster $PROJECT_NAME-cluster --service $PROJECT_NAME-frontend --force-new-deployment --region $AWS_REGION
    
    echo -e "${GREEN}✅ ECS services updated${NC}"
}

# Wait for services to be stable
wait_for_services() {
    echo -e "${YELLOW}⏳ Waiting for services to be stable...${NC}"
    
    aws ecs wait services-stable --cluster $PROJECT_NAME-cluster --services $PROJECT_NAME-backend --region $AWS_REGION
    aws ecs wait services-stable --cluster $PROJECT_NAME-cluster --services $PROJECT_NAME-frontend --region $AWS_REGION
    
    echo -e "${GREEN}✅ Services are stable${NC}"
}

# Main deployment function
main() {
    check_requirements
    get_api_key
    init_terraform
    plan_terraform
    
    echo -e "${YELLOW}❓ Do you want to proceed with the deployment? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        apply_terraform
        build_and_push_images
        update_ecs_services
        wait_for_services
        
        echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
        echo -e "${GREEN}🌐 Application URL: $LOAD_BALANCER_URL${NC}"
        echo -e "${YELLOW}⚠️  Note: It may take a few minutes for the application to be fully available.${NC}"
    else
        echo -e "${YELLOW}❌ Deployment cancelled${NC}"
    fi
}

# Run main function
main "$@" 