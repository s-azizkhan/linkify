"use client";

import { useState } from "react";
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
import { useLinkifyStore } from "@/lib/store";
import { RoutingRule, RoutingConfig, RoutingConditionType, RoutingOperator, uuid } from "@/lib/template";
import { toast } from "sonner";
import { Plus, Trash2, Globe, Smartphone, Clock, ChevronDown } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface RoutingRulesModalProps {
  open: boolean;
  onClose: () => void;
  templateId: string;
}

const conditionTypes: { value: RoutingConditionType; label: string; icon: React.ReactNode }[] = [
  { value: "device", label: "Device", icon: <Smartphone size={14} /> },
  { value: "geo", label: "Location", icon: <Globe size={14} /> },
  { value: "time", label: "Time", icon: <Clock size={14} /> },
];

const operators: { value: RoutingOperator; label: string }[] = [
  { value: "equals", label: "is" },
  { value: "contains", label: "contains" },
  { value: "startsWith", label: "starts with" },
];

const deviceValues = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
];

const timeValues = [
  { value: "weekday", label: "Weekdays (Mon-Fri)" },
  { value: "weekend", label: "Weekend (Sat-Sun)" },
  { value: "09:00-17:00", label: "Business hours (9AM-5PM)" },
  { value: "00:00-23:59", label: "All day" },
];

export function RoutingRulesModal({ open, onClose, templateId }: RoutingRulesModalProps) {
  const { templates, updateTemplate } = useLinkifyStore();
  const template = templates.find((t) => t.id === templateId);
  const routing = template?._routing || { enabled: false, rules: [], defaultUrl: "" };

  const [rules, setRules] = useState<RoutingRule[]>(routing.rules);
  const [defaultUrl, setDefaultUrl] = useState(routing.defaultUrl || "");

  if (!template) return null;

  const handleAddRule = () => {
    const newRule: RoutingRule = {
      id: uuid(),
      type: "device",
      operator: "equals",
      value: "desktop",
      targetUrl: "",
      label: "",
    };
    setRules([...rules, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleUpdateRule = (id: string, updates: Partial<RoutingRule>) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleSave = () => {
    const config: RoutingConfig = {
      enabled: rules.length > 0,
      rules,
      defaultUrl,
    };
    updateTemplate(templateId, { _routing: config });
    toast.success("Routing rules saved");
    onClose();
  };

  const handleToggleEnabled = () => {
    const config: RoutingConfig = {
      enabled: !routing.enabled,
      rules,
      defaultUrl,
    };
    updateTemplate(templateId, { _routing: config });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe size={18} />
            Dynamic Routing Rules
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
            <div>
              <div className="font-medium">Enable Dynamic Routing</div>
              <div className="text-sm text-muted-foreground">
                Route users to different URLs based on conditions
              </div>
            </div>
            <button
              onClick={handleToggleEnabled}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                routing.enabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  routing.enabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {routing.enabled && (
            <>
              {/* Rules */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Rules</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button variant="outline" size="sm" onClick={handleAddRule}>
                        <Plus size={14} className="mr-1" />
                        Add Rule
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add a new routing rule to redirect users based on conditions</TooltipContent>
                  </Tooltip>
                </div>

                {rules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                    <p>No routing rules yet.</p>
                    <p className="text-sm mt-1">Add a rule to route users to different URLs.</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-4">
                      {rules.map((rule, index) => (
                        <div
                          key={rule.id}
                          className="p-4 rounded-lg border border-border bg-card space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                              Rule {index + 1}
                            </span>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteRule(rule.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete this routing rule</TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="grid grid-cols-4 gap-3">
                            {/* Condition Type */}
                            <div className="space-y-1">
                              <Label className="text-xs">Type</Label>
                              <div className="relative">
                                <select
                                  value={rule.type}
                                  onChange={(e) =>
                                    handleUpdateRule(rule.id, {
                                      type: e.target.value as RoutingConditionType,
                                      value: getDefaultValueForType(e.target.value as RoutingConditionType),
                                    })
                                  }
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md appearance-none pr-8"
                                >
                                  {conditionTypes.map((t) => (
                                    <option key={t.value} value={t.value}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-3 text-muted-foreground pointer-events-none" />
                              </div>
                            </div>

                            {/* Operator */}
                            <div className="space-y-1">
                              <Label className="text-xs">Operator</Label>
                              <div className="relative">
                                <select
                                  value={rule.operator}
                                  onChange={(e) =>
                                    handleUpdateRule(rule.id, { operator: e.target.value as RoutingOperator })
                                  }
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md appearance-none pr-8"
                                >
                                  {operators.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-3 text-muted-foreground pointer-events-none" />
                              </div>
                            </div>

                            {/* Value */}
                            <div className="space-y-1">
                              <Label className="text-xs">Value</Label>
                              <div className="relative">
                                <select
                                  value={rule.value}
                                  onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md appearance-none pr-8"
                                >
                                  {rule.type === "device" &&
                                    deviceValues.map((d) => (
                                      <option key={d.value} value={d.value}>
                                        {d.label}
                                      </option>
                                    ))}
                                  {rule.type === "time" &&
                                    timeValues.map((t) => (
                                      <option key={t.value} value={t.value}>
                                        {t.label}
                                      </option>
                                    ))}
                                  {rule.type === "geo" && (
                                    <>
                                      <option value="us">United States</option>
                                      <option value="eu">Europe</option>
                                      <option value="asia">Asia</option>
                                      <option value="uk">United Kingdom</option>
                                      <option value="latam">Latin America</option>
                                      <option value="oceania">Oceania</option>
                                    </>
                                  )}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-3 text-muted-foreground pointer-events-none" />
                              </div>
                            </div>

                            {/* Target URL */}
                            <div className="space-y-1">
                              <Label className="text-xs">Redirect to</Label>
                              <Input
                                placeholder="https://..."
                                value={rule.targetUrl}
                                onChange={(e) => handleUpdateRule(rule.id, { targetUrl: e.target.value })}
                                className="text-sm h-9"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Fallback URL */}
              <div className="space-y-2">
                <Label>Default URL (fallback)</Label>
                <Input
                  placeholder="https://example.com/default"
                  value={defaultUrl}
                  onChange={(e) => setDefaultUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This URL is used when no rules match. Defaults to the main template URL if empty.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between">
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </TooltipTrigger>
            <TooltipContent>Discard changes and close</TooltipContent>
          </Tooltip>
          {routing.enabled && (
            <Tooltip>
              <TooltipTrigger>
                <Button onClick={handleSave}>Save Rules</Button>
              </TooltipTrigger>
              <TooltipContent>Apply routing rules to this template</TooltipContent>
            </Tooltip>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getDefaultValueForType(type: RoutingConditionType): string {
  switch (type) {
    case "device":
      return "desktop";
    case "time":
      return "weekday";
    case "geo":
      return "us";
    default:
      return "";
  }
}
