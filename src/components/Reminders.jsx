import { useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import toast from "react-hot-toast"

export default function Reminders() {
  const { user } = useAuth()
  const shownRef = useRef(new Set())

  useEffect(() => {
    if (!user) return

    const checkReminders = () => {
      const now = new Date()
      const hh = now.getHours()
      const mm = now.getMinutes()
      const timeStr = `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`
      const key = (id) => `${timeStr}-${id}`

      // Water reminders every 2 hours between 8am and 10pm
      const waterHours = [8,10,12,14,16,18,20,22]
      if (waterHours.includes(hh) && mm === 0) {
        const k = key("water")
        if (!shownRef.current.has(k)) {
          toast("💧 Time to drink some water!", {
            duration: 6000,
            style: { background: "#e0f2fe", color: "#0369a1", fontWeight: "600" }
          })
          shownRef.current.add(k)
        }
      }

      // Bedtime reminder — read from localStorage
      const bedtime = localStorage.getItem("vf_bedtime")
      if (bedtime) {
        const [bh, bm] = bedtime.split(":").map(Number)
        const reminderDate = new Date()
        reminderDate.setHours(bh, bm - 30, 0)
        const rh = reminderDate.getHours()
        const rm = reminderDate.getMinutes()
        if (hh === rh && mm === rm) {
          const k = key("bedtime")
          if (!shownRef.current.has(k)) {
            toast("🌙 30 minutes until bedtime! Start winding down.", {
              duration: 8000,
              style: { background: "#ede9fe", color: "#4f46e5", fontWeight: "600" }
            })
            shownRef.current.add(k)
          }
        }
      }
    }

    // Check medication reminders
    const q = query(collection(db, "medications"), where("uid", "==", user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const meds = snap.docs.map(d => d.data())
      const checkMeds = () => {
        const now = new Date()
        const hh = String(now.getHours()).padStart(2,"0")
        const mm = String(now.getMinutes()).padStart(2,"0")
        const timeStr = `${hh}:${mm}`
        const today = new Date().toLocaleDateString()

        meds.forEach(med => {
          if (med.time === timeStr) {
            const alreadyTaken = (med.takenDates || []).includes(today)
            if (!alreadyTaken) {
              const k = `${timeStr}-med-${med.name}`
              if (!shownRef.current.has(k)) {
                toast(`💊 Time to take ${med.name} (${med.dose})!`, {
                  duration: 10000,
                  style: { background: "#f0fdf4", color: "#065f46", fontWeight: "600" }
                })
                shownRef.current.add(k)
              }
            }
          }
        })
      }
      const medInterval = setInterval(checkMeds, 30000)
      checkMeds()
      return () => clearInterval(medInterval)
    })

    const interval = setInterval(checkReminders, 30000)
    checkReminders()

    return () => {
      clearInterval(interval)
      unsub()
    }
  }, [user])

  return null
}