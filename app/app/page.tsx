"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TemplateList } from "@/components/template-list";
import { TemplateEditor } from "@/components/template-editor";
import { TemplateModal } from "@/components/template-modal";
import { ConfigModal } from "@/components/config-modal";
import { useLinkifyStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function AppPage() {
  const { config, setConfig } = useLinkifyStore();
  const [showModal, setShowModal] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    document.documentElement.className = config.theme;
  }, [config.theme]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === "n" && !e.shiftKey) {
        e.preventDefault();
        setEditMode(false);
        setShowModal(true);
      } else if (e.key === "k") {
        e.preventDefault();
        document.getElementById("template-search")?.focus();
      } else if (e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setConfig({ theme: config.theme === "dark" ? "light" : "dark" });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [config.theme, setConfig]);

  return (
    <div className="min-h-screen flex max-h-screen overflow-hidden relative">
      <TemplateList
        onAdd={() => {
          setEditMode(false);
          setShowModal(true);
        }}
        onConfig={() => setShowConfig(true)}
      />
      <TemplateEditor
        onEdit={() => {
          setEditMode(true);
          setShowModal(true);
        }}
      />

      {/* Back to landing */}
      <div className="absolute top-20 right-4 z-10 flex gap-2">
        <Link href="/templates">
          <Button variant="outline" size="sm" className="gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Explore
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </Link>
      </div>

      <TemplateModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editMode={editMode}
      />

      <ConfigModal
        open={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </div>
  );
}