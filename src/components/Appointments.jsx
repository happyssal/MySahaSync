import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, addDoc, updateDoc, query, where, onSnapshot, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

export default function Appointments() {
  const { user } = useAuth()
  const [appts, setAppts] = useState([])
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [title, setTitle] = useState("")
  const [doctor, setDoctor] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      where("uid", "==", user.uid)
    )
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => a.date > b.date ? 1 : -1)
      setAppts(data)
    })
    return unsub
  }, [user])

  function resetForm() {
    setTitle("")
    setDoctor("")
    setDate("")
    setTime("")
    setNotes("")
    setEditingId(null)
    setAdding(false)
  }

  async function saveAppt() {
    if (!title || !date) return toast.error("Title and date are required")
    try {
      if (editingId) {
        await updateDoc(doc(db, "appointments", editingId), {
          title, doctor, date, time, notes
        })
        toast.success("Appointment updated!")
      } else {
        await addDoc(collection(db, "appointments"), {
          uid: user.uid, title, doctor, date, time, notes,
          createdAt: Timestamp.now()
        })
        toast.success("Appointment saved!")
      }
      resetForm()
    } catch (err) {
      toast.error("Failed to save")
      console.error(err)
    }
  }

  function startEdit(appt) {
    setTitle(appt.title)
    setDoctor(appt.doctor || "")
    setDate(appt.date)
    setTime(appt.time || "")
    setNotes(appt.notes || "")
    setEditingId(appt.id)
    setAdding(true)
  }

  async function deleteAppt(id) {
    await deleteDoc(doc(db, "appointments", id))
    toast.success("Appointment removed")
  }

  const today = new Date().toISOString().split("T")[0]
  const upcoming = appts.filter(a => a.date >= today)
  const past = appts.filter(a => a.date < today)

  function daysUntil(dateStr) {
    const diff = Math.ceil((new Date(dateStr) - new Date(today)) / (1000 * 60 * 60 * 24))
    if (diff === 0) return "Today!"
    if (diff === 1) return "Tomorrow"
    return `In ${diff} days`
  }

  return (
    <div>
      <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontWeight: "700", color: "#164e63", margin: 0 }}>Appointments</h2>
          <button onClick={() => adding ? resetForm() : setAdding(true)}
            style={{ background: "#f59e0b", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "600" }}>
            {adding ? "Cancel" : "+ Add"}
          </button>
        </div>

        {adding && (
          <div style={{ background: "#fffbeb", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <input placeholder="Appointment title *" value={title} onChange={e => setTitle(e.target.value)}
                style={{ padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
              <input placeholder="Doctor name" value={doctor} onChange={e => setDoctor(e.target.value)}
                style={{ padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
            </div>
            <input placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.9rem", marginBottom: "0.75rem", boxSizing: "border-box" }} />
            <button onClick={saveAppt}
              style={{ width: "100%", background: "#f59e0b", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.75rem", fontWeight: "600", cursor: "pointer" }}>
              {editingId ? "Update Appointment" : "Save Appointment"}
            </button>
          </div>
        )}

        <h3 style={{ fontWeight: "600", color: "#374151", marginBottom: "0.75rem" }}>Upcoming</h3>
        {upcoming.length === 0 && <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No upcoming appointments</p>}
        {upcoming.map(appt => (
          <div key={appt.id} style={{ background: "#fffbeb", borderRadius: "0.75rem", padding: "1rem", marginBottom: "0.5rem", border: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: "700", color: "#374151" }}>📅 {appt.title}</div>
              {appt.doctor && <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Dr. {appt.doctor}</div>}
              <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{appt.date}{appt.time ? ` at ${appt.time}` : ""}</div>
              {appt.notes && <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>{appt.notes}</div>}
              <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#f59e0b", marginTop: "0.25rem" }}>{daysUntil(appt.date)}</div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => startEdit(appt)}
                style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d", borderRadius: "0.375rem", padding: "0.25rem 0.75rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
                Edit
              </button>
              <button onClick={() => deleteAppt(appt.id)}
                style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "0.375rem", padding: "0.25rem 0.75rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {past.length > 0 && (
          <>
            <h3 style={{ fontWeight: "600", color: "#9ca3af", marginTop: "1rem", marginBottom: "0.75rem" }}>Past</h3>
            {past.map(appt => (
              <div key={appt.id} style={{ background: "#f9fafb", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "0.5rem", opacity: 0.6, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: "600", color: "#374151" }}>{appt.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{appt.date}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => startEdit(appt)}
                    style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d", borderRadius: "0.375rem", padding: "0.25rem 0.75rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
                    Edit
                  </button>
                  <button onClick={() => deleteAppt(appt.id)}
                    style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "0.375rem", padding: "0.25rem 0.75rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}