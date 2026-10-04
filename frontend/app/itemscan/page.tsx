"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library";
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
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto flex flex-col space-y-5">
      {warningModalMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Warning</h3>
            <p className="text-sm font-semibold text-red-600">{warningModalMessage}</p>
            <button
              onClick={() => setWarningModalMessage(null)}
              className="w-full py-2.5 text-white font-bold text-sm rounded-xl shadow"
              style={{ backgroundColor: "rgb(208, 154, 189)" }}
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between border-b pb-3">
        <button
          onClick={handleBackNavigation}
          className="text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-800">Scan Kaucja Item</h1>
        <div className="w-8" />
      </header>

      <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

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

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-gray-400">
            Scanned Items
          </span>
          <div className="text-2xl font-extrabold text-gray-800">{itemCount} pcs</div>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider font-bold text-gray-400">
            Total Refund
          </span>
          <div className="text-2xl font-extrabold text-[rgb(208,154,189)]">
            +{totalValue.toFixed(2)} PLN
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-sm font-semibold text-center transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-3 overflow-y-auto max-h-48">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Session Items ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-4">
            Align item barcode inside the viewfinder to scan.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 space-y-2">
            {items.map((item) => (
              <li key={item.id} className="pt-2 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-gray-700">{item.name}</p>
                  <p className="text-gray-400 font-mono">{item.barcode}</p>
                </div>
                <span className="font-bold text-emerald-600">+0.50 PLN</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleFinish}
        disabled={loading}
        className="w-full py-3 text-white font-bold text-sm rounded-xl shadow transition-opacity disabled:opacity-50"
        style={{ backgroundColor: "rgb(208, 154, 189)" }}
      >
        {loading ? "Processing..." : `Finish (${itemCount} items • ${totalValue.toFixed(2)} PLN)`}
      </button>
    </div>
  );
}
