import { useState } from "react"
import { auth } from "../firebase"
import { signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

// Components
import SleepTracker from "../components/SleepTracker"
import WaterTracker from "../components/WaterTracker"
import MedTracker from "../components/MedTracker"
import Appointments from "../components/Appointments"
import Streaks from "../components/Streaks"
import Reminders from "../components/Reminders"
import ReminderSettings from "../components/ReminderSettings"
import AIAssistant from "../components/AIAssistant"
import ClockWidget from "../components/ClockWidget" 

const NAV = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "sleep", label: "Sleep", icon: "🌙" },
  { id: "water", label: "Hydration", icon: "💧" },
  { id: "meds", label: "Medication", icon: "💊" },
  { id: "appointments", label: "Appointments", icon: "📅" },
  { id: "streaks", label: "Streaks & Badges", icon: "🏆" },
  { id: "settings", label: "Reminders", icon: "⏰" },
]

export default function Dashboard() {
  const [active, setActive] = useState("overview")
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    toast.success("Logged out!")
    navigate("/login")
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0fdfa", fontFamily: "system-ui, sans-serif" }}>
      <Reminders />

      {/* Sidebar */}
      <div style={{
        width: "240px", background: "#0891b2", color: "white",
        display: "flex", flexDirection: "column", padding: "1.5rem 1rem",
        position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100,
        transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s"
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "2rem", textAlign: "center" }}>MySahaSync 🌿</h2>
        <nav style={{ flex: 1 }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setActive(item.id); setMenuOpen(false) }}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                border: "none", cursor: "pointer", marginBottom: "0.25rem",
                background: active === item.id ? "rgba(255,255,255,0.2)" : "transparent",
                color: "white", fontSize: "0.95rem", fontWeight: active === item.id ? "600" : "400",
                textAlign: "left"
              }}>
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1rem" }}>
          <p style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
             {user?.displayName || user?.email}
          </p>
          <button onClick={handleLogout}
            style={{ width: "100%", padding: "0.6rem", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "white", cursor: "pointer", fontSize: "0.9rem" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "1.5rem" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "#0891b2", border: "none", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>
            ☰
          </button>
          <h1 style={{ fontSize: "1.5rem", fontStyle: "italic", fontWeight: "900", color: "#0891b2", margin: 0 }}>
            MySahaSync 🌿
          </h1>
        </div>

        {/* Page content */}
        {active === "overview" && <Overview setActive={setActive} user={user} />}
        {active === "sleep" && <SleepTracker />}
        {active === "water" && <WaterTracker />}
        {active === "meds" && <MedTracker />}
        {active === "appointments" && <Appointments />}
        {active === "streaks" && <Streaks />}
        {active === "settings" && <ReminderSettings />}
      </div>
    </div>
  )
}

function Overview({ setActive, user }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "center" }}>
        <div>
           <h2 style={{ color: "#164e63", fontWeight: "800", fontSize: "1.8rem", margin: 0 }}>
             Hello, {user?.displayName?.split(' ')[0] || "Friend"}! 👋
           </h2>
           <p style={{ color: "#6b7280", margin: 0 }}>Ready to track your health today?</p>
        </div>
        <ClockWidget />
      </div>

      <AIAssistant />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Sleep", icon: "🌙", id: "sleep", color: "#6366f1" },
          { label: "Hydration", icon: "💧", id: "water", color: "#0ea5e9" },
          { label: "Medication", icon: "💊", id: "meds", color: "#10b981" },
          { label: "Appointments", icon: "📅", id: "appointments", color: "#f59e0b" },
          { label: "Streaks", icon: "🏆", id: "streaks", color: "#ef4444" },
          { label: "Reminders", icon: "⏰", id: "settings", color: "#0891b2" },
        ].map(card => (
          <button key={card.id} onClick={() => setActive(card.id)}
            style={{
              background: "white", border: "none", borderRadius: "1rem",
              padding: "1.2rem 1rem", cursor: "pointer", textAlign: "center",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)", transition: "transform 0.15s"
            }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{card.icon}</div>
            <div style={{ fontWeight: "700", color: card.color, fontSize: "0.85rem" }}>{card.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}