const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth
export async function sendMagicLink(email: string) {
  return apiRequest('/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyToken(token: string) {
  return apiRequest('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

// Onboarding
export async function completeOnboarding(userId: string, businessType: string, answers: Record<string, string>) {
  return apiRequest('/onboarding', {
    method: 'POST',
    body: JSON.stringify({ userId, businessType, answers }),
  });
}

// Agents
export async function getAgents(userId: string) {
  return apiRequest(`/agents?userId=${userId}`);
}

export async function chatWithAgent(userId: string, agentId: string, message: string, businessId?: string) {
  return apiRequest(`/agents/${agentId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ userId, message, businessId }),
  });
}

// Workflows
export async function createWeeklyPlan(userId: string, businessId: string) {
  return apiRequest('/workflows/create-weekly-plan', {
    method: 'POST',
    body: JSON.stringify({ userId, businessId }),
  });
}

export async function generateMarketingAssets(userId: string, businessId: string, assetType: string) {
  return apiRequest('/workflows/generate-marketing-assets', {
    method: 'POST',
    body: JSON.stringify({ userId, businessId, assetType }),
  });
}

export async function runFinancialForecast(userId: string, businessId: string) {
  return apiRequest('/workflows/run-financial-forecast', {
    method: 'POST',
    body: JSON.stringify({ userId, businessId }),
  });
}

// Dashboard
export async function getDashboard(userId: string) {
  return apiRequest(`/dashboard?userId=${userId}`);
}

// Workspace
export async function getWorkspaceSQL(userId: string, table?: string) {
  const url = table 
    ? `/workspace/sql?userId=${userId}&table=${table}`
    : `/workspace/sql?userId=${userId}`;
  return apiRequest(url);
}

export async function getWorkspaceMemory(userId: string, prefix?: string) {
  const url = prefix
    ? `/workspace/memory?userId=${userId}&prefix=${prefix}`
    : `/workspace/memory?userId=${userId}`;
  return apiRequest(url);
}

// Billing
export async function createCheckoutSession(userId: string, successUrl: string, cancelUrl: string) {
  return apiRequest('/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ userId, successUrl, cancelUrl }),
  });
}

export async function createPortalSession(userId: string, returnUrl: string) {
  return apiRequest('/billing/portal', {
    method: 'POST',
    body: JSON.stringify({ userId, returnUrl }),
  });
}

export async function getBillingStatus(userId: string) {
  return apiRequest(`/billing/status?userId=${userId}`);
}

