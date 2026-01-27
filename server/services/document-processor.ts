import pdfParse from "pdf-parse";

export interface DocumentChunk {
  text: string;
  embedding: number[];
  section?: string;
}

export async function extractTextFromPDF(
  fileBuffer: Buffer
): Promise<string> {
  const data = await pdfParse(fileBuffer);
  return data.text;
}

export function extractTextFromTxt(fileBuffer: Buffer): string {
  return fileBuffer.toString("utf-8");
}

export async function extractTextFromFile(
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractTextFromPDF(fileBuffer);
  } else if (mimeType === "text/plain") {
    return extractTextFromTxt(fileBuffer);
  }
  throw new Error("Unsupported file type");
}

export function chunkText(text: string, chunkSize: number = 500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Simple TF-IDF based embedding (for demonstration)
// In production, you'd use OpenAI embeddings or similar
export function simpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding: number[] = new Array(100).fill(0);

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % 100;
    embedding[index] += 1 / words.length;
  }

  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
