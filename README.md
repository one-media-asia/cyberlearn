# CyberLearn

A separate Next.js frontend for the CyberLearn learning platform.

## Local development

```bash
npm install
npm run dev
```

## Environment variables

Set these in the deployment environment (never commit real keys):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL=https://labs-api.onemedia.asia`
- Optional server-side `ACADEMY_API_URL=https://api.onemedia.asia`

The frontend proxies course and lab reads through Next.js route handlers to avoid browser CORS requirements.

## Services

- Labs: `https://labs-api.onemedia.asia/api/labs`
- Courses: `https://api.onemedia.asia/api/academy/courses/`

This repository is separate from the CyberAgent production site. Review and test before deploying.


## Linux Fundamentals room prototype

The `feature/linux-fundamentals-room` branch contains the first room UI and an optional Vercel Sandbox adapter.

- The room UI is available at `/courses/linux-fundamentals`.
- Sandbox creation and command execution are server-side only.
- Every lab is a disposable Vercel Sandbox microVM with `networkPolicy: "deny-all"`.
- A student can have at most one active lab session reused by the session-start route.
- The command API uses a restricted command allowlist and passes arguments directly to the Sandbox SDK (no shell evaluation).
- Students can stop their lab explicitly. Sandbox sessions also have a 45-minute timeout.
- Lesson progress and assessment validation are still prototype-only; they are not yet saved to Django.

### Sandbox feature flag

The lab endpoints remain disabled unless this server-side Vercel environment variable is set:

```text
VERCEL_SANDBOX_ENABLED=true
```

The app uses Vercel OIDC when running inside a linked Vercel deployment; do not add a Vercel access token to browser-visible variables. The Sandbox SDK dependency is `@vercel/sandbox`.

**Plan note:** Vercel Hobby is limited to personal/non-commercial use. Keep this as a private technical proof-of-concept only on Hobby. Do not use Hobby for a commercial CyberLearn launch; review the Vercel plan and Sandbox pricing before enabling student access beyond private testing.
