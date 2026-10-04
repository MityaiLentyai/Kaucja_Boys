"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library";
import AppShell from "@/components/AppShell";
import Spinner from "@/components/Spinner";
import { apiFetch } from "@/lib/api";

// Voucher validity is decided by the server (it is a database lookup), so the
// client only gates on a code being plausible enough to be worth submitting.
const MIN_BARCODE_LENGTH = 4;

interface ScanResponse {
  message: string;
  voucher_code: string;
  amount: number;
  issuer_store: string;
  new_balance: number;
}

export default function ScanVoucherPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isSubmittingRef = useRef(false);

  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const stopCameraHardware = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (err) {}
      codeReaderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const originalConsoleErr = console.error;
    const originalConsoleLog = console.log;

    const filterZXingLogs = (originalFn: typeof console.error) => {
      return (...args: any[]) => {
        const msg = args[0]?.toString() || "";
        if (
          msg.includes("MultiFormatReader") ||
          msg.includes("NotFoundException") ||
          msg.includes("ChecksumException") ||
          msg.includes("FormatTracker")
        ) {
          return;
        }
        originalFn.apply(console, args);
      };
    };

    console.error = filterZXingLogs(originalConsoleErr);
    console.log = filterZXingLogs(originalConsoleLog);

    async function initCamera() {
      try {
        setCameraError(null);

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.QR_CODE, // Added QR code support
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
        ]);

        const reader = new BrowserMultiFormatReader(hints);
        reader.timeBetweenDecodingAttempts = 250;
        codeReaderRef.current = reader;

        let selectedDeviceId: string | null = null;

        try {
          const initialStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });

          initialStream.getTracks().forEach((track) => track.stop());

          const videoInputDevices = await reader.listVideoInputDevices();
          if (videoInputDevices && videoInputDevices.length > 0) {
            const backCamera = videoInputDevices.find((device) =>
              /back|rear|environment/i.test(device.label),
            );
            selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;
          }
        } catch (permErr) {}

        if (!isMounted) return;

        await reader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result) => {
          if (result && !isSubmittingRef.current && isMounted) {
            isSubmittingRef.current = true;
            const code = result.getText();
            handleVoucherSubmit(code);
          }
        });
      } catch (err: any) {
        if (isMounted) {
          setCameraError(
            "Camera access denied or unavailable. You can enter the code manually below.",
          );
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      stopCameraHardware();
      console.error = originalConsoleErr;
      console.log = originalConsoleLog;
    };
  }, []);

  const handleVoucherSubmit = async (barcodeToSubmit: string) => {
    const barcode = barcodeToSubmit.trim();
    if (barcode.length < MIN_BARCODE_LENGTH || loading) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await apiFetch<ScanResponse>("/vouchers/scan", {
        method: "POST",
        body: JSON.stringify({ barcode }),
      });

      stopCameraHardware();

      setFeedback({
        type: "success",
        message: `Success! Added +${res.amount.toFixed(2)} PLN from ${res.issuer_store}. New balance: ${res.new_balance.toFixed(2)} PLN`,
      });

      // Stay in the loading state so the claim cannot be fired twice while the
      // success banner is up and the redirect is pending.
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      isSubmittingRef.current = false;
      setFeedback({
        type: "error",
        message: err.message || "Failed to process voucher.",
      });
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    stopCameraHardware();
    router.push("/dashboard");
  };

  const trimmedBarcode = manualBarcode.trim();
  const canClaim = !loading && trimmedBarcode.length >= MIN_BARCODE_LENGTH;

  return (
    <AppShell title="Scan Voucher" subtitle="Add a deposit receipt" onBack={handleBackNavigation}>
      {/* Camera Viewfinder */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

        {/* Scanner Target Frame in Theme Color rgb(208, 154, 189) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="relative h-36 w-3/4 animate-pulse rounded-xl border-4 border-dashed"
            style={{ borderColor: "rgb(208, 154, 189)" }}
          >
            <div
              className="absolute left-0 right-0 top-1/2 h-0.5"
              style={{ backgroundColor: "rgb(208, 154, 189)" }}
            />
          </div>
        </div>

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-white/70">
            {cameraError}
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-2xl border p-4 text-center text-sm font-semibold ${
            feedback.type === "success"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/30 bg-red-400/10 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Manual Input Fallback */}
      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Manual Voucher Entry
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., KAUCJA-100"
            disabled={loading}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#d09abd] focus:ring-2 focus:ring-[#d09abd]/30 disabled:cursor-not-allowed disabled:opacity-60"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
          />
          <button
            onClick={() => handleVoucherSubmit(trimmedBarcode)}
            disabled={!canClaim}
            aria-busy={loading}
            title={canClaim ? undefined : "Enter a voucher code to claim it"}
            className="btn btn-primary px-5 py-2.5 text-sm"
          >
            {loading ? (
              <>
                <Spinner className="h-3.5 w-3.5" />
                Claiming…
              </>
            ) : (
              "Claim"
            )}
          </button>
        </div>
        <p className="text-xs text-white/40">
          Demo codes available:{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/70">KAUCJA-100</code> (10
          PLN), <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/70">KAUCJA-050</code>{" "}
          (5 PLN).
        </p>
      </div>
    </AppShell>
  );
}
