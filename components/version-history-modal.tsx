"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLinkifyStore } from "@/lib/store";
import { sanitize } from "@/lib/template";
import { toast } from "sonner";
import { History, RotateCcw, Trash2 } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  templateId: string;
}

export function VersionHistoryModal({ open, onClose, templateId }: VersionHistoryModalProps) {
  const { templates, restoreVersion, updateTemplate } = useLinkifyStore();
  const template = templates.find((t) => t.id === templateId);
  const versions = template?._versions || [];

  const handleRestore = (versionId: string) => {
    if (!template) return;
    restoreVersion(templateId, versionId);
    toast.success("Version restored");
    onClose();
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!template) return;
    const newVersions = template._versions.filter((v) => v.id !== versionId);
    updateTemplate(templateId, { _versions: newVersions });
    toast.success("Version deleted");
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History size={18} />
            Version History
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {versions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <History size={32} className="mx-auto mb-3 opacity-30" />
              <p>No version history yet.</p>
              <p className="text-sm mt-1">Versions are saved when you edit the template name, URL, or campaign.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-3">
                {versions.slice().reverse().map((version, index) => (
                  <div
                    key={version.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                          v{versions.length - index}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(version.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm font-medium truncate">{sanitize(version.name)}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate mt-1">
                        {sanitize(version.template)}
                      </div>
                      {version.campaign && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Campaign: {sanitize(version.campaign)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRestore(version.id)}
                          >
                            <RotateCcw size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Restore this version as the current template</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteVersion(version.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Permanently delete this version</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </TooltipTrigger>
            <TooltipContent>Close version history</TooltipContent>
          </Tooltip>
        </div>
      </DialogContent>
    </Dialog>
  );
}
