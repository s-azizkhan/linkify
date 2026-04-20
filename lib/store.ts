import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Template, LinkifyConfig, TemplateVersion } from "./template";
import { sampleTemplates, uuid } from "./template";

export interface LinkHistoryItem {
  url: string;
  templateId: string;
  templateName: string;
  timestamp: number;
}

interface LinkifyStore {
  templates: Template[];
  selectedId: string | null;
  config: LinkifyConfig;
  linkHistory: LinkHistoryItem[];

  // actions
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => Template | null;
  selectTemplate: (id: string | null) => void;
  reorderTemplates: (fromId: string, toId: string) => void;
  setConfig: (config: Partial<LinkifyConfig>) => void;
  resetToSample: () => void;
  importTemplates: (templates: Template[]) => void;
  addToHistory: (url: string) => void;
  clearHistory: () => void;
  incrementUsage: (id: string) => void;
  restoreVersion: (templateId: string, versionId: string) => void;
}

export const useLinkifyStore = create<LinkifyStore>()(
  persist(
    (set, get) => ({
      templates: [],
      selectedId: null,
      config: { theme: "dark", reorderEnabled: true },
      linkHistory: [],

      setTemplates: (templates) => set({ templates }),

      addTemplate: (template) =>
        set((state) => ({
          templates: [template, ...state.templates],
          selectedId: template.id,
        })),

      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== id) return t;
            const changed =
              updates.name !== undefined && updates.name !== t.name ||
              updates.template !== undefined && updates.template !== t.template ||
              updates.campaign !== undefined && updates.campaign !== t.campaign;
            if (changed) {
              const version: TemplateVersion = {
                id: uuid(),
                name: t.name,
                template: t.template,
                campaign: t.campaign,
                updatedAt: t.updatedAt,
              };
              const versions = [...(t._versions || []), version].slice(-10);
              return { ...t, ...updates, updatedAt: Date.now(), _versions: versions };
            }
            return { ...t, ...updates, updatedAt: Date.now() };
          }),
        })),

      deleteTemplate: (id) =>
        set((state) => {
          const filtered = state.templates.filter((t) => t.id !== id);
          return {
            templates: filtered,
            selectedId:
              state.selectedId === id
                ? filtered[0]?.id ?? null
                : state.selectedId,
          };
        }),

      duplicateTemplate: (id) => {
        const state = get();
        const t = state.templates.find((x) => x.id === id);
        if (!t) return null;
        const copy: Template = {
          ...t,
          id: "t-" + Math.random().toString(36).slice(2, 9),
          name: t.name + " (copy)",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          templates: [copy, ...state.templates],
          selectedId: copy.id,
        }));
        return copy;
      },

      selectTemplate: (id) => set({ selectedId: id }),

      reorderTemplates: (fromId, toId) =>
        set((state) => {
          const fromIdx = state.templates.findIndex((x) => x.id === fromId);
          const toIdx = state.templates.findIndex((x) => x.id === toId);
          if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return state;
          const [item] = state.templates.splice(fromIdx, 1);
          const next = [...state.templates];
          next.splice(toIdx, 0, item);
          return { templates: next };
        }),

      setConfig: (config) =>
        set((state) => ({ config: { ...state.config, ...config } })),

      resetToSample: () => {
        const samples = sampleTemplates();
        set({
          templates: samples,
          selectedId: samples[0]?.id ?? null,
        });
      },

      importTemplates: (templates) =>
        set((state) => ({ templates: [...templates, ...state.templates] })),

      addToHistory: (url) =>
        set((state) => {
          const existing = state.linkHistory.findIndex((h) => h.url === url);
          let newHistory = [...state.linkHistory];
          if (existing !== -1) {
            newHistory.splice(existing, 1);
          }
          newHistory.unshift({
            url,
            templateId: state.selectedId || "",
            templateName: state.templates.find((t) => t.id === state.selectedId)?.name || "",
            timestamp: Date.now(),
          });
          return { linkHistory: newHistory.slice(0, 20) };
        }),

      clearHistory: () => set({ linkHistory: [] }),

      incrementUsage: (id) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
          ),
        })),

      restoreVersion: (templateId, versionId) =>
        set((state) => {
          const t = state.templates.find((x) => x.id === templateId);
          if (!t) return state;
          const version = t._versions?.find((v) => v.id === versionId);
          if (!version) return state;
          const newVersion: TemplateVersion = {
            id: uuid(),
            name: t.name,
            template: t.template,
            campaign: t.campaign,
            updatedAt: t.updatedAt,
          };
          const versions = [...(t._versions || []), newVersion].slice(-10);
          return {
            templates: state.templates.map((x) =>
              x.id === templateId
                ? { ...x, name: version.name, template: version.template, campaign: version.campaign, updatedAt: Date.now(), _versions: versions }
                : x
            ),
          };
        }),
    }),
    {
      name: "linkify-store",
    }
  )
);

// Initialize with sample data if empty
export function initStore() {
  const state = useLinkifyStore.getState();
  if (state.templates.length === 0) {
    const samples = sampleTemplates();
    useLinkifyStore.setState({
      templates: samples,
      selectedId: samples[0]?.id ?? null,
    });
  }
}