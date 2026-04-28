# QR Review AI System

Full-stack web app built with Next.js 14 App Router, Supabase, Tailwind, and OpenAI API.

## Folder Structure

```text
.
├── supabase/
│   └── schema.sql
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/generate-review/route.ts
│   │   │   ├── businesses/route.ts
│   │   │   ├── businesses/[businessId]/route.ts
│   │   │   ├── reviews/route.ts
│   │   │   └── reviews/stats/route.ts
│   │   ├── auth/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── review/[businessId]/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── modal.tsx
│   │   └── ui.tsx
│   ├── lib/
│   │   ├── supabase/admin.ts
│   │   ├── supabase/client.ts
│   │   ├── supabase/server.ts
│   │   └── utils.ts
│   └── types/index.ts
├── .env.example
└── middleware.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and fill values:

```bash
cp .env.example .env.local
```

3. In Supabase SQL editor, run:

`supabase/schema.sql`

4. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features Included

- Business registration with validation and unique UUID
- QR code generation for `/review/{businessId}`
- Download QR as PNG
- Customer review page with clickable stars
- AI-generated review text (max 150 words)
- Review editing with word counter and enforcement
- Save reviews to Supabase
- Admin dashboard with filter, average rating, and review count
- Loading states, error handling, and secure env usage
- Supabase Auth sign in/sign up and dashboard protection

# RevQR_AI
