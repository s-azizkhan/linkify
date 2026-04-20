"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowBanner(false);
    localStorage.setItem("install-prompt-dismissed", "true");
    localStorage.setItem("install-prompt-dismissed-at", String(Date.now()));
  };

  const checkShouldShow = useCallback(() => {
    // Already installed — never show
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isInWebAppMode = (window.navigator as any).standalone !== undefined;
    if (isStandalone || (isInWebAppMode && (window.navigator as any).standalone)) {
      setIsInstalled(true);
      return;
    }

    // Check dismissal — re-show every 7 days
    const dismissedAt = localStorage.getItem("install-prompt-dismissed-at");
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < sevenDays) return; // dismissed within 7 days, skip
      // More than 7 days — reset dismissal so banner can show again
      localStorage.removeItem("install-prompt-dismissed");
      localStorage.removeItem("install-prompt-dismissed-at");
    }

    setShowBanner(true);
  }, []);

  useEffect(() => {
    checkShouldShow();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Periodic check — every 30 seconds, re-evaluate
    const interval = setInterval(checkShouldShow, 30_000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearInterval(interval);
    };
  }, [checkShouldShow]);

  // Don't show if installed or not triggered
  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-card border border-border rounded-xl shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="32"
                height="32"
                className="rounded-lg"
              >
                <title>Linkify Logo</title>
                <defs>
                  <mask id="gap-bottom-install">
                    <rect width="48" height="48" fill="white" />
                    <circle cx="24" cy="29.2" r="3" fill="black" />
                  </mask>
                  <mask id="gap-top-install">
                    <rect width="48" height="48" fill="white" />
                    <circle cx="24" cy="18.8" r="3" fill="black" />
                  </mask>
                </defs>
                <rect width="48" height="48" fill="#0F172A" rx="10" />
                <g transform="rotate(-45 24 24)" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 21 18 L 12 18 A 3 3 0 0 0 9 21 A 3 3 0 0 1 6 24 A 3 3 0 0 1 9 27 A 3 3 0 0 0 12 30 L 21 30 A 6 6 0 0 0 21 18 Z" stroke="#F8FAFC" mask="url(#gap-bottom-install)" />
                  <path d="M 27 18 A 6 6 0 0 0 27 30 L 36 30 A 3 3 0 0 0 39 27 A 3 3 0 0 1 42 24 A 3 3 0 0 1 39 21 A 3 3 0 0 0 36 18 Z" stroke="#00E5FF" mask="url(#gap-top-install)" />
                </g>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                Install Linkify App
              </h3>
              <p className="text-sm text-muted-foreground leading-tight">
                Add to your home screen for quick access and offline use.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-border">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
