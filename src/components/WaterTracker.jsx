import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

const GOAL = 8

export default function WaterTracker() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [custom, setCustom] = useState("")
  const today = new Date().toLocaleDateString("en-CA").split("T")[0]

  useEffect(() => {
    const q = query(
      collection(db, "waterLogs"),
      where("uid", "==", user.uid),
      where("date", "==", today),
      orderBy("createdAt", "desc")
    )
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user, today])

  const todayCount = logs.reduce((sum, l) => sum + l.amount, 0)
  const pct = Math.min((todayCount / GOAL) * 100, 100)

  async function addWater(amount) {
    await addDoc(collection(db, "waterLogs"), {
      uid: user.uid,
      amount,
      date: today,
      createdAt: Timestamp.now()
    })
    toast.success(`+${amount} glass${amount > 1 ? "es" : ""} logged!`)
  }

  async function removeWater(id) {
    await deleteDoc(doc(db, "waterLogs", id))
    toast.success("Removed!")
  }

  return (
    <div>
      <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", textAlign: "center" }}>
        <h2 style={{ fontWeight: "700", color: "#164e63", marginBottom: "0.5rem" }}>Today's Hydration</h2>
        <div style={{ fontSize: "3rem", fontWeight: "800", color: "#0891b2" }}>
          {todayCount} <span style={{ fontSize: "1.2rem", color: "#9ca3af" }}>/ {GOAL} glasses</span>
        </div>

        <div style={{ background: "#e0f2fe", borderRadius: "999px", height: "16px", margin: "1rem 0", overflow: "hidden" }}>
          <div style={{ background: "#0891b2", height: "100%", width: `${pct}%`, borderRadius: "999px", transition: "width 0.4s" }} />
        </div>

        <p style={{ color: pct >= 100 ? "#10b981" : "#6b7280", fontWeight: "600" }}>
          {pct >= 100 ? "🎉 Goal reached! Great job!" : `${GOAL - todayCount} more to reach your goal`}
        </p>

        {/* Quick add buttons */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.25rem" }}>
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => addWater(n)}
              style={{ background: "#e0f2fe", border: "none", borderRadius: "0.75rem", padding: "0.75rem 1.25rem", fontSize: "1rem", color: "#0369a1", fontWeight: "600", cursor: "pointer" }}>
              +{n} 💧
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <input
            type="number" min="1" max="20"
            placeholder="Custom glasses..."
            value={custom}
            onChange={e => setCustom(e.target.value)}
            style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "1rem" }}
          />
          <button onClick={() => { if (custom) { addWater(parseInt(custom)); setCustom("") } }}
            style={{ background: "#0891b2", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.75rem 1rem", cursor: "pointer", fontWeight: "600" }}>
            Add
          </button>
        </div>
      </div>

      {/* Today's log with delete */}
      <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <h3 style={{ fontWeight: "700", color: "#164e63", marginBottom: "1rem" }}>Today's Log</h3>
        {logs.length === 0 && <p style={{ color: "#9ca3af", textAlign: "center" }}>No logs yet today</p>}
        {logs.map(log => (
          <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              {log.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || ""}
            </span>
            <span style={{ fontWeight: "600", color: "#0891b2" }}>+{log.amount} 💧</span>
            <button onClick={() => removeWater(log.id)}
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.1rem" }}>🗑</button>
          </div>
        ))}
      </div>
    </div>
  )
}