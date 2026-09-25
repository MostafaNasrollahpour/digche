# Digche Frontend

The Digche frontend is a Next.js application for customers, chefs, admins, and managers.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand

## Structure

```text
src/
├── app/
│   ├── (public)/
│   ├── (customer)/
│   ├── (chef)/
│   ├── (admin)/
│   ├── admin-login/
│   └── api/chat/[...path]/
├── config/
├── features/
├── shared/
└── store/
```

## Local Development

```bash
npm ci
npm run dev
```

Example local configuration:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
NEXT_BACKEND_API_BASE_URL=http://localhost:8081
```

Open:

```text
http://localhost:3000
```

## Validation

```bash
npm run lint
npm run build
```

## Project Documentation

See the root [README](../README.md) and [Getting Started](../docs/development/getting-started.md).
