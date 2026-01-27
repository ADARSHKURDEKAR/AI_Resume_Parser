import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Send } from "lucide-react";

interface AnalysisData {
  id: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  assessment: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Analysis() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch analysis on mount
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analysis/${id}`);
        if (!response.ok) throw new Error("Failed to fetch analysis");
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !id) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch(`/api/chat/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your question. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Analyzing documents...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load analysis</p>
          <Link to="/">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const scoreColor =
    analysis.matchScore >= 75
      ? "text-green-600"
      : analysis.matchScore >= 50
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
              <span className="text-slate-600">Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              Analysis Results
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Match Score Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">
                Match Analysis
              </h2>

              {/* Score Display */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(analysis.matchScore / 100) * 439.8} 439.8`}
                      className={scoreColor}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${scoreColor}`}>
                      {analysis.matchScore}%
                    </span>
                    <span className="text-sm text-slate-600">Match</span>
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-slate-700 text-center leading-relaxed">
                  {analysis.assessment}
                </p>
              </div>

              {/* Strengths */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-green-600">✓</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <span className="text-green-600 font-bold mt-0.5">•</span>
                      <span className="text-slate-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-orange-600">!</span> Gaps & Improvements
                </h3>
                <ul className="space-y-2">
                  {analysis.gaps.map((gap, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <span className="text-orange-600 font-bold mt-0.5">
                        •
                      </span>
                      <span className="text-slate-700">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Ask Questions</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Ask anything about the candidate
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    <p className="text-sm">
                      Start by asking a question about the candidate...
                    </p>
                  </div>
                )}

                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-lg px-4 py-2 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !chatLoading) {
                        handleSendMessage();
                      }
                    }}
                    disabled={chatLoading}
                    className="text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !inputValue.trim()}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
