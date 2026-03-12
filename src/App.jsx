import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Papa from "papaparse";

const genAI = new GoogleGenerativeAI("AIzaSyDPm2FDRMH1--4caOHOHQf5gezOEl2WoI4");

export default function App() {
  const [csvData, setCsvData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      complete: (results) => setCsvData(results.data),
    });
  };

  const analyzeCreatives = async () => {
    if (!csvData) return;
    setLoading(true);
    setInsights(null);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are a creative performance analyst AI similar to Motion's intelligence platform.
        Analyze this ad creative data and provide:
        1. TOP WINNERS - Which creatives are performing best and why
        2. FATIGUE ALERTS - Which creatives are declining and need to be replaced
        3. KEY PATTERNS - What patterns make winning creatives different
        4. RECOMMENDATIONS - Exactly what to do next to improve performance
        5. INDIA MARKET INSIGHT - How these patterns might apply to Indian D2C brands

        Be specific, data-driven, and actionable. Format your response clearly with each section.

        Data: ${JSON.stringify(csvData.slice(0, 10))}
      `;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setInsights(text);
    } catch (err) {
      setInsights("Error analyzing data. Check your API key and try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>CreativeIQ</h1>
        <p style={styles.subtitle}>
          AI-powered creative intelligence — inspired by Motion
        </p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Upload Ad Creative Data</h2>
        <p style={styles.hint}>
          Upload a CSV with columns like: creative_name, spend, impressions,
          clicks, ctr, roas, format, platform
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={styles.fileInput}
        />
        {fileName && (
          <p style={styles.fileName}>✅ Loaded: {fileName} — {csvData?.length} rows</p>
        )}
        <button
          onClick={analyzeCreatives}
          disabled={!csvData || loading}
          style={!csvData || loading ? styles.buttonDisabled : styles.button}
        >
          {loading ? "Analyzing..." : "Analyze Creatives ⚡"}
        </button>
      </div>

      {loading && (
        <div style={styles.card}>
          <p style={styles.loading}>
            🤖 AI agent is analyzing your creative data...
          </p>
        </div>
      )}

      {insights && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Creative Intelligence Report</h2>
          <pre style={styles.insights}>{insights}</pre>
        </div>
      )}

      <div style={styles.footer}>
        <p>Built by Rohit Thakur — inspired by Motion's creative intelligence platform</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f0f13",
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    padding: "40px 20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 10px 0",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: "16px",
  },
  card: {
    backgroundColor: "#1a1a24",
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "24px",
    border: "1px solid #2d2d3d",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#e2e8f0",
  },
  hint: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "20px",
  },
  fileInput: {
    display: "block",
    marginBottom: "16px",
    color: "#9ca3af",
    fontSize: "14px",
  },
  fileName: {
    color: "#6366f1",
    fontSize: "14px",
    marginBottom: "16px",
  },
  button: {
    backgroundColor: "#6366f1",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: "#2d2d3d",
    color: "#6b7280",
    border: "none",
    borderRadius: "10px",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "not-allowed",
    width: "100%",
  },
  loading: {
    textAlign: "center",
    color: "#6366f1",
    fontSize: "16px",
  },
  insights: {
    whiteSpace: "pre-wrap",
    color: "#e2e8f0",
    fontSize: "14px",
    lineHeight: "1.8",
    fontFamily: "'Inter', sans-serif",
  },
  footer: {
    textAlign: "center",
    color: "#4b5563",
    fontSize: "13px",
    marginTop: "40px",
  },
};