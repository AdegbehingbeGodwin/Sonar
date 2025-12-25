require('dotenv').config({ path: '../.env' });
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API endpoint to process audio and return transcript
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioPath = req.file.path;
    const audioBuffer = fs.readFileSync(audioPath);
    const base64Audio = audioBuffer.toString('base64');

    // Use Gemini API for medical transcription
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Create the prompt for medical transcription
    const prompt = "Transcribe this medical conversation into a structured clinical note. Focus on medical terminology, symptoms, medications, and clinical observations. Format as a clean transcript suitable for a SOAP note. Return only the transcribed text without additional commentary.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Audio,
          mimeType: "audio/webm"
        }
      }
    ]);

    const response = await result.response;
    const transcript = response.text();

    // Clean up the uploaded file
    fs.unlinkSync(audioPath);

    // Return the transcript
    res.json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);

    // Clean up the uploaded file even if there's an error
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('Error cleaning up file:', cleanupError);
    }

    if (error.message.includes('API_KEY') || (error.status && error.status === 400)) {
      console.error('API Key Error Details:', error);
      res.status(500).json({
        error: 'Transcription service configuration error',
        details: 'Invalid or missing GEMINI_API_KEY. Please check your API key in the .env file'
      });
    } else {
      console.error('Transcription Error:', error);
      res.status(500).json({
        error: 'Transcription failed',
        details: error.message
      });
    }
  }
});

// Alternative endpoint for direct audio buffer processing
app.post('/api/transcribe-buffer', express.raw({ type: 'audio/*', limit: '10mb' }), async (req, res) => {
  try {
    // Use Gemini API for medical transcription with raw audio buffer
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Create the prompt for medical transcription
    const prompt = "Transcribe this medical conversation into a structured clinical note. Focus on medical terminology, symptoms, medications, and clinical observations. Format as a clean transcript suitable for a SOAP note. Return only the transcribed text without additional commentary.";

    // Convert the raw buffer to base64
    const base64Audio = req.body.toString('base64');

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Audio,
          mimeType: req.headers['content-type'] || "audio/webm"
        }
      }
    ]);

    const response = await result.response;
    const transcript = response.text();

    res.json({ transcript });
  } catch (error) {
    console.error('Buffer transcription error:', error);

    if (error.message.includes('API_KEY') || (error.status && error.status === 400)) {
      console.error('API Key Error Details (Buffer):', error);
      res.status(500).json({
        error: 'Transcription service configuration error',
        details: 'Invalid or missing GEMINI_API_KEY. Please check your API key in the .env file'
      });
    } else {
      console.error('Buffer Transcription Error:', error);
      res.status(500).json({
        error: 'Buffer transcription failed',
        details: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
});