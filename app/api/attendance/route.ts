import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type AttendancePayload = {
  studentName?: string
  rollNumber?: string
  department?: string
  qrData?: string
  latitude?: number | null
  longitude?: number | null
  accuracy?: number | null
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export async function POST(request: NextRequest) {
  let body: AttendancePayload
  try {
    body = (await request.json()) as AttendancePayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const studentName = clean(body.studentName)
  const rollNumber = clean(body.rollNumber)
  const department = clean(body.department)
  const qrData = clean(body.qrData)

  // Server-side validation: never trust the client.
  if (!studentName || !rollNumber || !department) {
    return NextResponse.json(
      { error: "Missing student details. Please complete onboarding again." },
      { status: 400 },
    )
  }

  if (!qrData) {
    return NextResponse.json({ error: "No QR code data was provided." }, { status: 400 })
  }

  const latitude = toNumber(body.latitude)
  const longitude = toNumber(body.longitude)
  const accuracy = toNumber(body.accuracy)

  try {
    const rows = await sql`
      INSERT INTO attendance_logs
        (student_name, roll_number, department, qr_data, latitude, longitude, accuracy)
      VALUES
        (${studentName}, ${rollNumber}, ${department}, ${qrData}, ${latitude}, ${longitude}, ${accuracy})
      ON CONFLICT (roll_number, qr_data) DO NOTHING
      RETURNING id, student_name, roll_number, department, qr_data, latitude, longitude, accuracy, checked_in_at
    `

    // ON CONFLICT returns no rows when this student already checked in for this QR.
    if (rows.length === 0) {
      const existing = await sql`
        SELECT id, checked_in_at
        FROM attendance_logs
        WHERE roll_number = ${rollNumber} AND qr_data = ${qrData}
        LIMIT 1
      `
      return NextResponse.json(
        {
          duplicate: true,
          message: "You have already checked in for this session.",
          checkedInAt: existing[0]?.checked_in_at ?? null,
        },
        { status: 409 },
      )
    }

    return NextResponse.json({ success: true, record: rows[0] }, { status: 201 })
  } catch (error) {
    console.log("[v0] attendance insert error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to record attendance. Please try again." }, { status: 500 })
  }
}
