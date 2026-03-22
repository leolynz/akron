// Google Ads REST API v19 client

const API_VERSION = 'v19'
const BASE_URL = `https://googleads.googleapis.com/${API_VERSION}`
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? ''

function headers(accessToken: string, loginCustomerId?: string | null) {
  const h: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': DEVELOPER_TOKEN,
    'Content-Type': 'application/json',
  }
  if (loginCustomerId) h['login-customer-id'] = loginCustomerId.replace(/-/g, '')
  return h
}

export interface CustomerAccount {
  id: string
  name: string
  currencyCode: string
  timeZone: string
}

export async function listAccessibleCustomers(accessToken: string): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/customers:listAccessibleCustomers`, {
    headers: { Authorization: `Bearer ${accessToken}`, 'developer-token': DEVELOPER_TOKEN },
  })
  if (!res.ok) throw new Error(`listAccessibleCustomers: ${await res.text()}`)
  const data = await res.json()
  // Returns resource names like "customers/1234567890"
  return (data.resourceNames ?? []).map((r: string) => r.replace('customers/', ''))
}

export interface CampaignMetrics {
  campaignId: string
  campaignName: string
  status: string
  budgetId: string
  budgetAmountMicros: number
  impressions: number
  clicks: number
  costMicros: number
  conversions: number
  allConversionsValue: number
  ctr: number
  averageCpc: number
  date: string
}

export async function getCampaignMetrics(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  startDate: string,
  endDate: string
): Promise<CampaignMetrics[]> {
  const cleanId = customerId.replace(/-/g, '')
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign_budget.id,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.all_conversions_value,
      metrics.ctr,
      metrics.average_cpc,
      segments.date
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date DESC
  `

  const res = await fetch(`${BASE_URL}/customers/${cleanId}/googleAds:search`, {
    method: 'POST',
    headers: headers(accessToken, loginCustomerId),
    body: JSON.stringify({ query }),
  })

  if (!res.ok) throw new Error(`getCampaignMetrics: ${await res.text()}`)

  const data = await res.json()
  return (data.results ?? []).map((r: Record<string, unknown>) => {
    const campaign = r.campaign as Record<string, unknown>
    const budget = r.campaignBudget as Record<string, unknown>
    const metrics = r.metrics as Record<string, unknown>
    const segments = r.segments as Record<string, unknown>
    return {
      campaignId: String(campaign?.id ?? ''),
      campaignName: String(campaign?.name ?? ''),
      status: String(campaign?.status ?? ''),
      budgetId: String(budget?.id ?? ''),
      budgetAmountMicros: Number(budget?.amountMicros ?? 0),
      impressions: Number(metrics?.impressions ?? 0),
      clicks: Number(metrics?.clicks ?? 0),
      costMicros: Number(metrics?.costMicros ?? 0),
      conversions: Number(metrics?.conversions ?? 0),
      allConversionsValue: Number(metrics?.allConversionsValue ?? 0),
      ctr: Number(metrics?.ctr ?? 0),
      averageCpc: Number(metrics?.averageCpc ?? 0),
      date: String(segments?.date ?? ''),
    }
  })
}

export async function pauseCampaign(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  campaignId: string
): Promise<void> {
  const cleanId = customerId.replace(/-/g, '')
  const res = await fetch(`${BASE_URL}/customers/${cleanId}/campaigns:mutate`, {
    method: 'POST',
    headers: headers(accessToken, loginCustomerId),
    body: JSON.stringify({
      operations: [{
        update: {
          resourceName: `customers/${cleanId}/campaigns/${campaignId}`,
          status: 'PAUSED',
        },
        updateMask: 'status',
      }],
    }),
  })
  if (!res.ok) throw new Error(`pauseCampaign: ${await res.text()}`)
}

export async function updateCampaignBudget(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  budgetId: string,
  newAmountMicros: number
): Promise<void> {
  const cleanId = customerId.replace(/-/g, '')
  const res = await fetch(`${BASE_URL}/customers/${cleanId}/campaignBudgets:mutate`, {
    method: 'POST',
    headers: headers(accessToken, loginCustomerId),
    body: JSON.stringify({
      operations: [{
        update: {
          resourceName: `customers/${cleanId}/campaignBudgets/${budgetId}`,
          amountMicros: newAmountMicros,
        },
        updateMask: 'amount_micros',
      }],
    }),
  })
  if (!res.ok) throw new Error(`updateCampaignBudget: ${await res.text()}`)
}

export async function updateTargetCpa(
  accessToken: string,
  customerId: string,
  loginCustomerId: string | null,
  campaignId: string,
  targetCpaMicros: number
): Promise<void> {
  const cleanId = customerId.replace(/-/g, '')
  const res = await fetch(`${BASE_URL}/customers/${cleanId}/campaigns:mutate`, {
    method: 'POST',
    headers: headers(accessToken, loginCustomerId),
    body: JSON.stringify({
      operations: [{
        update: {
          resourceName: `customers/${cleanId}/campaigns/${campaignId}`,
          targetCpa: { targetCpaMicros },
        },
        updateMask: 'target_cpa.target_cpa_micros',
      }],
    }),
  })
  if (!res.ok) throw new Error(`updateTargetCpa: ${await res.text()}`)
}
