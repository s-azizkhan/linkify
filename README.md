# Linkify — URL Template Builder

Stop typing URLs. Start using templates.

Linkify is a private, browser-based URL template builder. Create templates with `{variables}`, fill values once, and open anywhere — no sign-up, no server, no data leaving your device.

## Features

- **Template Variables** — Use `{variable}` syntax in any URL. Encode or keep raw.
- **Version History** — Every edit saved. View, compare, and restore any version.
- **Bulk Generation** — Import CSV data, generate hundreds of URLs, export as CSV.
- **Dynamic Routing** — Route users by device, location, or time.
- **QR Codes** — Generate QR codes for any template. Download as PNG or copy to clipboard.
- **Link Health** — Monitor all links in one dashboard. Detect broken links early.
- **100% Private** — All data stays in your browser. No accounts, no analytics, no servers.
- **Works Offline** — Install as a PWA for full offline access.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Zustand** (state management)
- **shadcn/ui** + **Base UI** (components)
- **Sonner** (notifications)
- **Lucide React** (icons)
- **TypeScript**

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/                    # Next.js App Router pages and layouts
  app/                  # Main application (template editor)
  templates/             # Template explorer
  layout.tsx            # Root layout (fonts, providers)
  page.tsx              # Landing page
  globals.css           # Global styles and CSS variables

components/
  ui/                   # shadcn/ui base components
  template-*.tsx        # Template management modals
  version-history-modal.tsx
  routing-rules-modal.tsx
  link-health-modal.tsx
  csv-import-modal.tsx
  qr-modal.tsx
  comments-modal.tsx
  config-modal.tsx
  workspace-modal.tsx

lib/
  store.ts              # Zustand store (templates, settings)
  template.ts           # Template parsing/resolution logic
  utils.ts              # Utility functions (cn, etc.)
  explorer-templates.ts # Built-in template library
```

## Architecture

### State Management (Zustand)

All application state lives in `lib/store.ts`:
- `templates[]` — User's saved URL templates
- `workspace` — Current active template
- `history[]` — Version history per template
- `settings` — User preferences

### Template Resolution

Templates use `{variable}` syntax. Variables can be:
- **Raw** — inserted as-is: `{branch}`
- **Encoded** — URL-encoded: `{{branch}}` (double braces)

The `lib/template.ts` module handles parsing, variable extraction, and URL resolution.

### PWA Support

Linkify works as a Progressive Web App:
- Service worker handles offline caching
- Web app manifest for home screen installation
- Works fully offline after first load

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ N` | New template |
| `/` | Search templates |
| `⌘ K` | Quick open |
| `Enter` | Open resolved URL |
| `⌘ ↵` | Copy resolved URL |

## Privacy

Linkify stores everything in your browser's localStorage. Your templates, history, and preferences are never sent to any server — not even an analytics ping.

## License

Open source.
