"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { resolveTemplate } from "@/lib/template";
import { toast } from "sonner";
import { Download, Copy, Upload } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  template: string;
  variables: string[];
  encodeMap: Record<string, boolean>;
}

interface ParsedRow {
  [key: string]: string;
}

export function CsvImportModal({ open, onClose, template, variables, encodeMap }: CsvImportModalProps) {
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
  const [step, setStep] = useState<"upload" | "map" | "preview">("upload");

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim());
        if (lines.length < 2) {
          toast.error("CSV must have at least a header row and one data row");
          return;
        }
        const headerLine = lines[0];
        const parsedHeaders = parseCSVLine(headerLine);
        setHeaders(parsedHeaders);

        const rows: ParsedRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row: ParsedRow = {};
          parsedHeaders.forEach((h, idx) => {
            row[h] = values[idx] || "";
          });
          rows.push(row);
        }
        setCsvData(rows);

        // Auto-map columns that match variable names
        const mapping: Record<string, string> = {};
        variables.forEach(v => {
          const match = parsedHeaders.find(h => h.toLowerCase() === v.toLowerCase());
          if (match) mapping[v] = match;
        });
        setColumnMapping(mapping);
        setStep("map");
        toast.success(`Loaded ${rows.length} rows`);
      } catch {
        toast.error("Failed to parse CSV");
      }
    };
    reader.readAsText(file);
  }, [variables]);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const generateUrls = useCallback(() => {
    const urls: string[] = [];
    csvData.forEach(row => {
      const values: Record<string, string> = {};
      variables.forEach(v => {
        const column = columnMapping[v];
        values[v] = column ? (row[column] || "") : "";
      });
      const url = resolveTemplate(template, values, encodeMap);
      urls.push(url);
    });
    setGeneratedUrls(urls);
    setStep("preview");
  }, [csvData, variables, columnMapping, template, encodeMap]);

  const handleCopyAll = useCallback(async () => {
    if (generatedUrls.length === 0) return;
    await navigator.clipboard.writeText(generatedUrls.join("\n"));
    toast.success(`Copied ${generatedUrls.length} URLs`);
  }, [generatedUrls]);

  const handleExportCSV = useCallback(() => {
    if (generatedUrls.length === 0) return;
    const csv = "url\n" + generatedUrls.map(url => `"${url}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkify-urls.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  }, [generatedUrls]);

  const handleClose = () => {
    setStep("upload");
    setCsvData([]);
    setHeaders([]);
    setColumnMapping({});
    setGeneratedUrls([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload size={18} />
            CSV Bulk Import
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === "upload" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file with headers. Each column header should match a variable name.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:opacity-90">
                  <span>Choose CSV File</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-2">CSV Format:</p>
                <code className="block bg-secondary p-2 rounded font-mono">
                  {variables.join(", ")}<br />
                  {variables.map(() => "value").join(", ")}
                </code>
              </div>
            </div>
          )}

          {step === "map" && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Loaded {csvData.length} rows. Map CSV columns to template variables.
              </div>
              <div className="space-y-3">
                {variables.map(variable => (
                  <div key={variable} className="flex items-center gap-4">
                    <div className="w-40 text-sm font-mono truncate">{variable}</div>
                    <div className="flex-1">
                      <select
                        value={columnMapping[variable] || ""}
                        onChange={(e) => setColumnMapping(prev => ({ ...prev, [variable]: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
                      >
                        <option value="">-- Select column --</option>
                        {headers.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="ghost" onClick={() => setStep("upload")}>Back</Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to upload a different CSV file</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button onClick={generateUrls}>Generate URLs</Button>
                  </TooltipTrigger>
                  <TooltipContent>Generate URLs by combining CSV data with template variables</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {generatedUrls.length} URL{generatedUrls.length !== 1 ? "s" : ""} generated
                </span>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="outline" size="sm" onClick={handleCopyAll}>
                        <Copy size={12} className="mr-1" />
                        Copy All
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy all generated URLs to clipboard (one per line)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download size={12} className="mr-1" />
                        Export CSV
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download generated URLs as a CSV file</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-1">
                  {generatedUrls.map((url, i) => (
                    <div
                      key={i}
                      className="text-xs font-mono bg-secondary/50 px-3 py-2 rounded border border-border truncate"
                      title={url}
                    >
                      {url}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-between mt-6">
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="ghost" onClick={() => setStep("map")}>Back</Button>
                  </TooltipTrigger>
                  <TooltipContent>Go back to edit column mappings</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="ghost" onClick={handleClose}>Close</Button>
                  </TooltipTrigger>
                  <TooltipContent>Close CSV import and discard changes</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
