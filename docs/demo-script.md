# MicroFounder OS - Demo Script

## Pre-Demo Setup

1. Ensure backend is running on `http://localhost:3001`
2. Ensure frontend is running on `http://localhost:3000`
3. Have test credentials ready (or use demo mode)
4. Clear browser cache/localStorage if needed

## Demo Flow (15-20 minutes)

### 1. Introduction (2 minutes)

**Script**:
"Today I'm going to show you MicroFounder OS, an AI-powered Startup Operating System designed for solo founders and tiny teams. The system provides five specialized AI agents that help manage all aspects of startup operations."

**Key Points**:
- Built with Raindrop LiquidMetal SmartComponents
- Uses Vultr for AI inference
- WorkOS for authentication
- Stripe for billing

### 2. Onboarding Flow (3 minutes)

**Navigate to**: `http://localhost:3000`

**Script**:
"Let's start by onboarding a new user. The system uses WorkOS for secure email-based authentication with magic links."

**Actions**:
1. Enter email address
2. Click "Send Magic Link"
3. Show magic link sent message
4. Click "Continue (Demo Mode)" for demo purposes
5. Select business type (e.g., "SaaS")
6. Answer the three onboarding questions:
   - "What is your main goal for the next 3 months?" → "Launch MVP and get first 10 customers"
   - "What is your biggest challenge right now?" → "Finding product-market fit"
   - "What stage is your business at?" → "Pre-launch"

**Highlight**:
- "The system creates a business record in SmartSQL and initializes all agents with shared SmartMemory"

### 3. Dashboard Overview (3 minutes)

**Navigate to**: Dashboard (auto-redirect after onboarding)

**Script**:
"Here's the main dashboard. You can see an overview of your business and recent activity from all agents."

**Actions**:
1. Point out business overview card
2. Show the four metric cards:
   - Weekly Plans: 0
   - Marketing Assets: 0
   - Forecasts: 0
   - Status: Active
3. Show Quick Actions section
4. Show Recent Plans and Recent Assets sections (empty initially)

**Highlight**:
- "All data is pulled from SmartSQL and SmartMemory in real-time"

### 4. Agent System (4 minutes)

**Navigate to**: `/agents`

**Script**:
"MicroFounder OS includes five specialized agents, each with unique capabilities."

**Actions**:
1. Show the five agent cards:
   - CEO Agent
   - Marketing Agent
   - Finance Agent
   - Product Agent
   - Sales Agent
2. Click on "CEO Agent"
3. Navigate to chat interface

**Highlight**:
- "Each agent has its own chat interface and maintains conversation context in SmartMemory"

### 5. Agent Chat Demo (5 minutes)

**Navigate to**: `/agents/ceo`

**Script**:
"Let's chat with the CEO Agent. It can help with strategic planning and create weekly plans."

**Actions**:
1. Send message: "What should I focus on this week?"
2. Wait for response (show loading state)
3. Show response
4. Send follow-up: "Create a weekly plan for me"
5. Show response with plan

**Navigate to**: `/agents/marketing`

**Script**:
"Now let's try the Marketing Agent. It specializes in creating marketing assets."

**Actions**:
1. Send message: "I need ad copy for my SaaS product"
2. Show response
3. Explain that assets are saved to SmartBuckets

**Navigate to**: `/agents/finance`

**Script**:
"The Finance Agent helps with financial planning and forecasting."

**Actions**:
1. Send message: "Help me understand my unit economics"
2. Show response

### 6. Workflow Runner (2 minutes)

**Navigate to**: `/dashboard`

**Script**:
"You can also trigger automated workflows directly from the dashboard."

**Actions**:
1. Click "Create Weekly Plan"
2. Show loading state
3. Show success message
4. Refresh dashboard to show updated metrics
5. Show new plan in Recent Plans section

**Highlight**:
- "Workflows automatically save outputs to SmartSQL and SmartBuckets"

### 7. Workspace Viewer (2 minutes)

**Navigate to**: `/workspace`

**Script**:
"The Workspace page lets you view your business data and agent memory."

**Actions**:
1. Show SmartSQL tab
   - Show available tables
   - Explain data structure
2. Switch to SmartMemory tab
   - Show memory keys
   - Show memory data structure
   - Explain how agents use this for context

**Highlight**:
- "This transparency helps you understand what data the agents are using"

### 8. Settings & Billing (2 minutes)

**Navigate to**: `/settings`

**Script**:
"Finally, the Settings page handles billing and account management."

**Actions**:
1. Show Billing section
   - Show subscription status
   - Explain Stripe integration
   - Show "Subscribe" button (don't click in demo)
2. Show Account section
   - Show Log Out button

**Highlight**:
- "Stripe Checkout handles secure payment processing"

### 9. Technical Highlights (2 minutes)

**Script**:
"Let me highlight some technical aspects of the system:"

**Key Points**:
1. **Backend Architecture**:
   - Raindrop MCP Server
   - All LLM calls through Vultr
   - SmartComponents for storage

2. **Frontend**:
   - Next.js 15 App Router
   - Tailwind CSS + ShadCN UI
   - Responsive design

3. **Agent System**:
   - Modular agent architecture
   - Shared SmartMemory for context
   - SmartSQL for business data
   - SmartBuckets for assets

4. **Deployment**:
   - Backend on Raindrop
   - Frontend on Netlify
   - Public URL available

### 10. Q&A (Remaining Time)

**Common Questions**:

Q: "How does the agent memory work?"
A: "Each agent reads and writes to SmartMemory, which is shared across all agents. This allows them to maintain context and collaborate."

Q: "What happens if Vultr is down?"
A: "The system includes error handling and fallback mechanisms. In production, we'd implement retry logic and alternative providers."

Q: "Can I create custom agents?"
A: "Not in v1, but that's planned for a future release. The architecture supports it."

Q: "How is data secured?"
A: "All data is user-scoped in SmartSQL and SmartMemory. WorkOS handles secure authentication, and we follow best practices for data encryption."

Q: "What's the pricing model?"
A: "Stripe Checkout handles subscriptions. The exact pricing would be configured in Stripe."

## Demo Tips

1. **Keep it conversational**: Don't just click through, explain what's happening
2. **Show the magic**: Emphasize the AI capabilities and how agents work together
3. **Be honest about limitations**: If something doesn't work perfectly, acknowledge it
4. **Highlight architecture**: Technical audiences will appreciate the SmartComponents integration
5. **End with vision**: Talk about future enhancements and roadmap

## Troubleshooting

**If backend is down**:
- Show frontend UI and explain the architecture
- Use mock data if needed

**If agents are slow**:
- Explain that Vultr inference can take a few seconds
- Show the loading states

**If something breaks**:
- Stay calm, explain it's a demo environment
- Show the code structure if helpful
- Focus on what works

## Closing

**Script**:
"MicroFounder OS provides a comprehensive AI-powered solution for solo founders. The modular agent architecture, combined with Raindrop's SmartComponents and Vultr inference, creates a scalable and powerful platform. Thank you for your time. Any questions?"

