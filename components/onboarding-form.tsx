"use client"

import { useState, type FormEvent } from "react"
import { GraduationCap } from "lucide-react"
import type { Student } from "@/lib/types"

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Commerce",
  "Arts & Humanities",
  "Sciences",
  "Other",
]

export function OnboardingForm({ onComplete }: { onComplete: (student: Student) => void }) {
  const [fullName, setFullName] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [department, setDepartment] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!fullName.trim()) next.fullName = "Enter your full name."
    if (!rollNumber.trim()) next.rollNumber = "Enter your roll number / student ID."
    if (!department) next.department = "Select your department."

    setErrors(next)
    if (Object.keys(next).length > 0) return

    onComplete({
      fullName: fullName.trim(),
      rollNumber: rollNumber.trim(),
      department,
    })
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <GraduationCap className="size-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Club Check-In</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Set up your student profile once. You&apos;ll use it to mark attendance at every club event.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Aarav Sharma"
            aria-invalid={Boolean(errors.fullName)}
            className="h-12 rounded-xl border border-input bg-card px-4 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive"
          />
          {errors.fullName ? <p className="text-xs text-destructive">{errors.fullName}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="rollNumber" className="text-sm font-medium">
            Roll Number / Student ID
          </label>
          <input
            id="rollNumber"
            name="rollNumber"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="CS21B1042"
            aria-invalid={Boolean(errors.rollNumber)}
            className="h-12 rounded-xl border border-input bg-card px-4 text-base uppercase outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive"
          />
          {errors.rollNumber ? <p className="text-xs text-destructive">{errors.rollNumber}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="department" className="text-sm font-medium">
            Department
          </label>
          <select
            id="department"
            name="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            aria-invalid={Boolean(errors.department)}
            className="h-12 rounded-xl border border-input bg-card px-4 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive"
          >
            <option value="" disabled>
              Select your department
            </option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department ? <p className="text-xs text-destructive">{errors.department}</p> : null}
        </div>

        <button
          type="submit"
          className="mt-2 h-12 rounded-xl bg-primary text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-[0.98] hover:bg-primary/90"
        >
          Continue
        </button>
      </form>
    </div>
  )
}
