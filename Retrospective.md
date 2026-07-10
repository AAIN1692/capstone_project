Retrospective — Sales Pulse:

How did the original plan change during execution?
The core scope held steady — all 6 must-have features from the PRD shipped as originally
scoped, and the Out of Scope list wasn't violated by feature creep, which was the biggest risk
flagged back in Phase 1. What did change was the sequencing of confidence: the architecture
assumed SQLite-on-Railway would be a minor footnote risk, but it became a real, hands-on
problem (ephemeral filesystem wiping seeded data) that needed an actual code fix
(seedIfEmpty()), not just a documented caveat. The Sprint 2 change request also turned out
to be less about new building and more about verifying things the Sprint 1 architecture had
already anticipated — error handling and loading states were mostly done by design, and the
real Sprint 2 work concentrated almost entirely on mobile layout, which had been correctly
flagged as unverified rather than falsely assumed to be fine.

What was the hardest part?
Deployment configuration, not application code. The TypeScript logic errors were fast to fix
once diagnosed. The genuinely time-consuming part was the gap between "the code is correct"
and "the code is correctly configured on a specific host" — Root Directory settings, exact
CORS origin strings, build/start commands. None of that shows up in local development, and all
of it only surfaces once you're deploying to real infrastructure.

What failure occurred, and how was it recovered?
See the Debugging Journal for full detail. The CORS misconfiguration (missing https:// in
CLIENT_ORIGIN) was the most instructive: no error was thrown anywhere in the stack, no log
line pointed at the cause — requests just silently failed and the frontend stayed blank. The
recovery pattern that mattered wasn't a specific fix so much as a diagnostic habit: when
something fails silently with a working backend and a working frontend individually, treat
the seam between them (CORS, env vars, URL mismatches) as the first suspect before re-reading
either codebase.

What would be built differently with more time?
Two things: first, deployment configuration would be nailed down before writing a single
line of application code, using a trivial "hello world" endpoint deployed end-to-end on day
one, so Root Directory and CORS issues surface immediately rather than after a full Sprint 1
build. Second, the mobile-responsive work in Sprint 2 would have been tested on a real device
throughout Sprint 1, rather than deferred to a dedicated pass — several of the fixes (44px
touch targets, tick-label crowding) were things that would have been obvious earlier if a
narrow viewport had been open in a second window the whole time, not just checked once at the
end.

What am I most proud of?
The seeded dataset actually working the way it was designed to — the deliberate patterns (a
star performer, a slumping region, a seasonal dip) show up clearly in the live trend chart,
which means the dashboard isn't just technically functional, it's genuinely readable: a
non-technical manager looking at it would actually notice something real happening in the
data. That was the whole point of the product, and it held up end to end from the Idea Brief
through to the deployed app.
