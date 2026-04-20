"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLinkifyStore } from "@/lib/store";
import { resolveTemplate } from "@/lib/template";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface LinkHealthModalProps {
  open: boolean;
  onClose: () => void;
}

interface HealthResult {
  templateId: string;
  templateName: string;
  url: string;
  status: "checking" | "ok" | "warning" | "error" | "unknown";
  statusText?: string;
  lastChecked: number;
}

export function LinkHealthModal({ open, onClose }: LinkHealthModalProps) {
  const { templates } = useLinkifyStore();
  const [results, setResults] = useState<HealthResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);

  const checkUrl = async (templateId: string, templateName: string, url: string): Promise<HealthResult> => {
    try {
      // Use a CORS proxy or try direct fetch
      // For CORS, we'll try a simple HEAD request first
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(url, {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return {
          templateId,
          templateName,
          url,
          status: "ok",
          statusText: "Reachable",
          lastChecked: Date.now(),
        };
      } catch {
        clearTimeout(timeoutId);
        // Try with GET as fallback
        try {
          const response = await fetch(url, {
            method: "GET",
            mode: "no-cors",
            signal: controller.signal,
          });
          return {
            templateId,
            templateName,
            url,
            status: "ok",
            statusText: "Reachable",
            lastChecked: Date.now(),
          };
        } catch {
          return {
            templateId,
            templateName,
            url,
            status: "warning",
            statusText: "Could not verify (CORS blocking)",
            lastChecked: Date.now(),
          };
        }
      }
    } catch {
      return {
        templateId,
        templateName,
        url,
        status: "unknown",
        statusText: "Check failed",
        lastChecked: Date.now(),
      };
    }
  };

  const runHealthCheck = async () => {
    setIsChecking(true);
    setResults([]);
    setCheckedCount(0);

    const allResults: HealthResult[] = [];

    for (const template of templates) {
      // Generate URL with example values to test
      const vars = template.template.match(/\{([A-Za-z0-9_\-]+)\}/g) || [];
      const exampleValues: Record<string, string> = {};
      vars.forEach((v: string) => {
        const name = v.replace(/[{}]/g, "");
        exampleValues[name] = name + "-example";
      });

      const url = resolveTemplate(template.template, exampleValues, template._encode || {});

      setResults(prev => [...prev, {
        templateId: template.id,
        templateName: template.name,
        url,
        status: "checking",
        lastChecked: 0,
      }]);

      const result = await checkUrl(template.id, template.name, url);
      allResults.push(result);
      setResults(allResults);
      setCheckedCount(prev => prev + 1);
    }

    setIsChecking(false);
    toast.success("Health check complete");
  };

  // Auto-run check when modal opens
  useEffect(() => {
    if (open && results.length === 0 && !isChecking) {
      runHealthCheck();
    }
  }, [open]);

  const stats = {
    total: templates.length,
    ok: results.filter(r => r.status === "ok").length,
    warning: results.filter(r => r.status === "warning").length,
    error: results.filter(r => r.status === "error").length,
    unknown: results.filter(r => r.status === "unknown").length,
  };

  const getStatusIcon = (status: HealthResult["status"]) => {
    switch (status) {
      case "ok":
        return <CheckCircle size={16} className="text-green-500" />;
      case "warning":
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case "error":
        return <XCircle size={16} className="text-red-500" />;
      case "checking":
        return <RefreshCw size={16} className="text-muted-foreground animate-spin" />;
      default:
        return <XCircle size={16} className="text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: HealthResult["status"]) => {
    switch (status) {
      case "ok":
        return "border-green-500/30 bg-green-500/5";
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/5";
      case "error":
        return "border-red-500/30 bg-red-500/5";
      default:
        return "border-border";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={18} />
            Link Health Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-5 gap-2">
            <div className="p-3 rounded-lg border border-border bg-secondary/30 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
              <div className="text-2xl font-bold text-green-500">{stats.ok}</div>
              <div className="text-xs text-muted-foreground">OK</div>
            </div>
            <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.warning}</div>
              <div className="text-xs text-muted-foreground">Warning</div>
            </div>
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-center">
              <div className="text-2xl font-bold text-red-500">{stats.error}</div>
              <div className="text-xs text-muted-foreground">Error</div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-secondary/30 text-center">
              <div className="text-2xl font-bold">{stats.unknown}</div>
              <div className="text-xs text-muted-foreground">Unknown</div>
            </div>
          </div>

          {/* Run check button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isChecking
                ? `Checking ${checkedCount} of ${templates.length}...`
                : `${results.length} templates checked`}
            </p>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runHealthCheck}
                  disabled={isChecking}
                >
                  <RefreshCw size={14} className={`mr-1 ${isChecking ? "animate-spin" : ""}`} />
                  {isChecking ? "Checking..." : "Run Check"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Re-check all template URLs for availability</TooltipContent>
            </Tooltip>
          </div>

          {/* Results */}
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {results.length === 0 && !isChecking && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No health data yet.</p>
                  <p className="text-sm mt-1">Click "Run Check" to verify all template URLs.</p>
                </div>
              )}
              {results.map((result) => (
                <div
                  key={result.templateId}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)} transition-colors`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{result.templateName}</div>
                        <div className="text-xs text-muted-foreground font-mono truncate mt-1" title={result.url}>
                          {result.url}
                        </div>
                        {result.statusText && (
                          <div className="text-xs mt-1 text-muted-foreground">
                            {result.statusText}
                          </div>
                        )}
                      </div>
                    </div>
                    {result.status !== "checking" && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0"
                            onClick={() => window.open(result.url, "_blank", "noopener")}
                          >
                            <ExternalLink size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open this URL in a new browser tab</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Info */}
          <div className="text-xs text-muted-foreground p-3 rounded-lg bg-secondary/30">
            <p className="font-medium mb-1">Note:</p>
            <p>Health checks are simulated in the browser. Due to CORS restrictions, some URLs may show as "Warning" even if they are valid. For accurate results, a server-side proxy would be needed.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </TooltipTrigger>
            <TooltipContent>Close the health dashboard</TooltipContent>
          </Tooltip>
        </div>
      </DialogContent>
    </Dialog>
  );
}
