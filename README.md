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
