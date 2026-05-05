import { useState } from "react";
import toast from "react-hot-toast";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!prompt.trim()) return;
    if (!API_KEY) return toast.error("API Key missing! Check your .env file.");

    setLoading(true);
    setResponse("");

    const models = [
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
    ];

    let lastError = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are SahaAI, a friendly health assistant for SahaSync app.
Answer health questions briefly and clearly in 2-3 sentences max.
Do not give medical diagnoses. Always suggest consulting a doctor for serious concerns.
Question: ${prompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 256,
            }
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          // If quota exceeded, try next model
          if (res.status === 429 || data.error?.status === "RESOURCE_EXHAUSTED") {
            lastError = data.error?.message;
            continue;
          }
          throw new Error(data.error?.message || "API request failed");
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          setResponse(text);
          setPrompt("");
          return; // success — stop trying
        } else {
          throw new Error("Empty response from AI");
        }

      } catch (error) {
        lastError = error.message;
        // Only continue loop on quota errors
        if (!error.message?.includes("quota") && !error.message?.includes("RESOURCE_EXHAUSTED")) {
          break;
        }
      }
    }

    // All models failed
    console.error("All models failed:", lastError);
    toast.error("AI unavailable right now. Try again later.");
    setLoading(false);
  }

  // Wrap askAI to always reset loading
  async function handleAsk() {
    try {
      await askAI();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "white", padding: "1.5rem", borderRadius: "1.5rem",
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb"
    }}>
      <h3 style={{
        fontSize: "0.8rem", fontWeight: "800", color: "#0891b2",
        textTransform: "uppercase", margin: "0 0 0.75rem"
      }}>
        SahaAI Assistant ✨
      </h3>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
          placeholder="Ask me about your health today..."
          style={{
            flex: 1, padding: "0.85rem 1.25rem", borderRadius: "1rem",
            border: "1px solid #e5e7eb", outline: "none", fontSize: "0.95rem"
          }}
        />
        <button
          onClick={handleAsk}
          disabled={loading || !prompt.trim()}
          style={{
            background: loading ? "#9ca3af" : "#0891b2",
            color: "white", padding: "0 1.5rem", borderRadius: "1rem",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold", fontSize: "0.95rem", minWidth: "70px"
          }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>

      {response && (
        <div style={{
          marginTop: "1rem", padding: "1rem", background: "#f0fdf4",
          borderRadius: "1rem", color: "#164e63", fontSize: "0.9rem",
          lineHeight: "1.6", borderLeft: "4px solid #10b981"
        }}>
          <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "700", marginBottom: "0.5rem" }}>
            SahaAI ✨
          </div>
          {response}
        </div>
      )}

      <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.75rem 0 0" }}>
        💡 Not a substitute for professional medical advice.
      </p>
    </div>
  );
}