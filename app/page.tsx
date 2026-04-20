"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const personas = [
  {
    id: "developer",
    label: "Developer",
    color: "from-blue-500 to-cyan-400",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    templates: [
      { name: "GitBranch", example: "github.com/org/repo/tree/{branch}" },
      { name: "PR Review", example: "github.com/{owner}/{repo}/pull/{pr}" },
      { name: "JIRA Ticket", example: "yoursite.atlassian.net/browse/{ticket}" },
    ],
  },
  {
    id: "designer",
    label: "Designer",
    color: "from-pink-500 to-rose-400",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    templates: [
      { name: "Figma File", example: "figma.com/file/{file_id}" },
      { name: "Design System", example: "zeroheight.com/{org}/p/{page}" },
      { name: "Dribbble Shot", example: "dribbble.com/shots/{shot_id}" },
    ],
  },
  {
    id: "devops",
    label: "DevOps",
    color: "from-amber-500 to-orange-400",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    templates: [
      { name: "K8s Pod", example: "console.cloud.google.com/k8s/pod/{region}/..." },
      { name: "Grafana", example: "grafana.com/d/{dash}?var-env={env}" },
      { name: "Datadog", example: "app.datadoghq.com/apm/traces?env={env}" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    color: "from-emerald-500 to-teal-400",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    templates: [
      { name: "UTM Link", example: "example.com/{page}?utm_source={source}&..." },
      { name: "QR Code", example: "Generate QR codes for any template" },
      { name: "Batch URLs", example: "Create 100 variant links at once" },
    ],
  },
];

const features = [
  {
    title: "Template Variables",
    description: "Use any variable in curly braces. Encode or keep raw — you control each one.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    title: "Version History",
    description: "Every edit is saved. View history, compare changes, restore any version.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    gradient: "from-purple-500/10 to-pink-500/10",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    title: "Bulk Generation",
    description: "Import CSV data, generate hundreds of URLs, export as CSV.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    gradient: "from-amber-500/10 to-orange-500/10",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    title: "Dynamic Routing",
    description: "Route users by device, location, or time. Serve the right content.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "QR Codes",
    description: "Generate QR codes for any template. Download as PNG or copy to clipboard.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <path d="M14 14h7v7h-7z" />
      </svg>
    ),
    gradient: "from-pink-500/10 to-rose-500/10",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
  {
    title: "Link Health",
    description: "Monitor all links in one dashboard. Detect broken links early.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    gradient: "from-cyan-500/10 to-blue-500/10",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
  },
];

const stats = [
  { value: "100%", label: "Local Storage" },
  { value: "0", label: "Servers Used" },
  { value: "∞", label: "Templates" },
  { value: "5s", label: "Per Link" },
];

export default function Landing() {
  const [heroInput, setHeroInput] = useState("main");
  const [isVisible, setIsVisible] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ASCII characters for artistic animation
    const asciiChars = [
      '╔', '╗', '╚', '╝', '║', '═', '╠', '╣', '╦', '╩', '╬',
      '┌', '┐', '└', '┘', '─', '│', '├', '┤', '┬', '┴', '┼',
      '┏', '┓', '┗', '┛', '━', '┃', '┣', '┫', '┳', '┻', '╋',
      '◈', '◉', '◎', '○', '●', '◇', '◆', '□', '■', '□', '▪',
      '▫', '►', '◄', '▲', '△', '▼', '▽', '◀', '▶', '★', '☆',
      '∈', '∉', '⊂', '⊃', '∪', '∩', '∅', '∀', '∃', '∂', '∇',
      'λ', 'γ', 'β', 'α', 'ω', 'Ω', 'Σ', 'Π', 'Δ', 'θ', 'φ',
      '⊕', '⊖', '⊗', '⊘', '⊙', '○', '◌', '⊿', '△', '▽',
    ];

    const fontSize = 14;
    let width = 0;
    let height = 0;
    let time = 0;

    // Grid of flowing nodes connected by ASCII lines
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      char: string;
      brightness: number;
      targetBrightness: number;
    }

    let nodes: Node[] = [];
    const nodeCount = 40;
    const connectionDistance = 80;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Reinitialize nodes
      nodes = [];
      const cols = Math.floor(width / 80);
      const rows = Math.floor(height / 80);

      for (let i = 0; i < nodeCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        nodes.push({
          x: col * 80 + Math.random() * 60,
          y: row * 80 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          char: asciiChars[Math.floor(Math.random() * asciiChars.length)],
          brightness: Math.random(),
          targetBrightness: Math.random(),
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let animationId: number;
    let hue = 220;

    const drawConnection = (x1: number, y1: number, x2: number, y2: number, alpha: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > connectionDistance) return;

      // Choose connector based on direction
      let connector = '─';
      if (Math.abs(dx) > Math.abs(dy) * 2) {
        connector = '─';
      } else if (Math.abs(dy) > Math.abs(dx) * 2) {
        connector = '│';
      } else if (dy < 0 && dx > 0) {
        connector = '╲';
      } else if (dy < 0 && dx < 0) {
        connector = '╱';
      } else if (dy > 0 && dx > 0) {
        connector = '╲';
      } else {
        connector = '╱';
      }

      ctx.fillStyle = `hsla(${hue + (dist / connectionDistance) * 60}, 70%, 55%, ${alpha * 0.4})`;

      const steps = Math.floor(dist / fontSize);
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;

        // Pulsing effect
        const pulse = Math.sin(time * 0.002 + t * Math.PI * 2) * 0.5 + 0.5;
        ctx.globalAlpha = alpha * pulse * 0.3;
        ctx.fillText(connector, cx, cy);
      }
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      // Semi-transparent clear for trail effect
      ctx.fillStyle = 'rgba(10, 10, 20, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      time += 16;

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Smooth brightness transition
        node.brightness += (node.targetBrightness - node.brightness) * 0.02;

        // Occasionally change target brightness
        if (Math.random() < 0.01) {
          node.targetBrightness = Math.random();
        }

        // Move nodes in flowing patterns
        node.x += node.vx + Math.sin(time * 0.001 + i) * 0.3;
        node.y += node.vy + Math.cos(time * 0.001 + i * 0.7) * 0.3;

        // Wrap around edges with padding
        if (node.x < -50) node.x = width + 50;
        if (node.x > width + 50) node.x = -50;
        if (node.y < -50) node.y = height + 50;
        if (node.y > height + 50) node.y = -50;

        // Draw connections between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = 1 - dist / connectionDistance;
            drawConnection(node.x, node.y, other.x, other.y, alpha);
          }
        }

        // Draw the node character
        const hueShift = (i / nodes.length) * 60;
        const brightness = 30 + node.brightness * 30;
        ctx.fillStyle = `hsla(${hue + hueShift}, 70%, ${brightness}%, ${0.3 + node.brightness * 0.3})`;

        const scale = 1 + Math.sin(time * 0.003 + i * 0.5) * 0.2;
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.scale(scale, scale);
        ctx.fillText(node.char, 0, 0);
        ctx.restore();
      }

      // Slowly shift hue within cyan-indigo range
      hue += 0.02;
      if (hue > 260) hue = 200;
      if (hue < 200) hue = 200;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const resolvedUrl = `https://github.com/FanBasis/linkify/tree/${heroInput || "{branch}"}`;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ASCII Canvas Animation Background */}
      <canvas ref={canvasRef} className="fixed inset-0 -z-10" style={{ opacity: 0 }} />

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="40"
              height="40"
              className="rounded-lg transition-transform group-hover:scale-110"
            >
              <title>Linkify Logo</title>
              <defs>
                <mask id="gap-bottom-nav">
                  <rect width="48" height="48" fill="white" />
                  <circle cx="24" cy="29.2" r="3" fill="black" />
                </mask>
                <mask id="gap-top-nav">
                  <rect width="48" height="48" fill="white" />
                  <circle cx="24" cy="18.8" r="3" fill="black" />
                </mask>
              </defs>
              <rect width="48" height="48" fill="#0F172A" rx="10" />
              <g transform="rotate(-45 24 24)" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 21 18 L 12 18 A 3 3 0 0 0 9 21 A 3 3 0 0 1 6 24 A 3 3 0 0 1 9 27 A 3 3 0 0 0 12 30 L 21 30 A 6 6 0 0 0 21 18 Z" stroke="#F8FAFC" mask="url(#gap-bottom-nav)" />
                <path d="M 27 18 A 6 6 0 0 0 27 30 L 36 30 A 3 3 0 0 0 39 27 A 3 3 0 0 1 42 24 A 3 3 0 0 1 39 21 A 3 3 0 0 0 36 18 Z" stroke="#00E5FF" mask="url(#gap-top-nav)" />
              </g>
            </svg>
            <div className="absolute -inset-1 bg-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-bold">Linkify</span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors no-underline text-muted-foreground hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Star
          </a>
          <Link
            href="/templates"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors no-underline text-muted-foreground hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Browse Templates
          </Link>
          <Link
            href="/app"
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover:scale-105 no-underline shadow-lg shadow-primary/25"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* Welcome Banner with Example */}
      <div className="px-8 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 p-5 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-sm">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold mb-2">
              Welcome to <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Linkify</span>
            </h2>
            <p className="text-muted-foreground text-sm mb-3">
              Your URL template builder. Create templates with variables, fill once, open anywhere.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-mono">
              <span className="text-muted-foreground">Example:</span>
              <code>github.com/{`{org}`}/{`{repo}`}/tree/{`{branch}`}</code>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border shadow-lg">
              <div className="text-xs text-muted-foreground mb-3 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Example
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">branch:</span>
                  <code className="text-xs font-mono text-primary flex-1 truncate">main</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">org:</span>
                  <code className="text-xs font-mono text-primary flex-1 truncate">FanBasis</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">repo:</span>
                  <code className="text-xs font-mono text-primary flex-1 truncate">fanbasis-web</code>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground mb-1.5">Result:</div>
                  <code className="text-xs font-mono text-foreground break-all">
                    github.com/FanBasis/fanbasis-web/tree/main
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section ref={heroRef} className="px-8 py-8 md:py-12 max-w-5xl mx-auto relative">
        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />

        <div className="text-center max-w-3xl mx-auto relative">
          {/* Privacy Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-border text-sm font-medium mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            100% Private — Your data never leaves your browser
          </div>

          {/* Main Title */}
          <h1 className={`text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="block">Stop typing URLs.</span>
            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent block mt-2">
              Start using templates.
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Create templates with <code className="bg-secondary/80 px-2 py-0.5 rounded font-mono text-foreground">{"{variables}"}</code>.
            Fill once, open instantly. Works offline.
          </p>

          {/* Clean Hero Card */}
          <div className={`mb-10 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="max-w-lg mx-auto relative">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 blur-xl -z-10 rounded-2xl" />

              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-xl shadow-primary/5 relative">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground/60 font-mono ml-2">linkify</span>
                </div>

                <div className="space-y-3">
                  {/* Variable Input */}
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg border border-border/50 hover:border-primary/30 transition-colors font-mono text-sm group">
                    <span className="text-primary/60 shrink-0 group-hover:text-primary transition-colors">›</span>
                    <span className="text-muted-foreground/60 shrink-0">branch:</span>
                    <input
                      type="text"
                      value={heroInput}
                      onChange={(e) => setHeroInput(e.target.value)}
                      placeholder="main"
                      className="flex-1 bg-transparent border-none outline-none text-foreground font-mono placeholder:text-muted-foreground/30 text-sm"
                    />
                  </div>

                  {/* Generated URL */}
                  <div className="p-3 bg-gradient-to-r from-primary/5 to-cyan-500/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-muted-foreground/60 font-mono">result</span>
                    </div>
                    <code className="text-sm font-mono text-primary break-all">
                      {resolvedUrl}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link
              href="/app"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover:scale-105 no-underline shadow-lg shadow-primary/20"
            >
              Open Linkify
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/templates"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-secondary/50 transition-all no-underline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Browse Templates
            </Link>
          </div>

          {/* Quick Stats */}
          <div className={`flex flex-wrap items-center justify-center gap-8 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className={`mt-12 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
              <span className="text-xs font-mono">scroll</span>
              <div className="w-5 h-8 rounded-full border border-muted-foreground/20 flex items-start justify-center p-1">
                <div className="w-1 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Subtle divider */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
            <span className="text-muted-foreground/40 text-xs font-mono">✦</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
          </div>

          {/* Section intro */}
          <div className="text-center mb-10">
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Linkify turns your repetitive URLs into smart templates. Type values once, open anywhere — no sign-up, no server, no ads.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all no-underline"
            >
              Try it free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Three steps to speed</h2>
            <p className="text-muted-foreground">Less typing, more doing</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { num: "01", title: "Create a template", desc: "Write your URL with {variables} where dynamic parts go", code: "https://github.com/org/repo/tree/{branch}" },
              { num: "02", title: "Fill in values", desc: "Type your variable values once. Tab through or press Enter.", code: "branch: main" },
              { num: "03", title: "Open instantly", desc: "Your link is ready. One click or Enter to open.", code: "→ github.com/org/repo/tree/main" },
            ].map((step, i) => (
              <div key={step.num} className="relative group">
                <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
                  <div className="text-4xl font-bold bg-gradient-to-br from-primary/20 to-purple-500/20 bg-clip-text text-transparent mb-2">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                  <p className="text-muted-foreground mb-3 text-sm">{step.desc}</p>
                  <div className="bg-secondary/30 rounded-lg p-2.5 border border-border">
                    <code className="text-xs font-mono text-foreground/70 break-all block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {step.code}
                    </code>
                  </div>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground/50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-8 py-16 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Built for every workflow</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From code commits to marketing campaigns, Linkify adapts to how you work
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, i) => (
              <div
                key={persona.id}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${persona.color} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300`} />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center mb-4 text-white shadow-lg`}>
                  {persona.icon}
                </div>

                <h3 className="text-lg font-semibold mb-4">{persona.label}</h3>

                <div className="space-y-3">
                  {persona.templates.map((tpl) => (
                    <div key={tpl.name} className="group/template">
                      <div className="text-xs text-muted-foreground mb-1 font-medium">{tpl.name}</div>
                      <code className="text-xs bg-secondary/50 px-2 py-1 rounded font-mono text-foreground/70 group-hover/template:text-foreground/90 transition-colors block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {tpl.example}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features with rotating highlight */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Everything you need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful features wrapped in a simple, intuitive interface
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`p-5 rounded-xl bg-card border transition-all duration-300 group ${
                  activeFeature === i ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border hover:border-primary/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-8 py-16 bg-secondary/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">The difference is time</h2>
            <p className="text-muted-foreground">See what you save every day</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-red-500">Without Linkify</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">✕</span>
                    <span>Copy URL, paste in browser</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">✕</span>
                    <span>Find the part to replace</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">✕</span>
                    <span>Delete, type new value</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 mt-0.5">✕</span>
                    <span>Repeat 50 times a day</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="text-2xl font-bold text-red-500">~25 min/day</div>
                  <div className="text-sm text-muted-foreground">wasted on URL editing</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-emerald-500">With Linkify</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>Select template, type value</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>Press Enter</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>Link opens instantly</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>History auto-saved</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="text-2xl font-bold text-emerald-500">~4 min/day</div>
                  <div className="text-sm text-muted-foreground">total URL work</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="px-8 py-14 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Your data stays on your device</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Linkify stores everything in your browser. Your templates, history, preferences — never sent to any server. Not even an analytics ping.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {["No accounts", "No analytics", "No servers", "Works offline"].map((item) => (
              <span key={item} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><polyline points="20 6 9 17 4 12" /></svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to reclaim<br />
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">25 minutes a day?</span>
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Stop copying, pasting, and editing URLs. Start using templates today — it&apos;s free.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:opacity-90 transition-all hover:scale-105 no-underline shadow-xl shadow-primary/20 mb-4"
          >
            Open Linkify — It&apos;s Free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <div className="block">
            <Link
              href="/templates"
              className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline inline-flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Browse 30+ templates
            </Link>
          </div>

          {/* PWA Install Callout */}
          <div className="mt-6 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm inline-flex items-center gap-4 text-left">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Install as App</p>
              <p className="text-xs text-muted-foreground">Add to home screen for offline access &amp; full-screen experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-10 text-center text-sm text-muted-foreground border-t border-border">
        <p className="mb-2">
          Crafted with <span className="text-red-500">♥</span> by <strong className="text-foreground">S.Aziz Khan</strong>
        </p>
        <p>Linkify © {new Date().getFullYear()} · Open source</p>
      </footer>
    </div>
  );
}