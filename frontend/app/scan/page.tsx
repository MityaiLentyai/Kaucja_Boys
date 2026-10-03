"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library";
import { apiFetch } from "@/lib/api";

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

  // Persistent references for cleanup and hardware control
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isSubmittingRef = useRef(false);

  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  // Cleanly release camera stream and reset ZXing reader
  const stopCameraHardware = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (err) {
        // Ignore unmount reset exceptions
      }
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

    // Suppress ZXing's internal NotFoundException / ChecksumException console spam
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
          return; // Ignore ZXing scan attempt frame exceptions
        }
        originalFn.apply(console, args);
      };
    };

    console.error = filterZXingLogs(originalConsoleErr);
    console.log = filterZXingLogs(originalConsoleLog);

    async function initCamera() {
      try {
        setCameraError(null);

        // Configure scanner hints for 1D voucher barcodes
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
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

        // Request camera media stream directly
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});

          reader.decodeFromStream(stream, videoRef.current, (result) => {
            if (result && !isSubmittingRef.current && isMounted) {
              isSubmittingRef.current = true;
              const code = result.getText();
              handleVoucherSubmit(code);
            }
          });
        }
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
      // Restore standard console functions on page leave
      console.error = originalConsoleErr;
      console.log = originalConsoleLog;
    };
  }, []);

  const handleVoucherSubmit = async (barcodeToSubmit: string) => {
    if (!barcodeToSubmit.trim() || loading) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await apiFetch<ScanResponse>("/vouchers/scan", {
        method: "POST",
        body: JSON.stringify({ barcode: barcodeToSubmit }),
      });

      // Turn off camera hardware immediately after successful scan
      stopCameraHardware();

      setFeedback({
        type: "success",
        message: `Success! Added +${res.amount.toFixed(2)} PLN from ${res.issuer_store}. New balance: ${res.new_balance.toFixed(2)} PLN`,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      isSubmittingRef.current = false;
      setFeedback({
        type: "error",
        message: err.message || "Failed to process barcode voucher.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    stopCameraHardware();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto flex flex-col space-y-6">
      <header className="flex items-center justify-between border-b pb-3">
        <button
          onClick={handleBackNavigation}
          className="text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-800">Scan Kaucja Voucher</h1>
        <div className="w-8" />
      </header>

      {/* Camera Viewfinder */}
      <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {/* Scanner Target Frame in Theme Color rgb(208, 154, 189) */}
        <div className="absolute inset-0 border-2 border-transparent flex items-center justify-center pointer-events-none">
          <div
            className="w-3/4 h-36 rounded-xl border-4 border-dashed relative animate-pulse"
            style={{ borderColor: "rgb(208, 154, 189)" }}
          >
            <div
              className="absolute left-0 right-0 top-1/2 h-0.5"
              style={{ backgroundColor: "rgb(208, 154, 189)" }}
            />
          </div>
        </div>

        {cameraError && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 text-center text-sm text-gray-200">
            {cameraError}
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold text-center ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Manual Input Fallback */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Manual Voucher Entry</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="e.g., KAUCJA-100"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
          />
          <button
            onClick={() => handleVoucherSubmit(manualBarcode)}
            disabled={loading || !manualBarcode}
            className="px-4 py-2 text-white font-semibold text-sm rounded-lg shadow transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "rgb(208, 154, 189)" }}
          >
            {loading ? "Submitting..." : "Claim"}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Demo codes available: <code className="bg-gray-100 px-1 py-0.5 rounded">KAUCJA-100</code>{" "}
          (10 PLN), <code className="bg-gray-100 px-1 py-0.5 rounded">KAUCJA-050</code> (5
          PLN)[cite: 2].
        </p>
      </div>
    </div>
  );
}
