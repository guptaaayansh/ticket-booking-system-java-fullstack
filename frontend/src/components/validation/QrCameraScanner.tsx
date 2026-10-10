import { Camera, CameraOff, RefreshCw, ChevronDown } from 'lucide-react'
import { useQrScanner } from '@/hooks/useQrScanner'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils'

interface QrCameraScannerProps {
  enabled: boolean
  onScan: (qrCodeId: string) => void
}

export default function QrCameraScanner({ enabled, onScan }: QrCameraScannerProps) {
  const {
    videoRef,
    state,
    errorMessage,
    cameras,
    activeCameraId,
    switchCamera,
    restart,
  } = useQrScanner({ enabled, onScan })

  return (
    <div className="flex flex-col gap-4">
      {/* ── Video viewport ── */}
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-black"
        style={{ aspectRatio: '4/3' }}
      >
        {/* Video element — always in DOM so videoRef stays attached */}
        <video
          ref={videoRef}
          className={cn(
            'w-full h-full object-cover',
            state !== 'scanning' && 'opacity-0'
          )}
          muted
          playsInline
          aria-label="Camera feed for QR code scanning"
        />

        {/* Idle / requesting overlay */}
        {(state === 'idle' || state === 'requesting') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--bg-card)]">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
              }}
            >
              <Camera className="h-7 w-7 text-[var(--accent)]" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {state === 'requesting' ? 'Starting camera…' : 'Initialising…'}
            </p>
            {state === 'requesting' && (
              <div className="flex gap-1.5 mt-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-[var(--accent)]"
                    style={{
                      animation: `dotBounce 1s ease-in-out ${i * 0.18}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error overlay */}
        {state === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-[var(--bg-card)] text-center">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <CameraOff className="h-6 w-6 text-[var(--danger)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--danger)]">Camera unavailable</p>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-[260px] leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={restart} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        )}

        {/* Active scan overlay — corner brackets + animated scan line */}
        {state === 'scanning' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Vignette surround */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%),' +
                  'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.5) 100%)',
              }}
            />

            {/* Corner brackets */}
            <div className="absolute top-[20%] left-[20%] h-9 w-9 border-t-[3px] border-l-[3px] border-[var(--accent)] rounded-tl-lg" />
            <div className="absolute top-[20%] right-[20%] h-9 w-9 border-t-[3px] border-r-[3px] border-[var(--accent)] rounded-tr-lg" />
            <div className="absolute bottom-[20%] left-[20%] h-9 w-9 border-b-[3px] border-l-[3px] border-[var(--accent)] rounded-bl-lg" />
            <div className="absolute bottom-[20%] right-[20%] h-9 w-9 border-b-[3px] border-r-[3px] border-[var(--accent)] rounded-br-lg" />

            {/* Animated scan beam */}
            <div
              className="absolute left-[21%] right-[21%] h-[2px] rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--accent) 40%, #a78bfa 60%, transparent 100%)',
                boxShadow: '0 0 8px rgba(124,58,237,0.8)',
                animation: 'scanBeam 2.2s ease-in-out infinite',
              }}
            />

            {/* Instruction badge */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center">
              <span
                className="px-4 py-2 rounded-full text-xs font-medium text-white"
                style={{
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Point at attendee's QR code to scan
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Camera selector — only when >1 camera and actively scanning ── */}
      {cameras.length > 1 && state === 'scanning' && (
        <div className="relative">
          <select
            value={activeCameraId}
            onChange={(e) => switchCamera(e.target.value)}
            className="w-full h-9 pl-3 pr-8 rounded-lg text-xs appearance-none cursor-pointer
              bg-[var(--bg-surface)] text-[var(--text-secondary)]
              border border-[var(--border)]
              focus:outline-none focus:border-[var(--border-focus)]
              transition-colors"
            aria-label="Select camera"
          >
            {cameras.map((cam, idx) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
        </div>
      )}

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes scanBeam {
          0%   { top: 22%; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 78%; opacity: 0; }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
