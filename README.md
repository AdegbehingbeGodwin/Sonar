# Sonar - AI-Powered Clinical Documentation
<img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/e960f610-691b-4fd1-9a37-ceb0a07cfec4" />

Sonar is an advanced, AI-powered clinical documentation assistant that helps healthcare professionals efficiently create and manage patient records using state-of-the-art speech recognition and natural language processing.

## 🚀 Features

- **Real-time Medical Transcription**: Uses Google's Gemini AI for accurate clinical speech recognition
- **Structured SOAP Note Generation**: Automatically creates Subjective, Objective, Assessment, and Plan sections
- **Medical Terminology Recognition**: Specialized understanding of clinical language and jargon
- **HIPAA-Compliant Architecture**: Designed with healthcare privacy requirements in mind
- **Intuitive User Interface**: Clean, professional interface tailored for healthcare professionals
- **Audio Recording Interface**: Built-in recording capabilities with real-time visualization
- **Review and Approval Workflow**: Comprehensive review interface with editing capabilities

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Backend**: Node.js with Express
- **AI Service**: Google Gemini API (gemini-2.0-flash-lite model)
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Google Gemini API key

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd sonar
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory with your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

> **Note**: Get your free API key from [Google AI Studio](https://aistudio.google.com/)

### 4. Run the Application
```bash
# Start both frontend and backend concurrently
npm run start

# Or run them separately:
# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start the frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗️ Project Structure

```
sonar/
├── components/           # React UI components
│   ├── Dashboard.tsx
│   ├── Header.tsx
│   ├── RecordingInterface.tsx
│   └── ReviewInterface.tsx
├── server/              # Backend server files
│   └── server.js        # Express server with Gemini API integration
├── public/              # Static assets
├── .env                 # Environment variables (not committed)
├── App.tsx             # Main application component
├── README.md           # This file
└── package.json        # Project dependencies and scripts
```

## 🔧 Configuration

### API Key Setup
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create an account or sign in
3. Create a new API key
4. Add the key to your `.env` file as `GEMINI_API_KEY=your_key_here`

### Model Configuration
The application currently uses the `gemini-2.0-flash-lite` model for optimal performance and cost. You can modify this in `server/server.js` if needed.

## 📖 Usage

1. **Start a New Visit**: Click "Start New Visit" on the dashboard
2. **Record Session**: Use the recording interface to capture the patient conversation
3. **Review Transcript**: The AI will generate a structured SOAP note
4. **Edit & Approve**: Review, edit if necessary, and approve the clinical note
5. **Export**: Save or export the final documentation

## 🌐 API Endpoints

### Backend Server (http://localhost:5000)

- `POST /api/transcribe` - Transcribe uploaded audio file
- `POST /api/transcribe-buffer` - Transcribe audio sent as raw buffer
- `GET /api/health` - Health check endpoint

### Frontend (http://localhost:3000)

The frontend is a single-page application with the following views:
- Dashboard: Visit history and new visit creation
- Recording Interface: Audio recording and real-time transcription
- Review Interface: Transcript review and SOAP note editing

## 🔐 Security & Compliance

- API keys are stored securely in environment variables
- Audio files are processed securely and deleted after processing
- Designed with healthcare privacy requirements in mind
- Follows best practices for API security

## ⚠️ Limitations & Quotas

The free tier of the Google Gemini API has usage limits:
- Requests per minute: Limited
- Requests per day: Limited
- Input tokens per minute: Limited

For production use, consider upgrading your Google AI Studio plan for higher quotas.

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your API key in the `.env` file
   - Check that you have access to the Gemini API
   - Ensure the API key has not expired

2. **Transcription Errors**
   - Check internet connection
   - Verify API quota limits
   - Ensure audio format is supported (webm)

3. **Server Not Starting**
   - Check if port 5000 is already in use
   - Verify Node.js version compatibility
   - Check console logs for specific error messages

### Logs
- Server logs are displayed in the terminal where the server is running
- Client-side errors appear in browser console (F12)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
- Check the troubleshooting section above
- Open an issue in the repository
- Refer to the Google Gemini API documentation

## 🙏 Acknowledgments

- Google AI for the Gemini API
- React and Vite for the modern development experience
- Tailwind CSS for the styling framework
- Lucide React for the icon library

---

**Sonar** - Transforming clinical documentation with AI-powered efficiency.
