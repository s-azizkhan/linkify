"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { detectVariables, uuid, now } from "@/lib/template";
import { useLinkifyStore } from "@/lib/store";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  editMode?: boolean;
}

export function TemplateModal({ open, onClose, editMode = false }: TemplateModalProps) {
  const { templates, selectedId, addTemplate, updateTemplate } = useLinkifyStore();
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("");
  const [campaign, setCampaign] = useState("");

  const currentTemplate = templates.find((t) => t.id === selectedId);

  const existingCampaigns = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t) => { if (t.campaign) set.add(t.campaign); });
    return Array.from(set).sort();
  }, [templates]);

  useEffect(() => {
    if (open) {
      if (editMode && currentTemplate) {
        setName(currentTemplate.name);
        setTemplate(currentTemplate.template);
        setCampaign(currentTemplate.campaign || "");
      } else {
        setName("");
        setTemplate("");
        setCampaign("");
      }
    }
  }, [open, editMode, currentTemplate]);

  const vars = detectVariables(template);

  const handleSave = () => {
    if (!name.trim() || !template.trim()) {
      toast.error("Name and template are required");
      return;
    }
    if (/\{\s*\}/.test(template)) {
      toast.error("Empty variable braces detected");
      return;
    }

    if (editMode && selectedId) {
      const prev = currentTemplate?._values || {};
      const prevEnc = currentTemplate?._encode || {};
      const prevDefaults = currentTemplate?._defaults || {};
      const newValues: Record<string, string> = {};
      const newEncode: Record<string, boolean> = {};
      vars.forEach((v) => {
        newValues[v] = prev[v] || "";
        newEncode[v] = prevEnc[v] === false ? false : true;
      });
      updateTemplate(selectedId, {
        name: name.trim(),
        template: template.trim(),
        campaign: campaign.trim(),
        _values: newValues,
        _encode: newEncode,
        _defaults: prevDefaults,
      });
      toast.success("Saved");
    } else {
      const encodeMap: Record<string, boolean> = {};
      vars.forEach((v) => {
        encodeMap[v] = true;
      });
      const newTemplateObj = {
        id: uuid(),
        name: name.trim(),
        template: template.trim(),
        campaign: campaign.trim(),
        createdAt: now(),
        updatedAt: now(),
        _values: {},
        _encode: encodeMap,
        _defaults: {},
        usageCount: 0,
        _versions: [],
        _routing: { enabled: false, rules: [], defaultUrl: "" },
      };
      addTemplate(newTemplateObj);
      toast.success("Created");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Template" : "New Template"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tpl-name">Name</Label>
            <Input
              id="tpl-name"
              placeholder="GitBranch"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-campaign">Campaign</Label>
            <Input
              id="tpl-campaign"
              list="campaign-list"
              placeholder="e.g. Summer 2026 Promo"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            />
            <datalist id="campaign-list">
              {existingCampaigns.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-template">Template</Label>
            <Input
              id="tpl-template"
              placeholder="https://github.com/org/repo/tree/{branch_name}"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
          </div>
          {vars.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Variables detected: {vars.length}
              <div className="mt-1 text-xs text-muted-foreground/70 font-mono">
                {vars.join(", ")}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Variables detected: <span className="font-medium">{vars.length}</span>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </TooltipTrigger>
              <TooltipContent>Discard changes and close</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button onClick={handleSave}>Save</Button>
              </TooltipTrigger>
              <TooltipContent>{editMode ? 'Save changes to the template' : 'Create a new template with these settings'}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}