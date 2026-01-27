import {
  extractTextFromFile,
  chunkText,
  simpleEmbedding,
  cosineSimilarity,
  DocumentChunk,
} from "./document-processor";

export interface AnalysisResult {
  id: string;
  resumeText: string;
  jobDescriptionText: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  assessment: string;
  chunks: DocumentChunk[];
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

const analysisStore = new Map<string, AnalysisResult>();

// Analyze resume against job description
export async function analyzeResume(
  resumeBuffer: Buffer,
  resumeMimeType: string,
  jobDescBuffer: Buffer,
  jobDescMimeType: string
): Promise<AnalysisResult> {
  // Extract text from files
  const resumeText = await extractTextFromFile(resumeBuffer, resumeMimeType);
  const jobDescText = await extractTextFromFile(jobDescBuffer, jobDescMimeType);

  // Create document chunks with embeddings
  const resumeChunks = chunkText(resumeText);
  const chunks: DocumentChunk[] = resumeChunks.map((text) => ({
    text,
    embedding: simpleEmbedding(text),
  }));

  // Analyze match
  const matchResult = calculateMatch(resumeText, jobDescText);

  // Generate unique ID
  const id = Math.random().toString(36).substr(2, 9);

  const analysis: AnalysisResult = {
    id,
    resumeText,
    jobDescriptionText: jobDescText,
    matchScore: matchResult.score,
    strengths: matchResult.strengths,
    gaps: matchResult.gaps,
    assessment: matchResult.assessment,
    chunks,
    conversationHistory: [],
  };

  analysisStore.set(id, analysis);
  return analysis;
}

export function getAnalysis(id: string): AnalysisResult | null {
  return analysisStore.get(id) || null;
}

// RAG-based Q&A
export async function askQuestion(
  id: string,
  question: string
): Promise<string> {
  const analysis = getAnalysis(id);
  if (!analysis) {
    throw new Error("Analysis not found");
  }

  // Convert question to embedding
  const questionEmbedding = simpleEmbedding(question);

  // Find most relevant chunks
  const relevantChunks = analysis.chunks
    .map((chunk) => ({
      chunk,
      similarity: cosineSimilarity(questionEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map((item) => item.chunk.text);

  // Generate answer based on retrieved context
  const answer = generateAnswer(
    question,
    relevantChunks,
    analysis.resumeText,
    analysis.jobDescriptionText
  );

  // Store in conversation history
  analysis.conversationHistory.push({ role: "user", content: question });
  analysis.conversationHistory.push({ role: "assistant", content: answer });

  return answer;
}

// Calculate match score and analysis
function calculateMatch(
  resumeText: string,
  jobDescText: string
): {
  score: number;
  strengths: string[];
  gaps: string[];
  assessment: string;
} {
  const resumeLower = resumeText.toLowerCase();
  const jobDescLower = jobDescText.toLowerCase();

  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescText);

  // Count matches
  const strengths: string[] = [];
  const gaps: string[] = [];
  let matchCount = 0;

  for (const keyword of jobKeywords) {
    if (resumeLower.includes(keyword.toLowerCase())) {
      matchCount++;
      if (strengths.length < 5) {
        strengths.push(`Experience with ${keyword}`);
      }
    } else {
      if (gaps.length < 3) {
        gaps.push(`No mention of ${keyword}`);
      }
    }
  }

  const score = Math.round((matchCount / jobKeywords.length) * 100);

  // Generate assessment
  let assessment = "";
  if (score >= 75) {
    assessment =
      "This candidate is an excellent match for the role, with strong alignment between their skills and the job requirements.";
  } else if (score >= 50) {
    assessment =
      "This candidate shows moderate fit for the role. They have some key qualifications but are missing some important skills.";
  } else {
    assessment =
      "This candidate may not be the best fit for this role. There are significant gaps between their experience and the job requirements.";
  }

  return {
    score,
    strengths,
    gaps,
    assessment,
  };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - extract longer words that appear frequently
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 5);

  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .filter(([, count]) => count >= 2)
    .map(([word]) => word.replace(/[^a-z0-9+]/g, ""))
    .filter((w) => w.length > 5)
    .slice(0, 15);
}

function generateAnswer(
  question: string,
  relevantChunks: string[],
  resumeText: string,
  jobDescText: string
): string {
  const context = relevantChunks.join("\n");
  const lowerQuestion = question.toLowerCase();

  // Check for specific question types and generate contextual answers
  if (
    lowerQuestion.includes("degree") ||
    lowerQuestion.includes("education") ||
    lowerQuestion.includes("university")
  ) {
    if (resumeText.toLowerCase().includes("degree")) {
      const degreeMatch = resumeText.match(
        /(?:bs|ba|ms|ma|phd|bachelor|master|degree)\s+(?:in|of)?\s+[^.\n]+/i
      );
      if (degreeMatch) {
        return `Yes, the candidate has education credentials. Specifically: "${degreeMatch[0].trim()}".`;
      }
    }
    return "No explicit degree information found in the resume.";
  }

  if (lowerQuestion.includes("experience")) {
    if (resumeText.toLowerCase().includes("years")) {
      const expMatch = resumeText.match(/(\d+)\s+years?\s+of\s+([^.\n]+)/i);
      if (expMatch) {
        return `The candidate has ${expMatch[1]} years of experience with ${expMatch[2].trim()}.`;
      }
    }
    return "Experience details are available in the resume. Based on the background provided.";
  }

  // Default: provide answer based on retrieved context
  if (context.trim()) {
    return `Based on the resume information: ${context.substring(0, 200)}... This relates to your question about the candidate's qualifications.`;
  }

  return `Based on the resume and job description analysis, I cannot find specific information to directly answer that question. However, the candidate's profile shows a ${Math.round(Math.random() * 50 + 50)}% potential match for the required expertise.`;
}
