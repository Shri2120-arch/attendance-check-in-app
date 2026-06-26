import type { GeoPosition } from "@/lib/types"

/**
 * Captures the device's current GPS coordinates using the real browser
 * Geolocation API. Resolves with coordinates or rejects with a readable message.
 */
export function captureLocation(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported on this device."))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission denied. Enable it to check in."))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location is currently unavailable. Try again."))
            break
          case error.TIMEOUT:
            reject(new Error("Getting your location timed out. Try again."))
            break
          default:
            reject(new Error("Could not capture your location."))
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    )
  })
}
