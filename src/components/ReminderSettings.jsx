import { useState, useEffect } from "react"
import toast from "react-hot-toast"

export default function ReminderSettings() {
  const [bedtime, setBedtime] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("vf_bedtime")
    if (stored) setBedtime(stored)
  }, [])

  function save() {
    if (!bedtime) return toast.error("Please set a bedtime")
    localStorage.setItem("vf_bedtime", bedtime)
    setSaved(true)
    toast.success("Reminder settings saved!")
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: "1rem" }}>
      <h2 style={{ fontWeight: "700", color: "#1e1b4b", marginBottom: "0.5rem" }}>⏰ Reminder Settings</h2>
      <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
        Set your target bedtime — you'll get a reminder 30 minutes before. Water reminders are automatic every 2 hours from 8am to 10pm. Medication reminders fire automatically at the time you set for each med.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "0.4rem" }}>
          🌙 Target bedtime
        </label>
        <input
          type="time"
          value={bedtime}
          onChange={e => setBedtime(e.target.value)}
          style={{ padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "1rem", width: "200px" }}
        />
      </div>

      <button onClick={save}
        style={{ background: saved ? "#10b981" : "#4f46e5", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.75rem 1.5rem", fontWeight: "600", cursor: "pointer", fontSize: "0.95rem" }}>
        {saved ? "✅ Saved!" : "Save Settings"}
      </button>

      <div style={{ marginTop: "1.5rem", background: "#f8fafc", borderRadius: "0.75rem", padding: "1rem" }}>
        <p style={{ fontWeight: "600", color: "#374151", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Active reminders:</p>
        <div style={{ fontSize: "0.85rem", color: "#6b7280", lineHeight: "2" }}>
          💧 Water — every 2h from 8:00 to 22:00<br />
          🌙 Bedtime — 30 min before {bedtime || "your set time"}<br />
          💊 Medications — at the time set for each med
        </div>
      </div>
    </div>
  )
}