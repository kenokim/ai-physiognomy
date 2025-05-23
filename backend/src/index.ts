import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { analyzePhysiognomy } from './services/physiognomyService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('파일은 이미지 형식이어야 합니다.'));
    }
  }
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: '물형관상 분석 서비스가 실행 중입니다.' });
});

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: '이미지 파일이 필요합니다.'
      });
    }

    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    
    const result = await analyzePhysiognomy(imageBuffer, mimeType);
    
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}`);
}); 