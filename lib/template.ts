export interface LinkifyConfig {
  theme: "dark" | "light";
  reorderEnabled: boolean;
}

export interface TemplateVersion {
  id: string;
  name: string;
  template: string;
  campaign: string;
  updatedAt: number;
}

export type RoutingConditionType = "geo" | "device" | "time";
export type RoutingOperator = "equals" | "contains" | "startsWith";
export type RoutingTarget = "primary" | "fallback";
export type DeviceType = "desktop" | "mobile" | "tablet";
export type GeoRegion = "us" | "eu" | "asia" | "latam" | "africa" | "oceania" | "middle-east" | "other";
export type TimeZone = "local" | "utc" | "us-east" | "us-west" | "europe-london" | "europe-paris" | "asia-tokyo" | "asia-shanghai" | "australia-sydney";

export interface RoutingRule {
  id: string;
  type: RoutingConditionType;
  operator: RoutingOperator;
  value: string;
  targetUrl: string;
  label?: string;
}

export interface RoutingConfig {
  enabled: boolean;
  rules: RoutingRule[];
  defaultUrl: string;
}

export interface Template {
  id: string;
  name: string;
  template: string;
  campaign: string;
  createdAt: number;
  updatedAt: number;
  _values: Record<string, string>;
  _encode: Record<string, boolean>;
  _defaults: Record<string, string>;
  usageCount: number;
  _versions: TemplateVersion[];
  _routing: RoutingConfig;
}

export type Theme = "dark" | "light";

export function detectVariables(tpl: string): string[] {
  const set: string[] = [];
  const VAR_RE = /\{([A-Za-z0-9_\-]+)\}/g;
  let m;
  while ((m = VAR_RE.exec(tpl)) !== null) {
    const name = m[1];
    if (!set.includes(name)) set.push(name);
  }
  return set;
}

export function resolveTemplate(
  tpl: string,
  values: Record<string, string>,
  encodeMap: Record<string, boolean> = {}
): string {
  const VAR_RE = /\{([A-Za-z0-9_\-]+)\}/g;
  return tpl.replace(VAR_RE, (_, k) => {
    const raw = values[k] ?? "";
    return encodeMap[k] === false ? raw : encodeURIComponent(raw);
  });
}

export function uuid(): string {
  return "t-" + Math.random().toString(36).slice(2, 9);
}

export function now(): number {
  return Date.now();
}

export function sampleTemplates(): Template[] {
  return [
    {
      id: uuid(),
      name: "GitBranch",
      template: "https://github.com/{org}/{repo}/tree/{branch}",
      campaign: "Development",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "GitIssue",
      template: "https://github.com/{org}/{repo}/issues/{issue}",
      campaign: "Development",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "PRReview",
      template: "https://github.com/{org}/{repo}/pull/{pr}",
      campaign: "Development",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "JIRATicket",
      template: "https://{company}.atlassian.net/browse/{ticket}",
      campaign: "Project",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "FigmaFile",
      template: "https://figma.com/file/{file_id}",
      campaign: "Design",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "GrafanaDashboard",
      template: "https://grafana.com/d/{dash_id}?var-env={env}",
      campaign: "DevOps",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "K8sPod",
      template: "https://console.cloud.google.com/k8s/pod/{region}/{cluster}/{namespace}/{pod}",
      campaign: "DevOps",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "UTMLink",
      template: "https://{domain}/{page}?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}",
      campaign: "Marketing",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "NotionPage",
      template: "https://notion.so/{workspace}/{page_id}",
      campaign: "Docs",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "SlackChannel",
      template: "https://{workspace}.slack.com/archives/{channel_id}",
      campaign: "Communication",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "DatadogTrace",
      template: "https://app.datadoghq.com/apm/traces?env={env}&service={service}",
      campaign: "DevOps",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
    {
      id: uuid(),
      name: "AWSConsole",
      template: "https://console.aws.amazon.com/ec2/v2/home?region={region}#Instances:instanceId={instance_id}",
      campaign: "DevOps",
      createdAt: now(),
      updatedAt: now(),
      _values: {},
      _encode: {},
      _defaults: {},
      usageCount: 0,
      _versions: [],
      _routing: { enabled: false, rules: [], defaultUrl: "" },
    },
  ];
}

export function sanitize(s: string): string {
  return String(s)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function extractDomain(tpl: string): string {
  try {
    const url = tpl.replace(/\{[^}]+\}/g, "example");
    const u = new URL(url);
    return u.hostname;
  } catch {
    return "";
  }
}

export function resolveRouting(
  url: string,
  routing: RoutingConfig
): string {
  if (!routing.enabled || routing.rules.length === 0) {
    return url;
  }

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);

  for (const rule of routing.rules) {
    let matches = false;

    if (rule.type === "device") {
      const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
      switch (rule.operator) {
        case "equals":
          matches = device === rule.value;
          break;
        case "contains":
          matches = device.includes(rule.value);
          break;
        case "startsWith":
          matches = device.startsWith(rule.value);
          break;
      }
    } else if (rule.type === "geo") {
      // In a real implementation, you'd use a GeoIP service
      // For now, we'll use timezone as a proxy
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      switch (rule.operator) {
        case "equals":
          matches = timezone.toLowerCase().includes(rule.value.toLowerCase());
          break;
        case "contains":
          matches = timezone.toLowerCase().includes(rule.value.toLowerCase());
          break;
        case "startsWith":
          matches = timezone.toLowerCase().startsWith(rule.value.toLowerCase());
          break;
      }
    } else if (rule.type === "time") {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      const timeValue = rule.value;

      // Parse time value like "09:00-17:00" or "weekday" or "weekend"
      if (timeValue === "weekday") {
        matches = dayOfWeek > 0 && dayOfWeek < 6;
      } else if (timeValue === "weekend") {
        matches = dayOfWeek === 0 || dayOfWeek === 6;
      } else if (timeValue.includes("-")) {
        const [start, end] = timeValue.split("-").map(t => {
          const [h, m] = t.trim().split(":").map(Number);
          return h * 60 + (m || 0);
        });
        const currentMinutes = hour * 60;
        matches = currentMinutes >= start && currentMinutes <= end;
      }
    }

    if (matches && rule.targetUrl) {
      return rule.targetUrl;
    }
  }

  return routing.defaultUrl || url;
}