# MicroFounder OS

An AI-powered Startup Operating System for solo founders and tiny teams, built with LiquidMetal Raindrop SmartComponents and Vultr inference.

## Overview

MicroFounder OS provides a comprehensive suite of AI agents that help solo founders and small teams manage their startup operations. The system includes specialized agents for CEO strategy, marketing, finance, product development, and sales.

## Architecture

- **Backend**: Raindrop MCP Server with SmartComponents
- **Frontend**: Next.js 15 (App Router) with Tailwind CSS + ShadCN
- **Inference**: Vultr (all LLM calls)
- **Auth**: WorkOS (email + magic link)
- **Billing**: Stripe Checkout
- **Storage**: SmartSQL (business data), SmartMemory (agent state), SmartBuckets (generated assets)

## Features

### Agents

1. **CEO Agent**: Strategic planning, weekly plans, high-level decision making
2. **Marketing Agent**: Ad copy, landing pages, email campaigns
3. **Finance Agent**: Forecasting, pricing, break-even analysis
4. **Product Agent**: PRDs, UX suggestions, product documentation
5. **Sales Agent**: Outreach messages, sales scripts

### Core Features

- Onboarding flow with business type selection
- Dashboard with business overview and metrics
- Chat interface for each agent
- Workflow runner for automated tasks
- Workspace viewer for SmartSQL and SmartMemory
- Settings page for billing and account management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Vultr API key
- Raindrop API key
- WorkOS credentials
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MicroFounderOS
```

2. Install dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Set up environment variables:

**Backend** (`backend/.env`):
```env
VULTR_API_KEY=your_vultr_api_key
VULTR_INFERENCE_ENDPOINT=https://api.vultr.com/v2/inference
RAINDROP_API_KEY=your_raindrop_api_key
RAINDROP_MEMORY_ENDPOINT=https://api.raindrop.io/memory
RAINDROP_SQL_ENDPOINT=https://api.raindrop.io/sql
RAINDROP_BUCKETS_ENDPOINT=https://api.raindrop.io/buckets
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_CLIENT_SECRET=your_workos_client_secret
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRICE_ID=price_your_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start the development servers:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
MicroFounderOS/
├── backend/
│   ├── src/
│   │   ├── agents/          # Agent implementations
│   │   ├── auth/            # WorkOS authentication
│   │   ├── billing/         # Stripe billing
│   │   ├── routes/          # API routes
│   │   └── services/        # SmartComponents services
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # UI components
│   ├── lib/                 # Utilities and API client
│   ├── package.json
│   └── tsconfig.json
└── docs/                    # Documentation
```

## Deployment

### Backend (Raindrop)

1. Build the backend:
```bash
cd backend
npm run build
```

2. Deploy to Raindrop following their deployment guidelines.

### Frontend (Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Netlify:
   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables

## API Endpoints

### Authentication
- `POST /api/auth/magic-link` - Send magic link
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/verify` - Verify token

### Onboarding
- `POST /api/onboarding` - Complete onboarding

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents/:agentId/chat` - Chat with agent

### Workflows
- `POST /api/workflows/create-weekly-plan` - Create weekly plan
- `POST /api/workflows/generate-marketing-assets` - Generate marketing assets
- `POST /api/workflows/run-financial-forecast` - Run financial forecast

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Workspace
- `GET /api/workspace/sql` - Get SQL data
- `GET /api/workspace/memory` - Get memory data

### Billing
- `POST /api/billing/checkout` - Create checkout session
- `POST /api/billing/portal` - Create portal session
- `GET /api/billing/status` - Get subscription status
- `POST /api/billing/webhook` - Stripe webhook handler

## Documentation

- [Architecture Documentation](./docs/architecture.md)
- [Product Requirements Document](./docs/prd.md)
- [Demo Script](./docs/demo-script.md)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

