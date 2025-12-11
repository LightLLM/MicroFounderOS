# MicroFounder OS Architecture

## System Overview

MicroFounder OS is built as a modern, AI-powered platform with a clear separation between backend services and frontend presentation. The architecture leverages Raindrop's LiquidMetal SmartComponents for core infrastructure and Vultr for AI inference.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js 15 (App Router) + Tailwind CSS + ShadCN UI        │
│  - /onboarding                                              │
│  - /dashboard                                               │
│  - /agents                                                  │
│  - /agents/[id] (chat interface)                           │
│  - /workspace                                               │
│  - /settings                                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
┌──────────────────────┴──────────────────────────────────────┐
│                     Backend Layer                            │
│  Raindrop MCP Server (Express.js)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Agent Manager                            │  │
│  │  - CEO Agent                                          │  │
│  │  - Marketing Agent                                    │  │
│  │  - Finance Agent                                      │  │
│  │  - Product Agent                                     │  │
│  │  - Sales Agent                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           SmartComponents Services                    │  │
│  │  - SmartInference (Vultr)                             │  │
│  │  - SmartMemory (Raindrop)                             │  │
│  │  - SmartSQL (Raindrop)                                │  │
│  │  - SmartBuckets (Raindrop)                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              External Services                         │  │
│  │  - WorkOS (Authentication)                             │  │
│  │  - Stripe (Billing)                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Backend Architecture

#### 1. MCP Server
The backend runs as a Model Context Protocol (MCP) server, allowing it to be used as a tool by other AI systems while also serving HTTP requests.

**Location**: `backend/src/index.ts`

**Key Features**:
- Express.js HTTP server for REST API
- MCP server for tool integration
- Service initialization and dependency injection

#### 2. SmartComponents Services

##### SmartInference
- **Purpose**: All LLM reasoning and generation
- **Provider**: Vultr Inference API
- **Usage**: All agent reasoning, chat responses, content generation
- **Location**: `backend/src/services/smart-inference.ts`

##### SmartMemory
- **Purpose**: Persistent collaborative agent state
- **Provider**: Raindrop Memory API
- **Usage**: Agent conversations, context, shared state
- **Location**: `backend/src/services/smart-memory.ts`

##### SmartSQL
- **Purpose**: User business data storage
- **Provider**: Raindrop SQL API
- **Usage**: Business records, forecasts, plans, financial data
- **Location**: `backend/src/services/smart-sql.ts`

##### SmartBuckets
- **Purpose**: Generated asset storage
- **Provider**: Raindrop Buckets API
- **Usage**: Marketing assets, PRDs, documents
- **Location**: `backend/src/services/smart-buckets.ts`

#### 3. Agent System

Each agent is a modular class that:
- Uses SmartInference for reasoning
- Reads/writes to SmartMemory for context
- Accesses SmartSQL for business data
- Saves outputs to SmartBuckets

**Agent Types**:
1. **CEO Agent** (`backend/src/agents/ceo-agent.ts`)
   - Reads: Business context, previous plans
   - Writes: Weekly plans to SmartSQL and SmartMemory
   - Capabilities: Strategic planning, weekly plan generation

2. **Marketing Agent** (`backend/src/agents/marketing-agent.ts`)
   - Reads: Business context, marketing history
   - Writes: Assets to SmartBuckets, conversations to SmartMemory
   - Capabilities: Ad copy, landing pages, email campaigns

3. **Finance Agent** (`backend/src/agents/finance-agent.ts`)
   - Reads: Business data, financial history
   - Writes: Forecasts to SmartSQL, analysis to SmartMemory
   - Capabilities: Forecasting, pricing, break-even analysis

4. **Product Agent** (`backend/src/agents/product-agent.ts`)
   - Reads: Product context, previous PRDs
   - Writes: PRDs to SmartBuckets, UX suggestions to SmartMemory
   - Capabilities: PRD creation, UX suggestions

5. **Sales Agent** (`backend/src/agents/sales-agent.ts`)
   - Reads: Sales context, business context
   - Writes: Outreach messages to SmartMemory
   - Capabilities: Outreach messages, sales scripts

#### 4. Authentication (WorkOS)

**Location**: `backend/src/auth/workos-auth.ts`

**Flow**:
1. User requests magic link
2. WorkOS sends email with magic link
3. User clicks link, redirected to callback
4. Backend exchanges code for access token
5. Token stored in frontend localStorage

#### 5. Billing (Stripe)

**Location**: `backend/src/billing/stripe-billing.ts`

**Features**:
- Checkout session creation
- Customer portal access
- Subscription status checking
- Webhook handling

### Frontend Architecture

#### 1. Next.js 15 App Router

**Structure**:
```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home (redirects to onboarding)
├── onboarding/         # Onboarding flow
├── dashboard/          # Main dashboard
├── agents/             # Agent list
│   └── [id]/          # Individual agent chat
├── workspace/          # SQL + Memory viewer
└── settings/           # Billing & account
```

#### 2. UI Components

Built with ShadCN UI components:
- Button, Card, Input, Label
- Consistent styling with Tailwind CSS
- Responsive design

#### 3. API Client

**Location**: `frontend/lib/api.ts`

Centralized API client with:
- Automatic token injection
- Error handling
- Type-safe request/response handling

## Data Flow

### Onboarding Flow

1. User enters email → Frontend calls `/api/auth/magic-link`
2. User clicks magic link → Redirected to `/api/auth/callback`
3. Backend exchanges code for token → Returns to frontend
4. User selects business type → Frontend calls `/api/onboarding`
5. Backend creates business record in SmartSQL
6. Backend initializes agents in SmartMemory
7. User redirected to dashboard

### Agent Chat Flow

1. User sends message → Frontend calls `/api/agents/:id/chat`
2. Backend routes to appropriate agent
3. Agent reads context from SmartMemory
4. Agent reads business data from SmartSQL
5. Agent uses SmartInference (Vultr) for reasoning
6. Agent saves conversation to SmartMemory
7. Response returned to frontend

### Workflow Execution Flow

1. User triggers workflow → Frontend calls `/api/workflows/:workflow`
2. Backend routes to appropriate agent method
3. Agent performs task using SmartComponents
4. Agent saves output to SmartSQL/SmartBuckets
5. Result returned to frontend

## Security

- **Authentication**: WorkOS handles secure authentication
- **Authorization**: Token-based API access
- **Data Isolation**: User-scoped data in SmartSQL and SmartMemory
- **API Security**: CORS configuration, input validation

## Scalability

- **Stateless Backend**: Can scale horizontally
- **External Services**: Raindrop and Vultr handle scaling
- **Frontend**: Static generation where possible, CDN distribution

## Error Handling

- **Backend**: Try-catch blocks with fallback to local storage
- **Frontend**: Error boundaries, user-friendly error messages
- **API**: Consistent error response format

## Future Enhancements

1. Real-time updates via WebSockets
2. Agent-to-agent communication
3. Advanced workflow orchestration
4. Analytics and monitoring
5. Multi-tenant support
6. Custom agent creation

