import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

export default function MedTracker() {
  const { user } = useAuth()
  const [meds, setMeds] = useState([])
  const [name, setName] = useState("")
  const [dose, setDose] = useState("")
  const [time, setTime] = useState("")
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [editDose, setEditDose] = useState("")
  const [editTime, setEditTime] = useState("")
  const today = new Date().toLocaleDateString()

  useEffect(() => {
    const q = query(collection(db, "medications"), where("uid", "==", user.uid))
    const unsub = onSnapshot(q, snap => setMeds(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    return unsub
  }, [user])

  async function addMed() {
    if (!name || !dose || !time) return toast.error("Fill all fields")
    await addDoc(collection(db, "medications"), {
      uid: user.uid, name, dose, time,
      createdAt: Timestamp.now(),
      takenDates: []
    })
    toast.success(`${name} added!`)
    setName(""); setDose(""); setTime(""); setAdding(false)
  }

  async function deleteMed(id) {
    await deleteDoc(doc(db, "medications", id))
    toast.success("Medication removed")
  }

  async function startEdit(med) {
    setEditingId(med.id)
    setEditName(med.name)
    setEditDose(med.dose)
    setEditTime(med.time)
  }

  async function saveEdit(id) {
    await updateDoc(doc(db, "medications", id), {
      name: editName, dose: editDose, time: editTime
    })
    toast.success("Updated!")
    setEditingId(null)
  }

  async function toggleTaken(med) {
    const taken = med.takenDates || []
    const alreadyTaken = taken.includes(today)
    const updated = alreadyTaken ? taken.filter(d => d !== today) : [...taken, today]
    await updateDoc(doc(db, "medications", med.id), { takenDates: updated })
    toast.success(alreadyTaken ? "Marked as not taken" : "✅ Medication taken!")
  }

  return (
    <div>
      <div style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontWeight: "700", color: "#164e63", margin: 0 }}>Medications</h2>
          <button onClick={() => setAdding(!adding)}
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "600" }}>
            {adding ? "Cancel" : "+ Add Med"}
          </button>
        </div>

        {adding && (
          <div style={{ background: "#f0fdf4", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <input placeholder="Medicine name" value={name} onChange={e => setName(e.target.value)}
                style={{ padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
              <input placeholder="Dosage (e.g. 500mg)" value={dose} onChange={e => setDose(e.target.value)}
                style={{ padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
            </div>
            <button onClick={addMed}
              style={{ width: "100%", background: "#10b981", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.75rem", fontWeight: "600", cursor: "pointer" }}>
              Save Medication
            </button>
          </div>
        )}

        {meds.length === 0 && <p style={{ color: "#9ca3af", textAlign: "center" }}>No medications added yet</p>}

        {meds.map(med => {
          const taken = (med.takenDates || []).includes(today)
          const isEditing = editingId === med.id

          return (
            <div key={med.id} style={{ borderRadius: "0.75rem", background: taken ? "#f0fdf4" : "#fafafa", marginBottom: "0.5rem", border: `1px solid ${taken ? "#bbf7d0" : "#f3f4f6"}`, overflow: "hidden" }}>
              {isEditing ? (
                <div style={{ padding: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
                    <input value={editDose} onChange={e => setEditDose(e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
                    <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb", fontSize: "0.9rem" }} />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => saveEdit(med.id)}
                      style={{ flex: 1, background: "#10b981", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.5rem", cursor: "pointer", fontWeight: "600" }}>
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}
                      style={{ flex: 1, background: "#e5e7eb", color: "#374151", border: "none", borderRadius: "0.5rem", padding: "0.5rem", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
                  <div>
                    <div style={{ fontWeight: "700", color: "#374151" }}>💊 {med.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>{med.dose} · {med.time}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button onClick={() => toggleTaken(med)}
                      style={{ background: taken ? "#10b981" : "#e5e7eb", color: taken ? "white" : "#6b7280", border: "none", borderRadius: "0.75rem", padding: "0.5rem 0.75rem", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}>
                      {taken ? "✅ Taken" : "Mark Taken"}
                    </button>
                    <button onClick={() => startEdit(med)}
                      style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d", borderRadius: "0.375rem", padding: "0.25rem 0.75rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
                      Edit
                    </button>
                    <button onClick={() => deleteMed(med.id)}
                      style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "0.375rem", padding: "0.25rem 0.75rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}