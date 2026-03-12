import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Papa from "papaparse";
import ReactMarkdown from "react-markdown";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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
        Analyze this ad creative data and provide a report with exactly these 5 sections using markdown:

        ## 🏆 Top Winners
        Which creatives are performing best and exactly why — be specific with numbers.

        ## ⚠️ Fatigue Alerts
        Which creatives are declining or underperforming and need to be replaced.

        ## 🔍 Key Patterns
        What patterns make winning creatives different from losing ones.

        ## 🚀 Recommendations
        Exactly what to do next — specific, actionable, numbered list.

        ## 🇮🇳 India Market Insight
        How these patterns apply to Indian D2C brands like boAt, Mamaearth, Myntra spending on Meta and YouTube.

        Be data-driven, specific, and actionable. Use bold for key metrics.

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

  const sections = insights
    ? insights.split("##").filter(Boolean).map((s) => "##" + s)
    : [];

  const sectionColors = [
    { border: "#6366f1", bg: "#1e1e35" },
    { border: "#f59e0b", bg: "#1e1a10" },
    { border: "#8b5cf6", bg: "#1a1525" },
    { border: "#10b981", bg: "#0f1e18" },
    { border: "#f97316", bg: "#1e150f" },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.badge}>AI-Powered • Inspired by Motion</div>
        <h1 style={styles.title}>CreativeIQ</h1>
        <p style={styles.subtitle}>
          Upload your ad creative data and get AI-powered intelligence on
          what's winning, what's fatiguing, and what to do next.
        </p>
      </div>

      {/* Upload Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📊 Upload Ad Creative Data</h2>
        <p style={styles.hint}>
          CSV with columns: creative_name, spend, impressions, clicks, ctr,
          roas, format, platform
        </p>
        <label style={styles.uploadLabel}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          {fileName ? `✅ ${fileName} — ${csvData?.length} rows loaded` : "📁 Choose CSV File"}
        </label>
        <button
          onClick={analyzeCreatives}
          disabled={!csvData || loading}
          style={!csvData || loading ? styles.buttonDisabled : styles.button}
        >
          {loading ? "🤖 Analyzing your creatives..." : "⚡ Analyze Creatives"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.loadingCard}>
          <div style={styles.loadingDot} />
          <p style={styles.loadingText}>
            AI agent is processing your creative data...
          </p>
        </div>
      )}

      {/* Results */}
      {insights && !loading && (
        <div>
          <h2 style={styles.reportTitle}>Creative Intelligence Report</h2>
          {sections.length > 1
            ? sections.map((section, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.insightCard,
                    borderLeft: `4px solid ${sectionColors[i % sectionColors.length].border}`,
                    backgroundColor: sectionColors[i % sectionColors.length].bg,
                  }}
                >
                  <ReactMarkdown>{section}</ReactMarkdown>
                </div>
              ))
            : (
                <div style={styles.insightCard}>
                  <ReactMarkdown>{insights}</ReactMarkdown>
                </div>
              )}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <p>Built by <strong>Rohit Thakur</strong> — inspired by Motion's creative intelligence platform</p>
        <p style={{ color: "#4b5563", fontSize: "12px", marginTop: "4px" }}>
          India's D2C ad market needs this. Motion, let's talk.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0f",
    color: "#e2e8f0",
    fontFamily: "'Inter', sans-serif",
    padding: "40px 20px",
    maxWidth: "860px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "48px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#1e1e35",
    border: "1px solid #6366f1",
    color: "#6366f1",
    fontSize: "12px",
    fontWeight: "600",
    padding: "6px 16px",
    borderRadius: "999px",
    marginBottom: "16px",
    letterSpacing: "0.05em",
  },
  title: {
    fontSize: "56px",
    fontWeight: "900",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 16px 0",
    letterSpacing: "-2px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "16px",
    maxWidth: "560px",
    margin: "0 auto",
    lineHeight: "1.7",
  },
  card: {
    backgroundColor: "#13131a",
    borderRadius: "20px",
    padding: "36px",
    marginBottom: "24px",
    border: "1px solid #2d2d3d",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#f1f5f9",
  },
  hint: {
    color: "#4b5563",
    fontSize: "13px",
    marginBottom: "24px",
  },
  uploadLabel: {
    display: "block",
    border: "2px dashed #2d2d3d",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "16px",
    transition: "all 0.2s",
  },
  button: {
    backgroundColor: "#6366f1",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "16px 32px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
    letterSpacing: "0.02em",
  },
  buttonDisabled: {
    backgroundColor: "#1e1e2e",
    color: "#4b5563",
    border: "none",
    borderRadius: "12px",
    padding: "16px 32px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "not-allowed",
    width: "100%",
  },
  loadingCard: {
    backgroundColor: "#13131a",
    borderRadius: "20px",
    padding: "32px",
    marginBottom: "24px",
    border: "1px solid #2d2d3d",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  loadingDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    flexShrink: 0,
  },
  loadingText: {
    color: "#6366f1",
    fontSize: "15px",
    margin: 0,
  },
  reportTitle: {
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "20px",
    color: "#f1f5f9",
  },
  insightCard: {
    borderRadius: "16px",
    padding: "28px 32px",
    marginBottom: "16px",
    border: "1px solid #2d2d3d",
    lineHeight: "1.8",
    fontSize: "14px",
  },
  footer: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "13px",
    marginTop: "60px",
    paddingTop: "24px",
    borderTop: "1px solid #1e1e2e",
  },
};