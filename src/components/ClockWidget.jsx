import { useState, useEffect } from "react";

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #0e7490, #22d3ee)", 
      color: "white", 
      padding: "1.5rem", 
      borderRadius: "1.5rem", 
      textAlign: "right"
    }}>
      <h4 style={{ fontSize: "2rem", fontWeight: "900", margin: 0 }}>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </h4>
      <p style={{ opacity: 0.8, fontSize: "0.85rem", margin: 0, textTransform: "capitalize" }}>
        {time.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </div>
  );
}