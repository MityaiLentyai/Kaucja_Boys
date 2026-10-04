"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";

interface ScanItemResponse {
  message: string;
  item_name?: string;
  deposit_value: number;
  is_valid: boolean;
}

interface ScannedItem {
  id: string;
  barcode: string;
  name: string;
  value: number;
}

export default function ScanItemPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const isScanningRef = useRef(false);
  const itemsRef = useRef<ScannedItem[]>([]);

  const [items, setItems] = useState<ScannedItem[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [warningModalMessage, setWarningModalMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const updateItems = (newItems: ScannedItem[]) => {
    itemsRef.current = newItems;
    setItems(newItems);
  };

  const stopCameraHardware = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (err) {}
      codeReaderRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalConsoleInfo = console.info;

    const shouldSilenceLog = (args: any[]) => {
      const msg = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
        .join(" ");
      return (
        msg.includes("NotFoundException") ||
        msg.includes("MultiFormatReader") ||
        msg.includes("ChecksumException") ||
        msg.includes("FormatTracker") ||
        msg.includes("Trying to play video that is already playing")
      );
    };

    console.log = (...args: any[]) => {
      if (shouldSilenceLog(args)) return;
      originalConsoleLog.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      if (shouldSilenceLog(args)) return;
      originalConsoleWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      if (shouldSilenceLog(args)) return;
      originalConsoleError.apply(console, args);
    };

    console.info = (...args: any[]) => {
      if (shouldSilenceLog(args)) return;
      originalConsoleInfo.apply(console, args);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = String(event.reason?.name || event.reason || "");
      if (reasonStr.includes("NotFoundException")) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    async function initCamera() {
      try {
        setCameraError(null);

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

        if (!isMounted || !videoRef.current) return;

        await reader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result) => {
          if (result && !isScanningRef.current && isMounted) {
            isScanningRef.current = true;
            const barcode = result.getText();
            processItemFlow(barcode);
          }
        });
      } catch (err: any) {
        if (isMounted) {
          setCameraError("Camera access denied or unavailable. Please check permissions.");
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      stopCameraHardware();
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
      console.info = originalConsoleInfo;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  const parseErrorMessage = (err: any, fallback: string): string => {
    if (!err) return fallback;
    if (typeof err === "string") return err;
    if (err.detail) {
      if (typeof err.detail === "string") return err.detail;
      if (Array.isArray(err.detail)) {
        return err.detail
          .map((item: any) => (typeof item === "string" ? item : item.msg || JSON.stringify(item)))
          .join(", ");
      }
      if (typeof err.detail === "object") {
        return err.detail.message || JSON.stringify(err.detail);
      }
    }
    if (Array.isArray(err)) {
      return err
        .map((item) =>
          typeof item === "string" ? item : item.msg || item.message || JSON.stringify(item),
        )
        .join(", ");
    }
    if (err.message && typeof err.message === "string") {
      return err.message;
    }
    return fallback;
  };

  const processItemFlow = async (barcode: string) => {
    setFeedback(null);

    const isDuplicate = itemsRef.current.some((item) => item.barcode === barcode);
    if (isDuplicate) {
      setWarningModalMessage("item already scanned");
      resetScanCooldown();
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch<ScanItemResponse>("/items/scan", {
        method: "POST",
        body: JSON.stringify({ barcode }),
      });

      if (!res.is_valid) {
        setFeedback({
          type: "error",
          message: res.message || "Invalid or unrecognized item barcode.",
        });
        resetScanCooldown();
        return;
      }

      const newItem: ScannedItem = {
        id: `${barcode}-${Date.now()}`,
        barcode,
        name: res.item_name || "Deposit Item",
        value: res.deposit_value || 0.5,
      };

      updateItems([newItem, ...itemsRef.current]);
      setFeedback({
        type: "success",
        message: `Added: ${newItem.name} (+${newItem.value.toFixed(2)} PLN)`,
      });
    } catch (err: any) {
      const errorMsg = parseErrorMessage(err, "Failed to process item.");
      setFeedback({
        type: "error",
        message: errorMsg,
      });
    } finally {
      resetScanCooldown();
    }
  };

  const resetScanCooldown = () => {
    setLoading(false);
    setTimeout(() => {
      isScanningRef.current = false;
    }, 1800);
  };

  const handleFinish = async () => {
    if (items.length === 0) {
      stopCameraHardware();
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const barcodes = items.map((i) => i.barcode);
      await apiFetch("/wallet/finish-session", {
        method: "POST",
        body: JSON.stringify({ barcodes }),
      });

      stopCameraHardware();
      router.push("/dashboard");
    } catch (err: any) {
      const errorMsg = parseErrorMessage(err, "Batch contains already scanned items");
      setWarningModalMessage(errorMsg);
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    stopCameraHardware();
    router.push("/dashboard");
  };

  const itemCount = items.length;
  const totalValue = itemCount * 0.5;

  return (
    <AppShell title="Scan Items" subtitle="Bottles and cans" onBack={handleBackNavigation}>
      {warningModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-white/10 bg-[#1a0f1c] p-6 text-center shadow-[0_30px_80px_-20px_rgba(208,154,189,0.45)]">
            <h3 className="font-display text-lg font-semibold text-white">Warning</h3>
            <p className="text-sm font-semibold text-red-300">{warningModalMessage}</p>
            <button
              onClick={() => setWarningModalMessage(null)}
              className="w-full rounded-full bg-[#d09abd] py-2.5 text-sm font-semibold text-[#1a0d1a] shadow-[0_0_30px_rgba(208,154,189,0.4)] transition hover:bg-[#e2b5d2]"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />

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

      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-[#3a1d36] via-[#24121f] to-[#140b17] p-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Scanned Items
          </span>
          <div className="font-display text-2xl font-semibold">{itemCount} pcs</div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Total Refund
          </span>
          <div className="font-display text-2xl font-semibold text-[#d09abd]">
            +{totalValue.toFixed(2)} PLN
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border p-3 text-center text-sm font-semibold ${
            feedback.type === "success"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/30 bg-red-400/10 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="max-h-48 flex-1 space-y-3 overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Session Items ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="py-4 text-center text-xs italic text-white/40">
            Align item barcode inside the viewfinder to scan.
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2 text-xs">
                <div>
                  <p className="font-semibold text-white/90">{item.name}</p>
                  <p className="font-mono text-white/40">{item.barcode}</p>
                </div>
                <span className="font-bold text-emerald-300">+0.50 PLN</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleFinish}
        disabled={loading}
        className="w-full rounded-full bg-[#d09abd] py-3 text-sm font-semibold text-[#1a0d1a] shadow-[0_0_30px_rgba(208,154,189,0.4)] transition hover:bg-[#e2b5d2] disabled:opacity-50"
      >
        {loading ? "Processing..." : `Finish (${itemCount} items • ${totalValue.toFixed(2)} PLN)`}
      </button>
    </AppShell>
  );
}
