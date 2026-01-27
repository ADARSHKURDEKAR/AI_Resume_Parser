import { RequestHandler } from "express";
import multer from "multer";
import { analyzeResume } from "../services/rag-service";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.fields([
  { name: "resume", maxCount: 1 },
  { name: "jobDescription", maxCount: 1 },
]);

export const handleAnalyze: RequestHandler = async (req, res) => {
  try {
    const files = req.files as Record<
      string,
      Express.Multer.File[] | undefined
    >;

    if (!files.resume || !files.jobDescription) {
      res.status(400).json({ error: "Missing resume or job description" });
      return;
    }

    const resumeFile = files.resume[0];
    const jobDescFile = files.jobDescription[0];

    const analysis = await analyzeResume(
      resumeFile.buffer,
      resumeFile.mimetype,
      jobDescFile.buffer,
      jobDescFile.mimetype
    );

    res.json({
      id: analysis.id,
      matchScore: analysis.matchScore,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      assessment: analysis.assessment,
    });
  } catch (error) {
    console.error("Error analyzing documents:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to analyze documents",
    });
  }
};
