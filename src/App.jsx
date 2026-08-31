import { useState } from "react";
import A2EconomicsExpansion from "./apps/A2EconomicsExpansion.jsx";

const cardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E8E0D0",
  borderRadius: 14,
  padding: "24px 28px",
  marginBottom: 18,
  cursor: "pointer",
  transition: "box-shadow 0.15s ease, transform 0.1s ease",
};

export default function App() {
  const [current, setCurrent] = useState(null);

  if (current === "a2-economics") return <A2EconomicsExpansion onBack={() => setCurrent(null)} />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAF6ED",
      padding: "48px 20px",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 34,
          fontWeight: 500,
          color: "#1F1B16",
          margin: "0 0 8px 0",
          letterSpacing: "-0.02em"
        }}>
          ✍️ Writing Practice
        </h1>
        <p style={{ fontSize: 15, color: "#6B5D54", marginBottom: 36, lineHeight: 1.6 }}>
          Choose an exercise to begin.
        </p>

        <div
          style={cardStyle}
          onClick={() => setCurrent("a2-economics")}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
          <div style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 22,
            fontWeight: 500,
            color: "#1F1B16",
            marginBottom: 6
          }}>
            Business Expansion Report
          </div>
          <div style={{ fontSize: 14.5, color: "#6B5D54", lineHeight: 1.55 }}>
            Write a three-paragraph business expansion report recommending a country for an Israeli company. Earn up to 100 points.
          </div>
        </div>
      </div>
    </div>
  );
}
