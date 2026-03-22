const GRAPH_URL = 'https://graph.facebook.com/v19.0'

export interface MetaCampaignMetrics {
  campaignId: string
  campaignName: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  ctr: number
  cpc: number
  cpp: number
  frequency: number
}

export async function getMetaCampaignInsights(
  accessToken: string,
  adAccountId: string,
  dateStart: string,
  dateEnd: string
): Promise<MetaCampaignMetrics[]> {
  const fields = 'campaign_id,campaign_name,impressions,clicks,spend,actions,ctr,cpc,cpp,frequency'
  const params = new URLSearchParams({
    access_token: accessToken,
    level: 'campaign',
    fields,
    time_range: JSON.stringify({ since: dateStart, until: dateEnd }),
    time_increment: '1',
    limit: '100',
  })
  const res = await fetch(`${GRAPH_URL}/${adAccountId}/insights?${params}`)
  if (!res.ok) throw new Error(`Meta insights failed: ${await res.text()}`)
  const data = await res.json()

  return (data.data ?? []).map((row: Record<string, string>) => {
    const conversions = (JSON.parse(row.actions ?? '[]') as Array<{ action_type: string; value: string }>)
      .filter(a => a.action_type === 'purchase' || a.action_type === 'lead')
      .reduce((sum, a) => sum + parseFloat(a.value ?? '0'), 0)
    return {
      campaignId: row.campaign_id,
      campaignName: row.campaign_name,
      date: row.date_start,
      impressions: parseInt(row.impressions ?? '0'),
      clicks: parseInt(row.clicks ?? '0'),
      spend: parseFloat(row.spend ?? '0'),
      conversions,
      ctr: parseFloat(row.ctr ?? '0'),
      cpc: parseFloat(row.cpc ?? '0'),
      cpp: parseFloat(row.cpp ?? '0'),
      frequency: parseFloat(row.frequency ?? '0'),
    }
  })
}
