# Kinetic Orbit - Secure API Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Groq API key
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 3. Start the Application

**Option A: Start both frontend and backend together**
```bash
npm run dev:full
```

**Option B: Start separately**
```bash
# Terminal 1 - Start backend server
npm run server

# Terminal 2 - Start frontend
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔒 Security Features

- ✅ **API Key Protection**: Your Groq API key is stored server-side only
- ✅ **No Client Exposure**: API key never reaches the browser
- ✅ **CORS Protection**: Only your frontend can access the API
- ✅ **Error Handling**: Secure error responses without sensitive data

## 📡 API Endpoints

### POST /api/extract
Extracts knowledge from text using AI.

**Request:**
```json
{
  "text": "Your meeting transcript or document text here..."
}
```

**Response:**
```json
{
  "nodes": [...],
  "edges": [...],
  "decisions": [...]
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Development

### Environment Variables
- `GROQ_API_KEY`: Your Groq API key (required)
- `GROQ_BASE_URL`: Groq OpenAI-compatible base URL (optional)
- `GROQ_EXTRACT_MODEL`: Groq model for extraction (optional)
- `GROQ_SHADOW_MODEL`: Groq model for shadow simulation (optional)
- `PORT`: Backend server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)
- `NODE_ENV`: Environment mode (development/production)

### Project Structure
```
├── server/
│   └── index.ts          # Backend API server
├── src/
│   ├── services/
│   │   └── openaiExtractor.ts  # Now uses proxy API
│   └── contexts/
│       └── KnowledgeContext.tsx  # Updated for secure API
├── .env.example          # Environment template
└── .env                  # Your environment variables (git-ignored)
```

## 🚨 Important Security Notes

1. **Never commit `.env` file** - it contains your API key
2. **API Key stays server-side** - never exposed to browser
3. **Use HTTPS in production** - protect API communications
4. **Monitor API usage** - check OpenAI dashboard for unusual activity

## 🐛 Troubleshooting

### Common Issues:

**"API key not configured"**
- Check that your `.env` file has the correct `GROQ_API_KEY`
- Ensure the server is restarted after changing environment variables

**"CORS error"**
- Verify `FRONTEND_URL` in your `.env` matches your frontend URL
- Check that both frontend and backend are running

**"Connection refused"**
- Ensure the backend server is running on port 3001
- Check that no other application is using that port

### Logs:
The backend server logs all requests and errors to the console for debugging.
