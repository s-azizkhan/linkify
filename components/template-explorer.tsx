"use client";

import { useState, useMemo, type ReactElement } from "react";
import { useLinkifyStore } from "@/lib/store";
import { explorerTemplates, categories, type ExplorerTemplate } from "@/lib/explorer-templates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uuid } from "@/lib/template";
import Link from "next/link";

const categoryIcons: Record<string, ReactElement> = {
  Development: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  DevOps: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Design: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Marketing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Docs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Communication: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Cloud: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  Project: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

const categoryColors: Record<string, string> = {
  Development: "from-blue-500/10 to-cyan-500/10 text-blue-500",
  DevOps: "from-amber-500/10 to-orange-500/10 text-amber-500",
  Design: "from-pink-500/10 to-rose-500/10 text-pink-500",
  Marketing: "from-emerald-500/10 to-teal-500/10 text-emerald-500",
  Docs: "from-purple-500/10 to-violet-500/10 text-purple-500",
  Communication: "from-cyan-500/10 to-sky-500/10 text-cyan-500",
  Cloud: "from-indigo-500/10 to-blue-500/10 text-indigo-500",
  Project: "from-rose-500/10 to-red-500/10 text-rose-500",
};

function TemplateCard({ template, onAdd }: { template: ExplorerTemplate; onAdd: (t: ExplorerTemplate) => void }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    onAdd(template);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="group relative p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      {/* Category badge */}
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[template.category]} mb-3`}>
        <span className="shrink-0">{categoryIcons[template.category]}</span>
        {template.category}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {template.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {template.description}
      </p>

      {/* Template preview */}
      <div className="bg-secondary/30 rounded-lg p-2.5 mb-4 border border-border/50">
        <code className="text-xs font-mono text-muted-foreground/80 break-all line-clamp-2 block">
          {template.template}
        </code>
      </div>

      {/* Variables */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {template.variables.map((v) => (
          <span
            key={v}
            className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono"
          >
            {`{${v}}`}
          </span>
        ))}
      </div>

      {/* Add button */}
      <Button
        onClick={handleAdd}
        disabled={isAdding}
        size="sm"
        className={`w-full transition-all duration-200 ${isAdding ? "bg-emerald-500 hover:bg-emerald-500" : ""}`}
      >
        {isAdding ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Added!
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Use Template
          </>
        )}
      </Button>
    </div>
  );
}

export function TemplateExplorer() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { addTemplate, templates } = useLinkifyStore();

  const filteredTemplates = useMemo(() => {
    let filtered = explorerTemplates;

    if (activeCategory !== "All") {
      filtered = filtered.filter((t) => t.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.template.toLowerCase().includes(q) ||
          t.variables.some((v) => v.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [search, activeCategory]);

  const handleAddTemplate = (template: ExplorerTemplate) => {
    addTemplate({
      id: uuid(),
      name: template.name,
      template: template.template,
      campaign: template.category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    });
    toast.success(`"${template.name}" added to your templates`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          {/* Back link */}
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 no-underline transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to App
          </Link>

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Template Explorer</h1>
              <p className="text-muted-foreground text-sm">
                Browse {explorerTemplates.length}+ templates and add them to your collection
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{templates.length}</span> templates in your collection
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              type="search"
              placeholder="Search templates by name, variable, or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
              >
                {cat !== "All" && <span className="shrink-0">{categoryIcons[cat]}</span>}
                {cat}
                <span className={`text-xs ${activeCategory === cat ? "opacity-70" : "opacity-50"}`}>
                  ({cat === "All" ? explorerTemplates.length : explorerTemplates.filter((t) => t.category === cat).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">No templates found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-6">
              Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onAdd={handleAddTemplate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
