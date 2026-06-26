"use client"

import { useCallback, useEffect, useState } from "react"
import { QrCode, MapPin, LogOut, Loader2, AlertCircle, ShieldCheck } from "lucide-react"
import { OnboardingForm } from "@/components/onboarding-form"
import { QrScanner } from "@/components/qr-scanner"
import { SuccessScreen } from "@/components/success-screen"
import { captureLocation } from "@/lib/geo"
import { DuplicateCheckInError, recordAttendance } from "@/lib/attendance-store"
import { STUDENT_STORAGE_KEY, type AttendanceRecord, type Student } from "@/lib/types"

type Step = "loading" | "onboarding" | "ready" | "scanning" | "submitting" | "success" | "error"

export function AttendancePortal() {
  const [step, setStep] = useState<Step>("loading")
  const [student, setStudent] = useState<Student | null>(null)
  const [record, setRecord] = useState<AttendanceRecord | null>(null)
  const [statusText, setStatusText] = useState("Capturing your location…")
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Restore the student session from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STUDENT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Student
        if (parsed?.fullName && parsed?.rollNumber && parsed?.department) {
          setStudent(parsed)
          setStep("ready")
          return
        }
      }
    } catch {
      // ignore malformed storage
    }
    setStep("onboarding")
  }, [])

  const handleOnboard = useCallback((next: Student) => {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(next))
    setStudent(next)
    setStep("ready")
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STUDENT_STORAGE_KEY)
    setStudent(null)
    setRecord(null)
    setStep("onboarding")
  }, [])

  // Fired the instant a QR code is successfully decoded.
  const handleScan = useCallback(
    async (qrData: string) => {
      if (!student) return
      setStep("submitting")
      setErrorMessage("")

      // 1. Capture GPS coordinates at the moment of the scan.
      let location = null
      try {
        setStatusText("Capturing your location…")
        location = await captureLocation()
      } catch (err) {
        // Location is best-effort; continue, but tell the API none was captured.
        console.log("[v0] location capture failed:", err instanceof Error ? err.message : err)
      }

      // 2. Save the attendance record locally (fully client-side, no backend).
      try {
        setStatusText("Recording attendance…")
        const saved = recordAttendance(student, qrData, location)
        setRecord(saved)
        setStep("success")
      } catch (err) {
        if (err instanceof DuplicateCheckInError) {
          setErrorMessage(err.message)
        } else {
          setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.")
        }
        setStep("error")
      }
    },
    [student],
  )

  if (step === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    )
  }

  if (step === "scanning") {
    return <QrScanner onScan={handleScan} onCancel={() => setStep("ready")} />
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col justify-center py-6">
        {step === "onboarding" ? <OnboardingForm onComplete={handleOnboard} /> : null}

        {step === "ready" && student ? (
          <ReadyScreen student={student} onStart={() => setStep("scanning")} onLogout={handleLogout} />
        ) : null}

        {step === "submitting" ? (
          <div className="flex flex-col items-center text-center">
            <Loader2 className="size-10 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-5 text-base font-medium">{statusText}</p>
            <p className="mt-1 text-sm text-muted-foreground">Hold on a moment</p>
          </div>
        ) : null}

        {step === "success" && record ? (
          <SuccessScreen record={record} onDone={() => setStep("ready")} />
        ) : null}

        {step === "error" ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-8" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-semibold">Check-in not completed</h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => setStep("ready")}
              className="mt-6 h-12 w-full rounded-xl bg-primary text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-[0.98] hover:bg-primary/90"
            >
              Back to Home
            </button>
          </div>
        ) : null}
      </div>
    </main>
  )
}

function ReadyScreen({
  student,
  onStart,
  onLogout,
}: {
  student: Student
  onStart: () => void
  onLogout: () => void
}) {
  const initials = student.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
            {initials}
          </div>
          <div>
            <p className="font-semibold leading-tight">{student.fullName}</p>
            <p className="font-mono text-xs uppercase text-muted-foreground">{student.rollNumber}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sign out"
          className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
        {student.department}
      </div>

      <div className="mt-8 flex flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <QrCode className="size-8" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-balance">Ready to check in</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Tap below to open your camera and scan the QR code displayed at the event.
        </p>

        <button
          type="button"
          onClick={onStart}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-[0.98] hover:bg-primary/90"
        >
          <QrCode className="size-5" aria-hidden="true" />
          Scan QR to Check In
        </button>
      </div>

      <ul className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
        <li className="flex items-center gap-3">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
          Your location is captured to verify on-site attendance.
        </li>
        <li className="flex items-center gap-3">
          <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
          Each event can only be checked into once per student.
        </li>
      </ul>
    </div>
  )
}
