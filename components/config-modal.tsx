"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useLinkifyStore } from "@/lib/store";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface ConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConfigModal({ open, onClose }: ConfigModalProps) {
  const { config, setConfig } = useLinkifyStore();
  const [theme, setTheme] = useState<"dark" | "light">(config.theme);
  const [reorderEnabled, setReorderEnabled] = useState(config.reorderEnabled);

  useEffect(() => {
    if (open) {
      setTheme(config.theme);
      setReorderEnabled(config.reorderEnabled);
    }
  }, [open, config]);

  const handleSave = () => {
    setConfig({ theme, reorderEnabled });
    document.documentElement.className = theme;
    toast.success("Settings saved");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Appearance
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Templates
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reorder-toggle" className="text-sm">
                  Drag to reorder
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow drag & drop to reorder templates in the sidebar
                </p>
              </div>
              <Switch
                id="reorder-toggle"
                checked={reorderEnabled}
                onCheckedChange={setReorderEnabled}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}