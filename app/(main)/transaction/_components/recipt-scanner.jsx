"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedResult,
    error: scanError,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', file);
      await scanReceiptFn(formData);
    } catch (error) {
      console.error("Error scanning receipt:", error);
      toast.error("Failed to scan receipt. Please enter details manually.");
      setIsSupported(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle scan results
  useEffect(() => {
    if (scannedResult && !scanReceiptLoading) {
      if (scannedResult.success && scannedResult.data) {
        // Call the callback directly without memoization
        if (onScanComplete) {
          onScanComplete(scannedResult.data);
        }
        toast.success("Receipt scanned successfully!");
      } else {
        const errorMessage = scannedResult.error || "Failed to scan receipt";
        toast.error(errorMessage);
        
        // If API is not configured, disable the feature
        if (errorMessage.includes("not configured")) {
          setIsSupported(false);
        }
      }
    }
  }, [scannedResult, scanReceiptLoading]); // Removed onScanComplete from dependencies

  // Handle scan errors
  useEffect(() => {
    if (scanError) {
      console.error("Scan error:", scanError);
      toast.error("Failed to scan receipt. Please enter details manually.");
      setIsSupported(false);
    }
  }, [scanError]);

  // Don't render if AI scanning is not supported
  if (!isSupported) {
    return null;
  }

  const isLoading = scanReceiptLoading || isProcessing;

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleReceiptScan(file);
            // Clear the input so the same file can be selected again
            e.target.value = '';
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}
