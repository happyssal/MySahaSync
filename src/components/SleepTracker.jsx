import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

export default function SleepTracker() {
  const { user } = useAuth()
  const [bedtime, setBedtime] = useState("")
  const [wakeup, setWakeup] = useState("")
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, "sleepLogs"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    )
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user])

  function calcHours(bed, wake) {
    const [bh, bm] = bed.split(":").map(Number)
    const [wh, wm] = wake.split(":").map(Number)
    let mins = (wh * 60 + wm) - (bh * 60 + bm)
    if (mins < 0) mins += 24 * 60
    return (mins / 60).toFixed(1)
  }

  async function handleLog() {
    if (!bedtime || !wakeup) return toast.error("Please enter both times")
    setLoading(true)
    try {
      const hours = parseFloat(calcHours(bedtime, wakeup))
      await addDoc(collection(db, "sleepLogs"), {
        uid: user.uid,
        bedtime,
        wakeup,
        hours,
        createdAt: Timestamp.now(),
        date: new Date().toLocaleDateString()
      })
      toast.success(`Logged ${hours}h of sleep!`)
      setBedtime("")
      setWakeup("")
    } catch (err) {
      toast.error("Failed to save, try again")
      console.error(err)
    }
    setLoading(false)
  }

  async function deleteLog(id) {
    try {
      await deleteDoc(doc(db, "sleepLogs", id))
      toast.success("Log removed")
    } catch (err) {
      toast.error("Could not delete log")
    }
  }

  function getColor(h) {
    if (h >= 7) return "#10b981"
    if (h >= 5) return "#f59e0b"
    return "#ef4444"
  }

  const preview = bedtime && wakeup ? calcHours(bedtime, wakeup) : null

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Input Card */}
      <div style={{ background: "white", borderRadius: "1.25rem", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontWeight: "800", color: "#164e63", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🌙</span> Sleep Entry
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "0.5rem", textTransform: "uppercase" }}>Bedtime</label>
            <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
              style={{ width: "100%", padding: "0.8rem", borderRadius: "0.75rem", border: "2px solid #f1f5f9", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "0.5rem", textTransform: "uppercase" }}>Wake up</label>
            <input type="time" value={wakeup} onChange={e => setWakeup(e.target.value)}
              style={{ width: "100%", padding: "0.8rem", borderRadius: "0.75rem", border: "2px solid #f1f5f9", fontSize: "1rem", outline: "none" }} />
          </div>
        </div>

        {preview && (
          <div style={{ background: "#f8fafc", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1.5rem", border: "1px dashed #e2e8f0", textAlign: "center" }}>
            <div style={{ fontWeight: "800", fontSize: "1.5rem", color: getColor(parseFloat(preview)) }}>
              {preview} Hours
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
              {parseFloat(preview) >= 7 ? "✨ Optimal recovery!" : parseFloat(preview) >= 5 ? "⚡️ Functional, but try for more." : "🚩 High sleep debt!"}
            </div>
          </div>
        )}

        <button onClick={handleLog} disabled={loading}
          style={{ 
            width: "100%", 
            background: "#6366f1", 
            color: "white", 
            border: "none", 
            borderRadius: "0.75rem", 
            padding: "1rem", 
            fontSize: "1rem", 
            fontWeight: "700", 
            cursor: loading ? "not-allowed" : "pointer", 
            transition: "all 0.2s",
            boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.2)"
          }}>
          {loading ? "Logging..." : "Add Sleep Record"}
        </button>
      </div>

      {/* List Card */}
      <div style={{ background: "white", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontWeight: "700", color: "#164e63", marginBottom: "1rem" }}>History</h3>
        {logs.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "1rem" }}>No sleep data recorded yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {logs.slice(0, 7).map(log => (
              <div key={log.id} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: "1rem", 
                borderRadius: "0.75rem", 
                background: "#f8fafc",
                border: "1px solid #f1f5f9"
              }}>
                <div>
                  <div style={{ fontWeight: "700", color: "#334155", fontSize: "0.95rem" }}>{log.date}</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{log.bedtime} to {log.wakeup}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ 
                    fontWeight: "800", 
                    color: getColor(log.hours),
                    background: "white",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}>{log.hours}h</div>
                  <button onClick={() => deleteLog(log.id)}
                    style={{ 
                      background: "#fee2e2", 
                      border: "none", 
                      color: "#ef4444", 
                      cursor: "pointer", 
                      width: "32px",
                      height: "32px",
                      borderRadius: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      transition: "background 0.2s"
                    }}
                    title="Delete log">🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}