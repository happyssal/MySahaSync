import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"

const BADGES = [
  { id: "first_water", icon: "💧", label: "First Sip", desc: "Log water for the first time" },
  { id: "first_sleep", icon: "🌙", label: "First Rest", desc: "Log sleep for the first time" },
  { id: "first_med", icon: "💊", label: "First Dose", desc: "Take a medication for the first time" },
  { id: "water_week", icon: "🌊", label: "Hydration Week", desc: "Log water 7 days in a row" },
  { id: "sleep_week", icon: "😴", label: "Sleep Streak", desc: "Log sleep 7 days in a row" },
  { id: "good_sleep", icon: "⭐", label: "Quality Sleep", desc: "Sleep 7+ hours" },
  { id: "med_week", icon: "🏅", label: "Consistent", desc: "Take meds 7 days in a row" },
  { id: "all_today", icon: "🏆", label: "Perfect Day", desc: "Complete all trackers in one day" },
]

export default function Streaks() {
  const { user } = useAuth()
  const [waterLogs, setWaterLogs] = useState([])
  const [sleepLogs, setSleepLogs] = useState([])
  const [meds, setMeds] = useState([])
  const today = new Date().toLocaleDateString()

  useEffect(() => {
    const q1 = query(collection(db, "waterLogs"), where("uid", "==", user.uid))
    const q2 = query(collection(db, "sleepLogs"), where("uid", "==", user.uid))
    const q3 = query(collection(db, "medications"), where("uid", "==", user.uid))
    const u1 = onSnapshot(q1, s => setWaterLogs(s.docs.map(d => d.data())))
    const u2 = onSnapshot(q2, s => setSleepLogs(s.docs.map(d => d.data())))
    const u3 = onSnapshot(q3, s => setMeds(s.docs.map(d => d.data())))
    return () => { u1(); u2(); u3() }
  }, [user])

  const waterDates = [...new Set(waterLogs.map(l => l.date))]
  const sleepDates = [...new Set(sleepLogs.map(l => l.date))]
  const medDates = [...new Set(meds.flatMap(m => m.takenDates || []))]
  const todayWater = waterLogs.filter(l => l.date === today).reduce((s, l) => s + l.amount, 0)
  const todaySleep = sleepLogs.find(l => l.date === today)
  const todayMeds = meds.length > 0 && meds.every(m => (m.takenDates || []).includes(today))

  function calcStreak(dates) {
    let streak = 0
    const d = new Date()
    while (true) {
      const str = d.toLocaleDateString()
      if (dates.includes(str)) { streak++; d.setDate(d.getDate() - 1) }
      else break
    }
    return streak
  }

  const waterStreak = calcStreak(waterDates)
  const sleepStreak = calcStreak(sleepDates)
  const medStreak = calcStreak(medDates)

  function earned(id) {
    if (id === "first_water") return waterDates.length > 0
    if (id === "first_sleep") return sleepDates.length > 0
    if (id === "first_med") return medDates.length > 0
    if (id === "water_week") return waterStreak >= 7
    if (id === "sleep_week") return sleepStreak >= 7
    if (id === "good_sleep") return sleepLogs.some(l => l.hours >= 7)
    if (id === "med_week") return medStreak >= 7
    if (id === "all_today") return todayWater >= 8 && todaySleep?.hours >= 7 && todayMeds
    return false
  }

  return (
    <div>
      {/* Streak cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "💧 Water Streak", value: waterStreak, color: "#0ea5e9" },
          { label: "🌙 Sleep Streak", value: sleepStreak, color: "#6366f1" },
          { label: "💊 Med Streak", value: medStreak, color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: "1rem", padding: "1.25rem", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "800", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "500" }}>{s.label}</div>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>day streak</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <h2 style={{ fontWeight: "700", color: "#1e1b4b", marginBottom: "1rem" }}>Badges</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
          {BADGES.map(badge => {
            const got = earned(badge.id)
            return (
              <div key={badge.id} style={{ background: got ? "#fefce8" : "#f9fafb", borderRadius: "0.75rem", padding: "1rem", textAlign: "center", border: `1px solid ${got ? "#fde68a" : "#f3f4f6"}`, opacity: got ? 1 : 0.5 }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.25rem", filter: got ? "none" : "grayscale(1)" }}>{badge.icon}</div>
                <div style={{ fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>{badge.label}</div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>{badge.desc}</div>
                {got && <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#f59e0b", marginTop: "0.5rem" }}>✅ Earned!</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}