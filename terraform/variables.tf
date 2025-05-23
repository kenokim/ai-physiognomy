variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ai-physiognomy"
}

variable "google_ai_api_key" {
  description = "Google AI API Key for Gemini"
  type        = string
  sensitive   = true
} 