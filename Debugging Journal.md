
# Debugging Journal — Sales Pulse:

## Entry 1 — TypeScript rejected the `/trend` route's error-handling code

**What happened:** After the initial backend build, `npm run dev` failed to compile with:
```
error TS2345: Argument of type '(req: Request<ParamsDictionary, any, any, ParsedQs,
Record<string, any>>, res: Response<any, Record<string, any>>) => Response<any,
Record<string, any>> | undefined' is not assignable to parameter of type '(req: Request...,
res: Response..., next: NextFunction) => void | Promise<...>'.
```
The route handler used `return res.status(400).json(...)` inline, which returns a `Response`
object — but Express's handler type expects `void`.

**Failure pattern:** A subtle typing mismatch between a common JS pattern (return the response
call to short-circuit) and Express's stricter TypeScript handler signature. Not a logic bug —
the code would have worked fine in plain JavaScript; TypeScript caught a type contract
violation, not a runtime error.

**Recovery:** Split the line: called `res.status(400).json(...)` on its own statement, then a
bare `return;` on the next line, so the function's return type resolved to `void` instead of
`Response`. Applied the same fix to the equivalent pattern in `validateQuery.ts`.

**Prevention next time:** When writing Express route handlers in TypeScript, treat
`return res.status(...).json(...)` as a pattern to avoid from the start — always separate the
response call from the `return` statement in generated code, or add an explicit `: void`
return type annotation to route handlers to catch this at the point of writing, not at compile
time.

## Entry 2 — Railway build failed because it built from the repo root, not `/server`

**What happened:** First Railway deployment failed at the build step. Build logs showed
`npm run build` running `tsc`'s own CLI help text instead of compiling anything — meaning it
couldn't find `tsconfig.json` or `package.json` for the backend, because Railway was treating
the whole monorepo root as the service's working directory by default.

**Failure pattern:** A monorepo/deployment-configuration mismatch — the code itself was
correct, but the hosting platform's default assumptions (single-package repo) didn't match
the project's actual structure (`/server` + `/client` as separate deployable units).

**Recovery:** Went into the Railway service's Settings → Source → Root Directory, and set it
explicitly to `server`. Also set the Build Command (`npm install && npm run build`) and Start
Command (`node dist/server.js`) explicitly rather than relying on Railway's auto-detection,
since auto-detection was what caused the mismatch in the first place. Redeployed — build
succeeded.

**Prevention next time:** For any monorepo-style project, set Root Directory and explicit
build/start commands as the *first* deployment step, before the first deploy attempt, rather
than discovering the default assumption is wrong after a failed build.

## Entry 3 — CORS silently blocked the first live frontend-to-backend request

**What happened:** After deploying both frontend (Vercel) and backend (Railway), the frontend
loaded but didn't render data. The `CLIENT_ORIGIN` environment variable on Railway had been
set to `capstone-project-plum-six-96.vercel.app` — the domain only, without the `https://`
scheme.

**Failure pattern:** A configuration value that looked plausible (it's "the URL") but didn't
match the exact string the browser sends in its `Origin` header, which always includes the
protocol. The `cors` middleware does an exact string match, not a fuzzy domain match, so this
silently rejected every cross-origin request rather than throwing an obvious error.

**Recovery:** Updated `CLIENT_ORIGIN` on Railway to the full origin string
(`https://capstone-project-plum-six-96.vercel.app`, no trailing slash), which matches exactly
what the browser sends. Redeployed the backend; requests succeeded immediately after.

**Prevention next time:** When setting any CORS origin config, copy the value directly from
the browser address bar (which always includes the scheme) rather than typing it from memory,
and treat "requests fail silently with no error" as a CORS-first hypothesis before assuming
the backend logic itself is broken.

## Entry 4 — Mobile layout wasn't actually broken, but was unverified until tested

**What happened:** The Filter Bar was flagged in Sprint 2 planning as a likely mobile-layout
risk (3 selects + date range + presets in one row), based on reasoning about the Tailwind
classes rather than an actual device test. Before rework, this was an assumption, not a
confirmed failure.

**Failure pattern:** This is closer to a *near-miss* than a hard failure — the risk was caught
during planning (Phase 6 impact assessment) rather than discovered live, which is the outcome
the planning discipline is meant to produce. Worth logging because "assumed it would work" was
correctly treated as insufficient evidence.

**Recovery:** Reworked `FilterBar.tsx` to stack vertically below the `md` breakpoint, added a
horizontally-scrollable row for date presets, and enforced 44px minimum touch targets across
all filter controls. Verified with Chrome DevTools' device toolbar (iPhone SE viewport) rather
than trusting the CSS classes alone.

**Prevention next time:** Treat "the responsive classes should handle it" as a hypothesis to
test on an actual narrow viewport, not a conclusion — this is now standard practice for any
future layout work on this project.
