# Zionstone Electro Musical

A modern e-commerce platform for musical instruments and electronics built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe (configured)
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account (free tier)
- Stripe account (for payments)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
   - PostgreSQL connection string
   - Clerk API keys
   - Stripe API keys

4. Initialize the database:
```bash
bunx prisma generate
bunx prisma db push
bunx prisma db seed  # Optional: seeds sample data
```

5. Run the development server:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication pages (Clerk)
│   ├── api/              # API routes
│   ├── cart/             # Shopping cart
│   ├── products/         # Product listing & details
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── header.tsx        # Site header
│   └── footer.tsx        # Site footer
└── lib/
    ├── utils.ts          # Utility functions
    ├── prisma.ts         # Prisma client
    └── cart-context.tsx  # Cart state management
```

## Features

- Product browsing with categories
- Shopping cart with local storage
- User authentication (Clerk)
- Order management
- Responsive design
- Dark mode support

## Commands

```bash
bun run dev        # Development server
bun run build      # Production build
bun run start      # Start production server
bun run lint       # ESLint
bunx prisma studio # Database GUI
```

## Database

The Prisma schema includes:
- User (Clerk integration)
- Product with images and features
- Category and Brand
- Order and OrderItem
- Cart and CartItem
- Review and Address

## Note

Your original static images were deleted when recreating the project. Restore them from your git history or backup, then place them in `/public/images/`.
