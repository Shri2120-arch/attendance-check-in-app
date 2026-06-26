import type { AttendanceRecord, GeoPosition, Student } from "@/lib/types"

const LOG_STORAGE_KEY = "club-checkin:logs"

export class DuplicateCheckInError extends Error {
  checkedInAt: string | null
  constructor(checkedInAt: string | null) {
    super("You have already checked in for this session.")
    this.name = "DuplicateCheckInError"
    this.checkedInAt = checkedInAt
  }
}

function readLogs(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as AttendanceRecord[]) : []
  } catch {
    return []
  }
}

function writeLogs(logs: AttendanceRecord[]): void {
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs))
}

/**
 * Records an attendance check-in to localStorage.
 *
 * Mirrors the previous server route: validates input, enforces a single
 * check-in per (rollNumber, qrData), and returns a snake_case record that the
 * UI already knows how to render. Throws DuplicateCheckInError on a repeat scan.
 */
export function recordAttendance(
  student: Student,
  qrData: string,
  location: GeoPosition | null,
): AttendanceRecord {
  const rollNumber = student.rollNumber.trim()
  const trimmedQr = qrData.trim()

  if (!student.fullName.trim() || !rollNumber || !student.department.trim()) {
    throw new Error("Missing student details. Please complete onboarding again.")
  }
  if (!trimmedQr) {
    throw new Error("No QR code data was provided.")
  }

  const logs = readLogs()

  const existing = logs.find(
    (log) => log.roll_number === rollNumber && log.qr_data === trimmedQr,
  )
  if (existing) {
    throw new DuplicateCheckInError(existing.checked_in_at)
  }

  const nextId = logs.reduce((max, log) => Math.max(max, log.id), 0) + 1

  const record: AttendanceRecord = {
    id: nextId,
    student_name: student.fullName.trim(),
    roll_number: rollNumber,
    department: student.department.trim(),
    qr_data: trimmedQr,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    accuracy: location?.accuracy ?? null,
    checked_in_at: new Date().toISOString(),
  }

  writeLogs([...logs, record])
  return record
}
