"use client";

import { useLinkifyStore } from "@/lib/store";
import { detectVariables, extractDomain, sanitize, sampleTemplates, uuid } from "@/lib/template";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useRef, useMemo } from "react";
import { LinkHealthModal } from "./link-health-modal";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TemplateListProps {
  onAdd: () => void;
  onConfig: () => void;
}

export function TemplateList({ onAdd, onConfig }: TemplateListProps) {
  const {
    templates,
    selectedId,
    selectTemplate,
    reorderTemplates,
    config,
    importTemplates,
    resetToSample,
    addTemplate,
    setTemplates,
  } = useLinkifyStore();
  const [filter, setFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const dragId = useRef<string | null>(null);

  const campaigns = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => { if (t.campaign) set.add(t.campaign); });
    return Array.from(set).sort();
  }, [templates]);

  const filtered = templates.filter((t) => {
    const q = filter.toLowerCase();
    const matchSearch = t.name.toLowerCase().includes(q) ||
      t.template.toLowerCase().includes(q) ||
      detectVariables(t.template).some((v) => v.toLowerCase().includes(q));
    const matchCampaign = !campaignFilter || t.campaign === campaignFilter;
    return matchSearch && matchCampaign;
  });

  const handleExport = () => {
    const data = JSON.stringify(templates, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkify-templates.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (!Array.isArray(parsed)) throw new Error("Invalid format");
          const { uuid, now } = require("@/lib/template");
          const cleaned = parsed.map((p: Record<string, unknown>) => ({
            id: p.id || uuid(),
            name: String(p.name || "Untitled"),
            template: String(p.template || ""),
            campaign: String(p.campaign || ""),
            createdAt: p.createdAt || now(),
            updatedAt: p.updatedAt || now(),
            _values: (p._values as Record<string, string>) || {},
            _encode: (p._encode as Record<string, boolean>) || {},
            _defaults: (p._defaults as Record<string, string>) || {},
            usageCount: (p.usageCount as number) || 0,
            _versions: (p._versions as Array<{id: string; name: string; template: string; campaign: string; updatedAt: number}>) || [],
            _routing: (p._routing as { enabled: boolean; rules: Array<{id: string; type: "geo" | "device" | "time"; operator: "equals" | "contains" | "startsWith"; value: string; targetUrl: string}>; defaultUrl: string }) || { enabled: false, rules: [], defaultUrl: "" },
          }));
          importTemplates(cleaned);
          toast.success("Imported");
        } catch (err) {
          toast.error("Import failed: " + (err as Error).message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (!confirm("Replace all templates with sample data?")) return;
    resetToSample();
    toast.success("Reset to sample data");
  };

  const handleClearAll = () => {
    if (!confirm("Are you sure? This will delete all your templates. This action cannot be undone.")) return;
    setTemplates([]);
    selectTemplate(null);
    toast.success("All templates cleared");
  };

  const handleDragStart = (id: string) => {
    dragId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, _id: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toId: string) => {
    e.preventDefault();
    if (dragId.current && dragId.current !== toId) {
      reorderTemplates(dragId.current, toId);
      toast.success("Reordered templates");
    }
    dragId.current = null;
  };

  return (
    <aside className="w-96 min-w-0 shrink-0 border-r border-border flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="40"
            height="40"
            className="rounded-lg"
          >
            <title>Linkify Logo</title>
            <defs>
              <mask id="gap-bottom-list">
                <rect width="48" height="48" fill="white" />
                <circle cx="24" cy="29.2" r="3" fill="black" />
              </mask>
              <mask id="gap-top-list">
                <rect width="48" height="48" fill="white" />
                <circle cx="24" cy="18.8" r="3" fill="black" />
              </mask>
            </defs>
            <rect width="48" height="48" fill="#0F172A" rx="10" />
            <g
              transform="rotate(-45 24 24)"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M 21 18 L 12 18 A 3 3 0 0 0 9 21 A 3 3 0 0 1 6 24 A 3 3 0 0 1 9 27 A 3 3 0 0 0 12 30 L 21 30 A 6 6 0 0 0 21 18 Z"
                stroke="#F8FAFC"
                mask="url(#gap-bottom-list)"
              />
              <path
                d="M 27 18 A 6 6 0 0 0 27 30 L 36 30 A 3 3 0 0 0 39 27 A 3 3 0 0 1 42 24 A 3 3 0 0 1 39 21 A 3 3 0 0 0 36 18 Z"
                stroke="#00E5FF"
                mask="url(#gap-top-list)"
              />
            </g>
          </svg>
        </div>
        <div>
          <div className="text-2xl font-semibold">Linkify</div>
          <div className="text-xs text-muted-foreground -mt-0.5">
            URL Template Builder
          </div>
        </div>
      </div>

      {/* Search + Add */}
      <div className="flex gap-3">
        <Tooltip>
          <TooltipTrigger>
            <Input
              id="template-search"
              placeholder="Search or paste URL..."
              value={filter}
              onChange={(e) => {
                const val = e.target.value;
                setFilter(val);
                if (val.startsWith("http")) {
                  onAdd();
                }
              }}
              className="flex-1"
            />
          </TooltipTrigger>
          <TooltipContent side="bottom">Type to search templates or paste a URL to create a new template</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger onClick={onAdd} className="inline-flex shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 text-xs font-medium border border-transparent">
            New
          </TooltipTrigger>
          <TooltipContent>Create a new URL template</TooltipContent>
        </Tooltip>
      </div>

      {/* List header */}
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground shrink-0">Saved Templates</span>
        {campaigns.length > 0 && (
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="text-xs bg-secondary border border-border rounded px-2 py-1 max-w-[140px] truncate"
          >
            <option value="">All campaigns</option>
            <option value="">No campaign</option>
            {campaigns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        <div className="flex gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger
              onClick={onConfig}
              className="inline-flex shrink-0 items-center justify-center rounded-md hover:bg-accent h-8 w-8"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </TooltipTrigger>
            <TooltipContent>App settings and preferences</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={handleImport}
              className="inline-flex shrink-0 items-center justify-center rounded-md hover:bg-accent h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Import
            </TooltipTrigger>
            <TooltipContent>Import templates from a JSON file</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={handleExport}
              className="inline-flex shrink-0 items-center justify-center rounded-md hover:bg-accent h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Export
            </TooltipTrigger>
            <TooltipContent>Export all templates as a JSON file</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Template list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 py-1">
          {templates.length === 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground mb-4 text-center">
                Try a sample template to get started
              </div>
              {sampleTemplates().map((sample) => (
                <div
                  key={sample.id}
                  className="flex items-center justify-between w-full p-3 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer group"
                  onClick={() => {
                    addTemplate({ ...sample, id: uuid() });
                    toast.success(`Added "${sample.name}" template`);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0 group-hover:text-primary transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{sanitize(sample.name)}</span>
                        {sample.campaign && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                            {sanitize(sample.campaign)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate font-mono">
                        {sanitize(sample.template)}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      addTemplate({ ...sample, id: uuid() });
                      toast.success(`Added "${sample.name}" template`);
                    }}
                  >
                    Add
                  </Button>
                </div>
              ))}
              <div className="pt-3 text-center">
                <Button variant="outline" size="sm" onClick={onAdd} className="text-xs">
                  Or create your own
                </Button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No templates match your search
            </div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                draggable={config.reorderEnabled}
                onDragStart={() => handleDragStart(t.id)}
                onDragOver={(e) => handleDragOver(e, t.id)}
                onDrop={(e) => handleDrop(e, t.id)}
                onClick={() => selectTemplate(t.id)}
                className={`
                  flex items-center justify-between w-full p-3 rounded-lg border cursor-pointer
                  transition-colors text-left min-w-0 overflow-hidden
                  ${
                    t.id === selectedId
                      ? "bg-accent border-border"
                      : "bg-transparent border-transparent hover:bg-accent/50"
                  }
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {config.reorderEnabled && (
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <path d="M5 12h14" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{sanitize(t.name)}</span>
                      {t.campaign && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                          {sanitize(t.campaign)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {sanitize(t.template)}
                    </div>
                    {t.usageCount > 0 && (
                      <div className="text-xs text-primary/60 mt-0.5">
                        {t.usageCount} {t.usageCount === 1 ? "use" : "uses"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 ml-2">
                  {new Date(t.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          <span>Persisted in </span>
          <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">
            linkify-store
          </code>
        </div>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger
              onClick={() => setHealthModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-md hover:bg-accent h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Health
            </TooltipTrigger>
            <TooltipContent>Check if your template URLs are still working</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={handleReset}
              className="inline-flex shrink-0 items-center justify-center rounded-md hover:bg-accent h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </TooltipTrigger>
            <TooltipContent>Reset to sample templates (will replace current templates)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={handleClearAll}
              className="inline-flex shrink-0 items-center justify-center rounded-md hover:bg-destructive/20 h-7 px-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear All
            </TooltipTrigger>
            <TooltipContent>Delete all templates (cannot be undone)</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <LinkHealthModal open={healthModalOpen} onClose={() => setHealthModalOpen(false)} />
    </aside>
  );
}