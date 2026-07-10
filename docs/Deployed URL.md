Both Backend and Frontend deployed

---------------------------------------------------------------------
Application URL - https://capstone-project-plum-six-96.vercel.app   |
---------------------------------------------------------------------

Frontend - https://capstone-project-plum-six-96.vercel.app
Backend API - https://capstoneproject-production-826b.up.railway.app
API Health Check - https://capstoneproject-production-826b.up.railway.app/api/health
Git Repository - https://github.com/AAIN1692/capstone_project

Hosting:
Frontend		  : Vercel (Root Directory: client, framework auto-detected as Vite)
Backend + Database: Railway (Root Directory: server, SQLite via better-sqlite3)
CORS              : Railway CLIENT_ORIGIN environment variable set to the live Vercel origin, so the deployed frontend can call the deployed backend (localhost is blocked in production, by design)

Verification Performed:
 - /api/health returns {"status":"ok"} on the live Railway URL
 - /api/summary returns real, non-zero figures against the seeded dataset
 - Dashboard loads on the live Vercel URL with real data (not blank, not stuck loading)
 - Browser console checked on the live site — no errors
 - Deploy logs confirmed the auto-seed-on-boot logic ran successfully on first Railway deploy ("No deals found — running seed automatically..." → "Seed complete: ... deals inserted")
 - Quota attainment, revenue trend, and breakdown charts all reflect the seeded patterns (e.g.a visible dip in the weekly trend chart)
