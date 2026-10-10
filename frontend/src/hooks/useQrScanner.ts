import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export type ScannerState = 'idle' | 'requesting' | 'scanning' | 'error'

interface UseQrScannerOptions {
  onScan: (text: string) => void
  enabled: boolean
}

export function useQrScanner({ onScan, enabled }: UseQrScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const [state, setState] = useState<ScannerState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [activeCameraId, setActiveCameraId] = useState<string | undefined>(undefined)

  // Start scanning on a specific camera device
  const startCamera = useCallback(async (deviceId?: string) => {
    if (!videoRef.current) return

    // Stop any existing stream first
    if (controlsRef.current) {
      controlsRef.current.stop()
      controlsRef.current = null
    }

    setState('requesting')
    setErrorMessage(null)

    try {
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      const controls = await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText()
            // Extract UUID from the QR text (backend stores UUID as the QR content)
            const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
            const match = text.match(uuidRegex)
            if (match) {
              onScan(match[0])
            } else {
              // If no UUID found, pass the raw text anyway and let validation handle it
              onScan(text)
            }
          }
          if (error && !(error as Error).message?.includes('No MultiFormat Readers')) {
            // Ignore "no QR found in frame" errors — they fire every frame
            console.debug('QR scan error:', error)
          }
        }
      )

      controlsRef.current = controls
      setState('scanning')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access failed'

      if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
        setErrorMessage('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
        setErrorMessage('No camera found on this device.')
      } else {
        setErrorMessage(`Could not start camera: ${msg}`)
      }

      setState('error')
    }
  }, [onScan])

  const stopCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop()
      controlsRef.current = null
    }
    if (readerRef.current) {
      readerRef.current = null
    }
    setState('idle')
  }, [])

  const switchCamera = useCallback((deviceId: string) => {
    setActiveCameraId(deviceId)
    startCamera(deviceId)
  }, [startCamera])

  // Enumerate cameras
  useEffect(() => {
    if (!enabled) return

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        setCameras(devices)
        // Prefer rear-facing camera on mobile
        const rear = devices.find(
          (d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
        )
        const preferred = rear?.deviceId ?? devices[0]?.deviceId
        setActiveCameraId(preferred)
        startCamera(preferred)
      })
      .catch(() => {
        // Fallback: start with no specific device (browser will pick default)
        startCamera(undefined)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // Stop camera when disabled
  useEffect(() => {
    if (!enabled) stopCamera()
  }, [enabled, stopCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsRef.current) controlsRef.current.stop()
    }
  }, [])

  return {
    videoRef,
    state,
    errorMessage,
    cameras,
    activeCameraId,
    switchCamera,
    restart: () => startCamera(activeCameraId),
  }
}
