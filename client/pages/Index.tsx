import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";

export default function Index() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "jd"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["application/pdf", "text/plain"].includes(file.type)) {
      setError("Please upload PDF or TXT files only");
      return;
    }

    setError("");
    if (type === "resume") {
      setResumeFile(file);
    } else {
      setJobDescriptionFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!resumeFile || !jobDescriptionFile) {
      setError("Please upload both resume and job description");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescriptionFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze documents");
      }

      const data = await response.json();
      // Navigate to analysis page with the analysis ID
      window.location.href = `/analysis/${data.id}`;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during upload"
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FileUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Resume Screening
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            AI-Powered Resume Analysis
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload a resume and job description to get instant match analysis,
            key insights, and ask questions about the candidate using AI
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="space-y-8">
            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Step 1: Upload Resume
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => handleFileSelect(e, "resume")}
                  className="hidden"
                  id="resume-input"
                />
                <label
                  htmlFor="resume-input"
                  className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition"
                >
                  <FileUp className="w-12 h-12 text-blue-500 mb-3" />
                  <span className="text-center">
                    <span className="font-semibold text-slate-900">
                      Click to upload
                    </span>
                    <span className="text-slate-600"> or drag and drop</span>
                  </span>
                  <span className="text-sm text-slate-500 mt-1">
                    PDF or TXT format
                  </span>
                </label>
              </div>
              {resumeFile && (
                <div className="mt-3 flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-sm text-slate-700">{resumeFile.name}</span>
                </div>
              )}
            </div>

            {/* Job Description Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Step 2: Upload Job Description
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => handleFileSelect(e, "jd")}
                  className="hidden"
                  id="jd-input"
                />
                <label
                  htmlFor="jd-input"
                  className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition"
                >
                  <FileUp className="w-12 h-12 text-blue-500 mb-3" />
                  <span className="text-center">
                    <span className="font-semibold text-slate-900">
                      Click to upload
                    </span>
                    <span className="text-slate-600"> or drag and drop</span>
                  </span>
                  <span className="text-sm text-slate-500 mt-1">
                    PDF or TXT format
                  </span>
                </label>
              </div>
              {jobDescriptionFile && (
                <div className="mt-3 flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-sm text-slate-700">
                    {jobDescriptionFile.name}
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !resumeFile || !jobDescriptionFile}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Documents"
              )}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Match Score</h3>
            <p className="text-sm text-slate-600">
              Get an instant match percentage between resume and job requirements
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Key Insights</h3>
            <p className="text-sm text-slate-600">
              Understand strengths, gaps, and overall candidate assessment
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">AI Chat</h3>
            <p className="text-sm text-slate-600">
              Ask follow-up questions about the candidate with RAG-powered answers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
