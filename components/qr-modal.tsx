"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface QRModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
}

export function QRModal({ open, onClose, url }: QRModalProps) {
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");

  const sizeMap = { small: 128, medium: 256, large: 384 };

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const sizePx = sizeMap[size];
    canvas.width = sizePx;
    canvas.height = sizePx;
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, sizePx, sizePx);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = "linkify-qr.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("QR code downloaded");
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleCopyPNG = async () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const sizePx = sizeMap[size];
    canvas.width = sizePx;
    canvas.height = sizePx;
    img.onload = async () => {
      ctx?.drawImage(img, 0, 0, sizePx, sizePx);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      const binary = atob(pngUrl.split(",")[1]);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: "image/png" });
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("QR code copied to clipboard");
      } catch {
        toast.error("Copy failed — try downloading instead");
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Size:</span>
            <div className="flex gap-1">
              {(["small", "medium", "large"] as const).map((s) => (
                <Tooltip key={s}>
                  <TooltipTrigger>
                    <Button
                      variant={size === s ? "default" : "outline"}
                      size="sm"
                      className="text-xs capitalize"
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {s === "small" ? "128x128px - Good for small prints" : s === "medium" ? "256x256px - Recommended size" : "384x384px - Best for large displays"}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              id="qr-code-svg"
              value={url || "https://linkify.app"}
              size={sizeMap[size]}
              level="M"
              includeMargin
            />
          </div>

          {/* URL preview */}
          <div className="text-xs text-muted-foreground text-center break-all max-w-full px-2 font-mono">
            {url || "Enter values to generate URL"}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download size={14} className="mr-1" />
                  Download PNG
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save the QR code as a PNG image file</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="outline" size="sm" onClick={handleCopyPNG}>
                  <Copy size={14} className="mr-1" />
                  Copy PNG
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy the QR code image to clipboard</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}