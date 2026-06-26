"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { X, CameraOff } from "lucide-react"

const REGION_ID = "qr-reader-region"

export function QrScanner({
  onScan,
  onCancel,
}: {
  onScan: (decodedText: string) => void
  onCancel: () => void
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const startedRef = useRef(false)
  const handledRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode(REGION_ID, { verbose: false })
    scannerRef.current = scanner

    const config = {
      fps: 10,
      qrbox: (viewWidth: number, viewHeight: number) => {
        const size = Math.floor(Math.min(viewWidth, viewHeight) * 0.7)
        return { width: size, height: size }
      },
      aspectRatio: 1,
    }

    const handleSuccess = (decodedText: string) => {
      if (handledRef.current) return
      handledRef.current = true
      // Stop the camera before handing control back to the portal.
      stop().finally(() => onScan(decodedText))
    }

    async function stop() {
      if (scannerRef.current && startedRef.current) {
        startedRef.current = false
        try {
          await scannerRef.current.stop()
          scannerRef.current.clear()
        } catch {
          // camera already released
        }
      }
    }

    // Prefer the physical back/environment camera on phones.
    scanner
      .start({ facingMode: { exact: "environment" } }, config, handleSuccess, undefined)
      .then(() => {
        startedRef.current = true
        setReady(true)
      })
      .catch(() => {
        // Fallback for devices/desktops without a dedicated rear camera.
        scanner
          .start({ facingMode: "environment" }, config, handleSuccess, undefined)
          .then(() => {
            startedRef.current = true
            setReady(true)
          })
          .catch((err) => {
            const message =
              err?.name === "NotAllowedError"
                ? "Camera permission denied. Allow camera access and try again."
                : "Unable to access the camera on this device."
            setError(message)
          })
      })

    return () => {
      handledRef.current = true
      if (scannerRef.current && startedRef.current) {
        startedRef.current = false
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {})
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <header className="flex items-center justify-between px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] text-white">
        <div>
          <h2 className="text-base font-semibold">Scan Event QR</h2>
          <p className="text-xs text-white/60">Point your camera at the club&apos;s QR code</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel scanning"
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-95 hover:bg-white/20"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* html5-qrcode injects the live <video> feed into this region */}
        <div id={REGION_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black px-8 text-center">
            <CameraOff className="size-10 text-white/70" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-white/80 text-pretty">{error}</p>
            <button
              type="button"
              onClick={onCancel}
              className="mt-2 h-11 rounded-xl bg-white px-6 text-sm font-medium text-black transition active:scale-95"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            {/* Scanning overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative size-[70vw] max-h-[300px] max-w-[300px]">
                <span className="absolute -left-1 -top-1 size-8 rounded-tl-xl border-l-4 border-t-4 border-primary" />
                <span className="absolute -right-1 -top-1 size-8 rounded-tr-xl border-r-4 border-t-4 border-primary" />
                <span className="absolute -bottom-1 -left-1 size-8 rounded-bl-xl border-b-4 border-l-4 border-primary" />
                <span className="absolute -bottom-1 -right-1 size-8 rounded-br-xl border-b-4 border-r-4 border-primary" />
                {ready ? (
                  <span className="absolute inset-x-2 top-2 h-0.5 animate-[scanline_2.2s_ease-in-out_infinite] rounded bg-primary shadow-[0_0_12px_2px] shadow-primary" />
                ) : null}
              </div>
            </div>

            <p className="absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] text-center text-sm text-white/70">
              {ready ? "Align the QR code within the frame" : "Starting camera…"}
            </p>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes scanline {
          0% {
            transform: translateY(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(calc(70vw - 1rem));
            opacity: 1;
          }
          50.01% {
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 0.3;
          }
        }
        @media (min-width: 420px) {
          @keyframes scanline {
            0% {
              transform: translateY(0);
              opacity: 0.3;
            }
            50% {
              transform: translateY(280px);
              opacity: 1;
            }
            50.01% {
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 0.3;
            }
          }
        }
      `}</style>
    </div>
  )
}
