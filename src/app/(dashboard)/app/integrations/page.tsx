'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Database, Plug, RefreshCw, Unlink, FlaskConical } from 'lucide-react'

interface GoogleStatus {
  connected: boolean
  customerId?: string
  lastSync?: string
}

interface MetaStatus {
  connected: boolean
  adAccountId?: string
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

function MetaAdsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#1877F2" />
      <path
        d="M16.5 12.5h-2v6h-2.5v-6h-1.5v-2h1.5v-1.5c0-1.7 1-2.5 2.5-2.5.7 0 1.5.1 1.5.1V8h-1c-.8 0-1 .4-1 1v1.5H16l-.5 2z"
        fill="white"
      />
    </svg>
  )
}

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [syncing, setSyncing] = useState(false)
  const [syncingMeta, setSyncingMeta] = useState(false)
  const [creatingTest, setCreatingTest] = useState(false)
  const [mccId, setMccId] = useState('')
  const [loadingDemo, setLoadingDemo] = useState(false)

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected === 'google') {
      toast.success('Google Ads conectado com sucesso!')
      router.replace('/app/integrations')
    }
    if (connected === 'meta') {
      toast.success('Meta Ads conectado com sucesso!')
      router.replace('/app/integrations')
    }
    if (error === 'oauth_cancelled') toast.error('Conexão cancelada.')
    if (error === 'oauth_failed') toast.error('Erro ao conectar com Google Ads.')
    if (error === 'meta_cancelled') toast.error('Conexão com Meta Ads cancelada.')
    if (error === 'meta_failed') toast.error('Erro ao conectar com Meta Ads.')
  }, [searchParams, router])

  const { data: status, isLoading } = useQuery<GoogleStatus>({
    queryKey: ['google-ads-status'],
    queryFn: async () => {
      const res = await fetch('/api/connect/google-ads/status')
      if (!res.ok) return { connected: false }
      return res.json()
    },
  })

  const { data: metaStatus, isLoading: metaLoading } = useQuery<MetaStatus>({
    queryKey: ['meta-ads-status'],
    queryFn: async () => {
      const res = await fetch('/api/connect/meta-ads/status')
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

  const disconnectMetaMutation = useMutation({
    mutationFn: () => fetch('/api/connect/meta-ads/disconnect', { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Meta Ads desconectado.')
      queryClient.invalidateQueries({ queryKey: ['meta-ads-status'] })
    },
  })

  async function handleCreateTestAccount() {
    setCreatingTest(true)
    try {
      const res = await fetch('/api/connect/google-ads/create-test-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mccId: mccId || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Conta de teste criada! ID: ${data.customerId}`)
      queryClient.invalidateQueries({ queryKey: ['google-ads-status'] })
    } catch (err) {
      toast.error(`Erro: ${String(err)}`)
    } finally {
      setCreatingTest(false)
    }
  }

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

  async function handleSyncMeta() {
    setSyncingMeta(true)
    try {
      const res = await fetch('/api/sync/meta-ads', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Sincronizado! ${data.campaignsSynced} campanhas, ${data.alertsCreated} alertas criados.`)
      queryClient.invalidateQueries({ queryKey: ['meta-ads-status'] })
    } catch (err) {
      toast.error(`Erro na sincronização: ${String(err)}`)
    } finally {
      setSyncingMeta(false)
    }
  }

  async function handleLoadDemo() {
    setLoadingDemo(true)
    try {
      const res = await fetch('/api/dev/seed', {
        method: 'POST',
        headers: { 'x-seed-secret': 'akron-dev-seed' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`${data.alertsCreated} alertas criados! Acesse Otimizações para ver.`)
    } catch (err) {
      toast.error(`Erro ao carregar dados demo: ${String(err)}`)
    } finally {
      setLoadingDemo(false)
    }
  }

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
                <div className="flex flex-col gap-2">
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
                  {/* Token em modo teste — cria conta de teste via API */}
                  <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
                      Token em modo teste — crie uma conta de teste:
                    </p>
                    <input
                      type="text"
                      placeholder="ID da MCC (ex: 123-456-7890)"
                      value={mccId}
                      onChange={e => setMccId(e.target.value)}
                      className="w-full rounded-[var(--radius-md)] border px-2.5 py-1.5 text-xs text-white outline-none focus:border-[var(--color-primary)]"
                      style={{ background: 'var(--color-muted)', borderColor: 'var(--color-border)' }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5"
                      onClick={handleCreateTestAccount}
                      disabled={creatingTest}
                    >
                      <FlaskConical className={`h-3.5 w-3.5 ${creatingTest ? 'animate-spin' : ''}`} />
                      {creatingTest ? 'Criando…' : 'Criar conta de teste'}
                    </Button>
                  </div>
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

        {/* Meta Ads */}
        <Card className="border-[var(--color-border)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]" style={{ background: 'var(--color-muted)' }}>
                  <MetaAdsIcon />
                </div>
                <div>
                  <CardTitle className="text-[length:var(--typography-size-base)]">Meta Ads</CardTitle>
                  <CardDescription className="text-[length:var(--typography-size-xs)]">
                    Facebook, Instagram
                  </CardDescription>
                </div>
              </div>
              {!metaLoading && (
                <Badge
                  variant={metaStatus?.connected ? 'default' : 'secondary'}
                  className="text-[length:var(--typography-size-xs)]"
                >
                  {metaStatus?.connected ? 'Conectado' : 'Desconectado'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {metaStatus?.connected ? (
              <>
                <div className="flex items-center gap-2 text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)]">
                  <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--color-success)' }} />
                  Conta: {metaStatus.adAccountId || 'Conectada'}
                </div>
                {metaStatus.lastSync && (
                  <p className="text-[length:var(--typography-size-xs)] text-[var(--color-muted-foreground)]">
                    Última sync: {new Date(metaStatus.lastSync).toLocaleString('pt-BR')}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={handleSyncMeta}
                    disabled={syncingMeta}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncingMeta ? 'animate-spin' : ''}`} />
                    {syncingMeta ? 'Sincronizando…' : 'Sincronizar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => disconnectMetaMutation.mutate()}
                    disabled={disconnectMetaMutation.isPending}
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Desconectar
                  </Button>
                </div>
              </>
            ) : (
              <Button size="sm" className="w-full gap-2" asChild>
                <a href="/api/connect/meta-ads">
                  <Plug className="h-3.5 w-3.5" />
                  Conectar Meta Ads
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* TikTok Ads — em breve */}
        {(['TikTok Ads', 'LinkedIn Ads'] as const).map((name) => (
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

      {/* Dados de Demonstração */}
      <Card className="border-[var(--color-border)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]" style={{ background: 'var(--color-muted)' }}>
              <Database className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            </div>
            <div>
              <CardTitle className="text-[length:var(--typography-size-base)]">Dados de Demonstração</CardTitle>
              <CardDescription className="text-[length:var(--typography-size-xs)]">
                Carregue campanhas e alertas realistas para testar o sistema sem precisar conectar plataformas reais.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleLoadDemo}
            disabled={loadingDemo}
          >
            <Database className={`h-3.5 w-3.5 ${loadingDemo ? 'animate-pulse' : ''}`} />
            {loadingDemo ? 'Carregando…' : 'Carregar Dados Demo'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
