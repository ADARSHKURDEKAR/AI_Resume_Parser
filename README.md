# Resume Screening with RAG

An AI-powered resume screening tool that uses Retrieval-Augmented Generation (RAG) to analyze resumes against job descriptions and provide intelligent Q&A about candidates.

## Overview

This application enables recruiters and hiring managers to:

1. Upload a resume (PDF or TXT)
2. Upload a job description (PDF or TXT)
3. Get an instant match score (0-100%)
4. View key strengths and gaps
5. Ask questions about the candidate using AI with RAG-powered context retrieval

## Tech Stack

### Frontend

- **React 18** - UI framework
- **React Router 6** - Routing
- **TypeScript** - Type safety
- **TailwindCSS 3** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **pdf-parse** - PDF text extraction
- **Multer** - File upload handling

### RAG & Storage

- **Simple Embeddings** - TF-IDF based embeddings
- **In-Memory Vector Store** - Fast local storage
- **Cosine Similarity** - Vector similarity search

## Project Structure

```
├── client/
│   ├── pages/
│   │   ├── Index.tsx           # Homepage with upload interface
│   │   ├── Analysis.tsx        # Analysis results and chat page
│   │   └── NotFound.tsx        # 404 page
│   ├── components/ui/          # Reusable UI components
│   ├── App.tsx                 # App routing setup
│   ├── global.css              # Global styles & theme
│   └── vite-env.d.ts           # Vite environment types
│
├── server/
│   ├── services/
│   │   ├── document-processor.ts  # PDF/TXT parsing & chunking
│   │   └── rag-service.ts        # RAG analysis & Q&A logic
│   ├── routes/
│   │   ├── analyze.ts           # File upload endpoint
│   │   ├── analysis.ts          # Analysis retrieval & chat
│   │   └── demo.ts              # Demo endpoint
│   └── index.ts                 # Express server setup
│
├── shared/
│   └── api.ts                   # Shared type definitions
│
├── samples/
│   ├── sample-resume-1.txt      # Software Engineer resume
│   ├── sample-jd-1.txt          # Software Engineer job description
│   ├── sample-resume-2.txt      # Product Designer resume
│   └── sample-jd-2.txt          # Product Designer job description
│
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind theme config
└── tsconfig.json                # TypeScript config
```

## Installation

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start development server:**

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173`

3. **Type checking:**

   ```bash
   pnpm typecheck
   ```

4. **Run tests:**

   ```bash
   pnpm test
   ```

5. **Build for production:**

   ```bash
   pnpm build
   ```

6. **Start production server:**
   ```bash
   pnpm start
   ```

## API Documentation

### 1. Upload & Analyze Resume

**Endpoint:** `POST /api/analyze`

**Request:**

```
Form Data:
- resume: File (PDF or TXT)
- jobDescription: File (PDF or TXT)
```

**Response:**

```json
{
  "id": "abc12345",
  "matchScore": 75,
  "strengths": [
    "5 years React/Node.js experience",
    "Strong backend architecture skills"
  ],
  "gaps": ["No Kubernetes experience", "Limited AWS exposure"],
  "assessment": "This candidate is an excellent match..."
}
```

### 2. Get Analysis Results

**Endpoint:** `GET /api/analysis/:id`

**Response:**

```json
{
  "id": "abc12345",
  "matchScore": 75,
  "strengths": [...],
  "gaps": [...],
  "assessment": "..."
}
```

### 3. Ask a Question (RAG Chat)

**Endpoint:** `POST /api/chat/:id`

**Request:**

```json
{
  "question": "Does this candidate have experience with React?"
}
```

**Response:**

```json
{
  "answer": "Yes, the candidate has 5 years of React experience...",
  "question": "Does this candidate have experience with React?"
}
```

## How RAG Works in This Application

### Overview

Retrieval-Augmented Generation combines document retrieval with language understanding to provide accurate, context-aware answers about resumes.

### Process Flow

1. **Document Processing**
   - Extract text from uploaded resume (PDF or TXT)
   - Split text into logical chunks (sentences/paragraphs)

2. **Embedding Generation**
   - Convert each chunk into a vector embedding
   - Uses simple TF-IDF based embeddings for efficiency
   - Each embedding captures semantic meaning of the chunk

3. **Storage**
   - Store chunks with their embeddings in memory
   - Maintain mapping between vectors and original text

4. **Retrieval**
   - When user asks a question, convert it to embedding
   - Search vector store using cosine similarity
   - Retrieve top-3 most relevant resume chunks
   - Calculate similarity scores (0-1 range)

5. **Augmentation & Generation**
   - Pass retrieved context + question to generation logic
   - Generate answer based on:
     - Retrieved resume content
     - Question-specific logic
     - Job description context

### Example

**Question:** "Does this candidate have a degree from a state university?"

**RAG Process:**

1. Convert question to embedding
2. Search for matching chunks about education
3. Retrieve: "Bachelor of Science in Computer Science from State University"
4. Generate: "Yes, the candidate has a degree from State University"

## Features

### Match Analysis

- **Match Score**: Percentage based on skill/experience alignment
- **Strengths**: Key qualifications matching job requirements
- **Gaps**: Missing skills or experience
- **Assessment**: Overall candidate evaluation

### Intelligent Chat

- **RAG-Powered**: Answers based on actual resume content
- **Context-Aware**: Maintains conversation history
- **Multi-Turn**: Support for follow-up questions

### Supported File Formats

- PDF (.pdf)
- Plain Text (.txt)

## Sample Files

Test the application with included sample files:

### Sample 1: Software Engineer

- **Resume:** `samples/sample-resume-1.txt`
- **Job Description:** `samples/sample-jd-1.txt`

### Sample 2: Product Designer

- **Resume:** `samples/sample-resume-2.txt`
- **Job Description:** `samples/sample-jd-2.txt`

## Testing Instructions

1. **Upload Files:**
   - Navigate to homepage
   - Click "Click to upload" for resume
   - Select `samples/sample-resume-1.txt`
   - Click "Click to upload" for job description
   - Select `samples/sample-jd-1.txt`
   - Click "Analyze Documents"

2. **View Results:**
   - See match score displayed as percentage
   - Review strengths and gaps
   - Read overall assessment

3. **Ask Questions:**
   - Type question in chat box
   - Examples:
     - "Does this candidate have React experience?"
     - "What is their education background?"
     - "Do they have cloud experience?"
   - Press Enter or click send button

## Architecture Overview

### Frontend Flow

```
Upload Page (Index.tsx)
    ↓
[Upload Resume & JD]
    ↓
POST /api/analyze
    ↓
Analysis Page (Analysis.tsx)
    ↓
[Display Match Score & Insights]
    ↓
Chat Interface
    ↓
POST /api/chat/:id
    ↓
[Display AI Response]
```

### Backend Flow

```
File Upload
    ↓
[Extract Text from PDF/TXT]
    ↓
[Chunk Text into Segments]
    ↓
[Generate Embeddings]
    ↓
[Calculate Match Score]
    ↓
[Store in Memory]
    ↓
Response with Analysis ID
    ↓
Chat Question
    ↓
[Convert Question to Embedding]
    ↓
[Search Vector Store]
    ↓
[Retrieve Top Chunks]
    ↓
[Generate Answer]
    ↓
Response
```

## Performance Considerations

### Current Implementation

- **In-Memory Storage**: Fast retrieval, no database overhead
- **Simple Embeddings**: Efficient computation using TF-IDF
- **Cosine Similarity**: O(1) lookup time per comparison

### For Production

- Consider using:
  - **OpenAI Embeddings** for better semantic understanding
  - **Pinecone/Qdrant** for scalable vector storage
  - **PostgreSQL with pgvector** for persistent storage
  - **Redis** for session/conversation caching

## Known Limitations

1. **Embeddings**: Uses simple TF-IDF model. For production, use trained embeddings.
2. **Chat Responses**: Currently template-based. For production, integrate with:
   - OpenAI GPT
   - Anthropic Claude
   - Google Gemini
3. **Storage**: In-memory only. Data lost on server restart.
4. **File Size**: No size limits enforced. Consider adding validation.

## Future Enhancements

- [ ] Integration with commercial LLM APIs (OpenAI, Claude)
- [ ] Persistent database storage (PostgreSQL)
- [ ] Advanced vector database (Pinecone, Qdrant)
- [ ] User authentication and project management
- [ ] Bulk resume screening
- [ ] Export analysis results (PDF)
- [ ] Resume templates and suggestions
- [ ] Multi-language support
- [ ] Resume parsing improvements
- [ ] Interview preparation Q&A

## Deployment

### Netlify/Vercel

1. Connect your GitHub repository
2. Set build command: `pnpm build`
3. Set output directory: `dist`
4. Deploy automatically on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build
CMD ["pnpm", "start"]
```

### Environment Variables

```
VITE_API_URL=https://your-api.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal and commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Changelog

### v1.0.0 (Initial Release)

- Upload and analyze resumes
- Match score calculation
- Strengths and gaps identification
- RAG-powered Q&A chat
- Sample test files included

---

Built with ❤️ using React, Node.js, and TypeScript
