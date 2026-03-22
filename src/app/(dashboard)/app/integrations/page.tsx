'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Plug, RefreshCw, Unlink, ExternalLink } from 'lucide-react'

interface GoogleStatus {
  connected: boolean
  customerId?: string
  lastSync?: string
}

function GoogleAdsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 19.5h20L12 2z" fill="#FBBC04" />
      <circle cx="19" cy="19.5" r="4.5" fill="#34A853" />
      <path d="M2 19.5H11.5" stroke="#EA4335" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  )
}

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected === 'google') {
      toast.success('Google Ads conectado com sucesso!')
      router.replace('/app/integrations')
    }
    if (error === 'oauth_cancelled') toast.error('Conexão cancelada.')
    if (error === 'oauth_failed') toast.error('Erro ao conectar com Google Ads.')
  }, [searchParams, router])

  const { data: status, isLoading } = useQuery<GoogleStatus>({
    queryKey: ['google-ads-status'],
    queryFn: async () => {
      const res = await fetch('/api/connect/google-ads/status')
      if (!res.ok) return { connected: false }
      return res.json()
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: () => fetch('/api/connect/google-ads/disconnect', { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Google Ads desconectado.')
      queryClient.invalidateQueries({ queryKey: ['google-ads-status'] })
    },
  })

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync/google-ads', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Sincronizado! ${data.campaignsSynced} campanhas, ${data.alertsCreated} alertas criados.`)
      queryClient.invalidateQueries({ queryKey: ['google-ads-status'] })
    } catch (err) {
      toast.error(`Erro na sincronização: ${String(err)}`)
    } finally {
      setSyncing(false)
    }
  }

  const hasDeveloperToken = true // verificado no servidor; assumimos que está configurado se a rota funciona

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--typography-size-2xl)] font-[var(--typography-weight-bold)]">
          Integrações
        </h1>
        <p className="mt-1 text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)]">
          Conecte suas plataformas de tráfego para sincronizar métricas e detectar alertas automaticamente.
        </p>
      </div>

      {/* Aviso Developer Token */}
      <Card className="border-[var(--color-warning)]" style={{ borderColor: 'var(--color-warning)' }}>
        <CardContent className="flex items-start gap-3 pt-4">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
          <div>
            <p className="text-[length:var(--typography-size-sm)] font-[var(--typography-weight-medium)]">
              Pré-requisito: Google Ads Developer Token
            </p>
            <p className="mt-1 text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)]">
              Além do OAuth, a API do Google Ads exige um Developer Token. Acesse{' '}
              <a
                href="https://ads.google.com/aw/apicenter"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
                style={{ color: 'var(--color-primary)' }}
              >
                ads.google.com/aw/apicenter <ExternalLink className="h-3 w-3" />
              </a>{' '}
              e adicione <code className="px-1 rounded text-xs" style={{ background: 'var(--color-muted)' }}>GOOGLE_ADS_DEVELOPER_TOKEN=xxx</code> no seu <code className="px-1 rounded text-xs" style={{ background: 'var(--color-muted)' }}>.env.local</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grid de integrações */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Google Ads */}
        <Card className="border-[var(--color-border)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]" style={{ background: 'var(--color-muted)' }}>
                  <GoogleAdsIcon />
                </div>
                <div>
                  <CardTitle className="text-[length:var(--typography-size-base)]">Google Ads</CardTitle>
                  <CardDescription className="text-[length:var(--typography-size-xs)]">
                    Search, Display, YouTube
                  </CardDescription>
                </div>
              </div>
              {!isLoading && (
                <Badge
                  variant={status?.connected ? 'default' : 'secondary'}
                  className="text-[length:var(--typography-size-xs)]"
                >
                  {status?.connected ? 'Conectado' : 'Desconectado'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {status?.connected ? (
              <>
                <div className="flex items-center gap-2 text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)]">
                  <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--color-success)' }} />
                  Conta: {status.customerId || 'Conectada'}
                </div>
                {status.lastSync && (
                  <p className="text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)]">
                    Última sync: {new Date(status.lastSync).toLocaleString('pt-BR')}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={handleSync}
                    disabled={syncing}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Sincronizando…' : 'Sincronizar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Desconectar
                  </Button>
                </div>
              </>
            ) : (
              <Button size="sm" className="w-full gap-2" asChild>
                <a href="/api/connect/google-ads">
                  <Plug className="h-3.5 w-3.5" />
                  Conectar Google Ads
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Meta Ads — em breve */}
        {(['Meta Ads', 'TikTok Ads', 'LinkedIn Ads'] as const).map((name) => (
          <Card key={name} className="border-[var(--color-border)] opacity-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]" style={{ background: 'var(--color-muted)' }}>
                    <Plug className="h-5 w-5 text-[var(--color-muted-foreground)]" />
                  </div>
                  <div>
                    <CardTitle className="text-[length:var(--typography-size-base)]">{name}</CardTitle>
                    <CardDescription className="text-[length:var(--typography-size-xs)]">Em breve</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[length:var(--typography-size-xs)]">Em breve</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" disabled>
                Em desenvolvimento
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
