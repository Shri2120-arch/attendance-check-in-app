"use client"

import { Check, MapPin, QrCode, Clock } from "lucide-react"
import type { AttendanceRecord } from "@/lib/types"

function formatTime(iso: string) {
  const date = new Date(iso)
  return {
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    date: date.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  }
}

export function SuccessScreen({
  record,
  onDone,
}: {
  record: AttendanceRecord
  onDone: () => void
}) {
  const { time, date } = formatTime(record.checked_in_at)
  const hasLocation = record.latitude !== null && record.longitude !== null

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="relative mb-6 flex size-20 items-center justify-center rounded-full bg-success text-success-foreground shadow-xl shadow-success/30">
        <span className="absolute inset-0 animate-ping rounded-full bg-success/40" aria-hidden="true" />
        <Check className="size-10" strokeWidth={3} aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Checked In</h1>
      <p className="mt-1 text-sm text-muted-foreground">{date}</p>

      <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5 text-left shadow-sm">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
            <Clock className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Check-in time</p>
            <p className="font-mono text-lg font-semibold tabular-nums">{time}</p>
          </div>
        </div>

        <dl className="flex flex-col gap-3 pt-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <span>Student</span>
            </dt>
            <dd className="text-right font-medium">{record.student_name}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">Roll No.</dt>
            <dd className="text-right font-mono font-medium uppercase">{record.roll_number}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <QrCode className="size-4" aria-hidden="true" />
              <span>Event</span>
            </dt>
            <dd className="max-w-[60%] truncate text-right font-medium" title={record.qr_data}>
              {record.qr_data}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              <span>Location</span>
            </dt>
            <dd className="text-right font-mono text-xs">
              {hasLocation
                ? `${record.latitude!.toFixed(5)}, ${record.longitude!.toFixed(5)}`
                : "Not captured"}
            </dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-6 h-12 w-full rounded-xl bg-primary text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-[0.98] hover:bg-primary/90"
      >
        Done
      </button>
    </div>
  )
}
