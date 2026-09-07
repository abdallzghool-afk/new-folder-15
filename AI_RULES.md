# AI Rules & Architecture Guidelines

## Tech Stack
- **Framework**: Next.js 14+ with App Router (`app/` directory).
- **Language**: TypeScript with strict mode enabled.
- **Styling**: Tailwind CSS configured with CSS variables for dark/light themes (`app/globals.css`).
- **UI Component System**: shadcn/ui (New York style, Radix UI primitives, `components/ui/`).
- **Icons**: Lucide React (`lucide-react`).
- **Backend & Authentication**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`) with client, server, and middleware helpers in `lib/supabase/`.
- **Utilities**: `clsx` and `tailwind-merge` via `cn()` helper in `lib/utils.ts`.

---

## Library & Tooling Rules

### 1. Routing & Pages (`Next.js App Router`)
- Use the `app/` directory structure for all routing, layouts, and API/route handlers (e.g. `app/layout.tsx`, `app/page.tsx`, `app/group-orders/page.tsx`).
- Do **not** use the legacy `pages/` directory or `react-router-dom`.
- Prefer Next.js navigation primitives (`next/navigation`, `next/link`, `useRouter`, `useSearchParams`, `usePathname`).
- Use route handlers (`route.ts`) under `app/` for server endpoints (such as `app/auth/callback/route.ts`).

### 2. UI Components & Design System (`shadcn/ui` & Radix UI)
- Base components belong in `components/ui/` (e.g. `Button`, `Dialog`, `DropdownMenu`, `Card`).
- Feature components belong directly in `components/` (e.g. `components/unigo-app.tsx`, `components/unigo-auth.tsx`).
- Do not install duplicate UI packages when a Radix primitive or shadcn component can be used.
- Import standard styling utility: `import { cn } from "@/lib/utils"`.

### 3. Styling (`Tailwind CSS`)
- Use utility classes for styling, adhering to the semantic color system defined in `globals.css` (e.g., `bg-background`, `text-foreground`, `bg-primary`, `border-border`).
- Avoid inline CSS or ad-hoc custom CSS files. Place shared global animations or design tokens in `app/globals.css` or `tailwind.config.ts`.

### 4. Icons (`lucide-react`)
- Use `lucide-react` exclusively for icons (e.g., `import { Search, ShoppingBag, Plus } from "lucide-react"`).
- Avoid adding alternative icon libraries (`react-icons`, `@heroicons/react`, `fontawesome`).

### 5. Backend & Data Layer (`Supabase`)
- Use `lib/supabase/client.ts` for browser-side Supabase interactions (`createBrowserClient`).
- Use `lib/supabase/server.ts` for Server Components, Server Actions, and Route Handlers.
- Leverage `lib/database.types.ts` for type safety on database tables, RPCs, and query results.
- Keep mock data in `lib/mock-data.ts` only for local preview/development fallbacks when backend services are disconnected.

### 6. State Management
- Use React built-in hooks (`useState`, `useReducer`, `useContext`, `useMemo`, `useCallback`) for component and feature state.
- Keep shared global state minimal and co-located with the feature context where appropriate.
