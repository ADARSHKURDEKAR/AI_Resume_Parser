import { RequestHandler } from "express";
import { getAnalysis, askQuestion } from "../services/rag-service";

export const handleGetAnalysis: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const analysis = getAnalysis(id);

    if (!analysis) {
      res.status(404).json({ error: "Analysis not found" });
      return;
    }

    res.json({
      id: analysis.id,
      matchScore: analysis.matchScore,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      assessment: analysis.assessment,
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch analysis",
    });
  }
};

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      res.status(400).json({ error: "Missing or invalid question" });
      return;
    }

    const answer = await askQuestion(id, question);

    res.json({
      answer,
      question,
    });
  } catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to process question",
    });
  }
};
