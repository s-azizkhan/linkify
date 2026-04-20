"use client";

import { useLinkifyStore } from "@/lib/store";
import { detectVariables, resolveTemplate, sanitize, extractDomain, resolveRouting } from "@/lib/template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Sun, Moon, Bookmark, Copy, ExternalLink, QrCode, History, Upload, Globe } from "lucide-react";
import { QRModal } from "./qr-modal";
import { VersionHistoryModal } from "./version-history-modal";
import { CsvImportModal } from "./csv-import-modal";
import { RoutingRulesModal } from "./routing-rules-modal";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TemplateEditorProps {
  onEdit: () => void;
}

export function TemplateEditor({ onEdit }: TemplateEditorProps) {
  const {
    templates,
    selectedId,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    linkHistory,
    addToHistory,
    clearHistory,
    setConfig,
    config,
    incrementUsage,
  } = useLinkifyStore();
  const [values, setValues] = useState<Record<string, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [routingModalOpen, setRoutingModalOpen] = useState(false);
  const [batchTab, setBatchTab] = useState<"single" | "batch">("single");
  const [batchValues, setBatchValues] = useState<Record<string, string>>({});

  const template = templates.find((t) => t.id === selectedId);

  useEffect(() => {
    if (template) {
      // Pre-fill from defaults, then overlay saved values
      setValues({ ...(template._defaults || {}), ...(template._values || {}) });
    } else {
      setValues({});
    }
    inputRefs.current = [];
  }, [template?._defaults, template?._values, template?.id]);

  const vars = template ? detectVariables(template.template) : [];
  const encodeMap = template?._encode || {};
  const defaults = template?._defaults || {};
  const routing = template?._routing || { enabled: false, rules: [], defaultUrl: "" };

  const resolvedUrl = template
    ? resolveTemplate(template.template, values, encodeMap)
    : "";

  const finalUrl = routing.enabled
    ? resolveRouting(resolvedUrl, routing)
    : resolvedUrl;

  const domain = template ? extractDomain(template.template) : "";
  const exampleUrl = template
    ? resolveTemplate(
        template.template,
        vars.reduce((acc, v) => ({ ...acc, [v]: v }), {}),
        encodeMap
      )
    : "";

  const handleValueChange = useCallback(
    (varName: string, val: string) => {
      setValues((prev) => {
        const next = { ...prev, [varName]: val };
        if (selectedId) {
          updateTemplate(selectedId, { _values: next });
        }
        return next;
      });
    },
    [selectedId, updateTemplate]
  );

  const handleEncodeToggle = useCallback(
    (varName: string) => {
      if (!selectedId || !template) return;
      const newEncode = { ...template._encode, [varName]: !encodeMap[varName] };
      updateTemplate(selectedId, { _encode: newEncode });
    },
    [selectedId, template, encodeMap, updateTemplate]
  );

  const handleSetDefault = useCallback(
    (varName: string) => {
      if (!selectedId || !template) return;
      const currentVal = values[varName] || "";
      if (!currentVal) {
        toast.error("Enter a value first");
        return;
      }
      const newDefaults = { ...template._defaults, [varName]: currentVal };
      updateTemplate(selectedId, { _defaults: newDefaults });
      toast.success(`Default saved for ${varName}`);
    },
    [selectedId, template, values, updateTemplate]
  );

  const handleFillAll = useCallback(() => {
    if (!selectedId) return;
    const filled = vars.reduce((acc, v) => ({ ...acc, [v]: v }), {});
    setValues(filled);
    updateTemplate(selectedId, { _values: filled });
    toast.success("Filled all with example values");
  }, [vars, selectedId, updateTemplate]);

  const handleClearAll = useCallback(() => {
    if (!selectedId) return;
    setValues({});
    updateTemplate(selectedId, { _values: {} });
    toast.success("Cleared all values");
  }, [selectedId, updateTemplate]);

  const handleToggleTheme = useCallback(() => {
    setConfig({ theme: config.theme === "dark" ? "light" : "dark" });
  }, [config.theme, setConfig]);

  const handleOpen = useCallback(() => {
    if (!template) return;
    if (vars.length > 0 && vars.some((v) => !values[v])) {
      toast.error("Fill all variables before opening");
      return;
    }
    window.open(finalUrl, "_blank", "noopener");
    addToHistory(finalUrl);
    if (selectedId) {
      incrementUsage(selectedId);
    }
  }, [template, vars, values, finalUrl, addToHistory, selectedId, incrementUsage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (index < vars.length - 1) {
          inputRefs.current[index + 1]?.focus();
        } else {
          handleOpen();
        }
      }
    },
    [vars.length, handleOpen]
  );

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(finalUrl);
    toast.success("URL copied to clipboard");
  };

  const handleCopyTemplate = async () => {
    if (!template) return;
    await navigator.clipboard.writeText(template.template);
    toast.success("Template copied");
  };

  const handleDelete = () => {
    if (!confirm("Delete this template?")) return;
    if (selectedId) {
      deleteTemplate(selectedId);
      toast.success("Deleted");
    }
  };

  const handleDuplicate = () => {
    if (selectedId) {
      duplicateTemplate(selectedId);
      toast.success("Template duplicated");
    }
  };

  const openFromHistory = (url: string) => {
    window.open(url, "_blank", "noopener");
    if (selectedId) incrementUsage(selectedId);
  };

  const copyFromHistory = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  // Batch URL Builder
  const parseBatchValues = useCallback((input: string): string[] => {
    if (!input.trim()) return [];
    // Split by newline first, then by comma within each line
    const lines = input.split("\n").map(l => l.trim()).filter(Boolean);
    const values: string[] = [];
    lines.forEach(line => {
      if (line.includes(",")) {
        line.split(",").map(v => v.trim()).filter(Boolean).forEach(v => values.push(v));
      } else {
        values.push(line);
      }
    });
    return values;
  }, []);

  const batchResults = useMemo(() => {
    if (batchTab !== "batch" || vars.length === 0 || !template) return [];
    const lists = vars.map(v => parseBatchValues(batchValues[v] || ""));
    if (lists.some(l => l.length === 0)) return [];
    // Cartesian product
    const cartesian = lists.reduce<(string[])[]>((acc, list) => {
      if (acc.length === 0) return list.map(v => [v]);
      return acc.flatMap(combo =>
        list.map(v => [...combo, v])
      );
    }, []);
    return cartesian.map(combo => {
      const vals = vars.reduce((a, v, i) => ({ ...a, [v]: combo[i] }), {} as Record<string, string>);
      return resolveTemplate(template.template, vals, encodeMap);
    });
  }, [batchTab, batchValues, vars, template, encodeMap, parseBatchValues]);

  const handleCopyAllBatch = useCallback(async () => {
    if (batchResults.length === 0) return;
    await navigator.clipboard.writeText(batchResults.join("\n"));
    toast.success(`Copied ${batchResults.length} URLs`);
  }, [batchResults]);

  const handleExportBatchCSV = useCallback(() => {
    if (batchResults.length === 0) return;
    const csv = "url\n" + batchResults.map(url => `"${url}"`).join("\n");
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
  }, [batchResults]);

  const handleBatchValueChange = useCallback((varName: string, val: string) => {
    setBatchValues(prev => ({ ...prev, [varName]: val }));
  }, []);

  if (!template) {
    return (
      <main className="flex-1 min-w-0 p-8 overflow-y-auto scrollable flex flex-col items-center justify-center text-center text-muted-foreground">
        <div className="mb-4 text-3xl font-semibold">Welcome to Linkify</div>
        <div className="max-w-lg">
          Create named URL templates with variables like{" "}
          <code className="bg-secondary px-1.5 py-0.5 rounded text-sm">{"{branch}"}</code>.
          Select a template to fill variables and open the resolved URL. Use drag
          & drop to reorder templates.
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 p-8 overflow-y-auto scrollable flex flex-col">
      <div className="max-w-4xl w-full mx-auto space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold break-words">{sanitize(template.name)}</h1>
              {domain && (
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-secondary shrink-0">
                  {domain}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1 truncate">
              Updated: {new Date(template.updatedAt).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleTheme}
                  className="h-8 w-8"
                >
                  {config.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle between light and dark theme</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="ghost" size="sm" onClick={handleDuplicate}>
                  Duplicate
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a copy of this template</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryModalOpen(true)}
                >
                  <History size={14} className="mr-1" />
                  History
                  {template._versions && template._versions.length > 0 && (
                    <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                      {template._versions.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>View and restore previous versions</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRoutingModalOpen(true)}
                >
                  <Globe size={14} className="mr-1" />
                  Routing
                  {template._routing?.enabled && (
                    <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                      ON
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Set up dynamic routing rules (device, location, time)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              </TooltipTrigger>
              <TooltipContent>Change template name, URL, or campaign</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>Permanently delete this template</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Template display */}
        <div>
          <label className="text-sm text-muted-foreground">Template</label>
          <pre className="mt-2 bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto break-words border border-border font-mono max-w-full">
            {sanitize(template.template)}
          </pre>
        </div>

        {/* Variables */}
        {vars.length > 0 && (
          <div className="flex gap-2 mb-2 border-b border-border pb-2">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant={batchTab === "single" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBatchTab("single")}
                  className="text-xs"
                >
                  Single
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fill in one set of values</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant={batchTab === "batch" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBatchTab("batch")}
                  className="text-xs"
                >
                  Batch
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate multiple URLs at once with different values</TooltipContent>
            </Tooltip>
          </div>
        )}

        <div className="grid gap-3">
          {vars.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No variables detected in this template.
            </div>
          ) : batchTab === "single" ? (
            <>
              {vars.length > 1 && (
                <div className="flex gap-2 mb-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="outline" size="sm" onClick={handleFillAll} className="text-xs">
                        <ExternalLink size={12} className="mr-1" />
                        Fill All (examples)
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Fill all fields with example values {'{variable_name}'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="outline" size="sm" onClick={handleClearAll} className="text-xs">
                        Clear All
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear all input values</TooltipContent>
                  </Tooltip>
                </div>
              )}
              {vars.map((name, index) => (
                <div key={name} className="flex gap-3 items-center">
                  <div className="w-40 text-sm text-muted-foreground truncate font-mono">{name}</div>
                  <div className="flex-1 flex gap-2 items-center">
                    <Input
                      ref={(el) => { inputRefs.current[index] = el; }}
                      placeholder={defaults[name] || name}
                      value={values[name] || ""}
                      onChange={(e) => handleValueChange(name, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="flex-1 font-mono"
                    />
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-mono px-2"
                          onClick={() => handleSetDefault(name)}
                          disabled={!values[name]}
                        >
                          <Bookmark size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Save current value as the default for this field</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-mono"
                          onClick={() => handleEncodeToggle(name)}
                        >
                          {encodeMap[name] === false ? "RAW" : "ENC"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {encodeMap[name] === false ? "Currently RAW: value is not URL-encoded" : "Currently ENC: value will be URL-encoded"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Batch mode inputs */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">
                  Enter multiple values per variable (newline or comma separated)
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="outline" size="sm" onClick={() => setCsvImportOpen(true)}>
                      <Upload size={12} className="mr-1" />
                      Import CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Import values from a CSV file with headers matching variable names</TooltipContent>
                </Tooltip>
              </div>
              {vars.map((name) => (
                <div key={name} className="flex gap-3 items-start">
                  <div className="w-40 text-sm text-muted-foreground truncate font-mono mt-2">{name}</div>
                  <div className="flex-1">
                    <textarea
                      placeholder={`${name} 1\n${name} 2\n...`}
                      value={batchValues[name] || ""}
                      onChange={(e) => handleBatchValueChange(name, e.target.value)}
                      className="w-full min-h-[80px] px-3 py-2 text-sm font-mono bg-background border border-border rounded-md resize-y"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {parseBatchValues(batchValues[name] || "").length} value(s)
                    </div>
                  </div>
                </div>
              ))}
              {batchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {batchResults.length} URL{batchResults.length !== 1 ? "s" : ""} generated
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="outline" size="sm" onClick={handleCopyAllBatch}>
                          <Copy size={12} className="mr-1" />
                          Copy All URLs
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy all generated URLs to clipboard (one per line)</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="outline" size="sm" onClick={handleExportBatchCSV}>
                          Export CSV
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download generated URLs as a CSV file</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-secondary/50 rounded border border-border p-2 space-y-1">
                    {batchResults.map((url, i) => (
                      <div key={i} className="text-xs font-mono truncate" title={url}>
                        {url}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger>
              <Button onClick={handleOpen} disabled={vars.length > 0 && vars.some((v) => !values[v])}>
                Open in new tab
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Open the generated URL in a new browser tab</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="sm" onClick={handleCopyUrl}>
                <Copy size={14} className="mr-1" />
                Copy URL
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy the generated URL to clipboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="sm" onClick={handleCopyTemplate}>
                Copy Template
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy the template URL pattern (without variable values)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="sm" onClick={() => { setQrModalOpen(true); }}>
                <QrCode size={14} className="mr-1" />
                QR
              </Button>
            </TooltipTrigger>
            <TooltipContent>Generate a QR code for the current URL</TooltipContent>
          </Tooltip>
          <div className="min-w-0 flex-1 text-sm text-muted-foreground truncate font-mono">
            <span className="truncate block">{finalUrl}</span>
            {routing.enabled && (
              <span className="text-xs text-primary/60 flex items-center gap-1">
                <Globe size={10} /> Dynamic routing active
              </span>
            )}
          </div>
        </div>

        {/* URL Example */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground shrink-0">URL Example</label>
          <div className="min-w-0 flex-1 bg-secondary/50 rounded border border-border px-3 py-2 overflow-hidden">
            <span className="text-sm text-muted-foreground font-mono truncate block">{exampleUrl}</span>
          </div>
        </div>

        {/* Link History */}
        {linkHistory.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Recent Links</label>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearHistory}>
                Clear
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {linkHistory.slice(0, 10).map((item, idx) => {
                const hostname = (() => {
                  try { return new URL(item.url).hostname; }
                  catch { return item.url.substring(0, 30) + "..."; }
                })();
                return (
                  <div key={idx} className="relative group flex">
                    <button
                      onClick={() => openFromHistory(item.url)}
                      onContextMenu={(e) => { e.preventDefault(); copyFromHistory(item.url, e); }}
                      className="text-xs bg-secondary/50 hover:bg-secondary px-2 py-1 rounded border border-border font-mono truncate max-w-[200px] transition-colors"
                      title={`${item.url}\nRight-click to copy`}
                    >
                      {hostname}
                    </button>
                    <button
                      onClick={(e) => copyFromHistory(item.url, e)}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded p-0.5"
                      title="Copy URL"
                    >
                      <Copy size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-6 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            Author: <strong>S.Aziz Khan</strong> — Made with love & Passion
          </div>
          <div className="text-xs text-muted-foreground/60">
            Linkify © {new Date().getFullYear()}
          </div>
        </footer>
      </div>

      <QRModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={finalUrl}
      />
      {selectedId && (
        <VersionHistoryModal
          open={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          templateId={selectedId}
        />
      )}
      {template && (
        <CsvImportModal
          open={csvImportOpen}
          onClose={() => setCsvImportOpen(false)}
          template={template.template}
          variables={vars}
          encodeMap={encodeMap}
        />
      )}
      {selectedId && (
        <RoutingRulesModal
          open={routingModalOpen}
          onClose={() => setRoutingModalOpen(false)}
          templateId={selectedId}
        />
      )}
    </main>
  );
}