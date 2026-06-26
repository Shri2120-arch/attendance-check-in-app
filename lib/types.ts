export type Student = {
  fullName: string
  rollNumber: string
  department: string
}

export type GeoPosition = {
  latitude: number
  longitude: number
  accuracy: number
}

export type AttendanceRecord = {
  id: number
  student_name: string
  roll_number: string
  department: string
  qr_data: string
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  checked_in_at: string
}

export const STUDENT_STORAGE_KEY = "club-checkin:student"
