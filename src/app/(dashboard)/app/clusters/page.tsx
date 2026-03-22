'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PaywallGate } from '@/components/shared/paywall-gate'
import { GitBranch, Plus } from 'lucide-react'

interface Cluster {
  id: string
  nome: string
  campanhas: string[]
  criadoEm: string
}

const CreateClusterSchema = z.object({
  nome: z.string().min(1),
  campanhas: z.string(),
})

function CreateClusterForm({ onSuccess }: { onSuccess: () => void }) {
  const [nome, setNome] = useState('')
  const [campanhas, setCampanhas] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = campanhas.split(',').map((s) => s.trim()).filter(Boolean)
      const res = await fetch('/api/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'default', nome, campanhas: parsed }),
      })
      if (res.status === 403) {
        const data = await res.json()
        throw new Error(data.error ?? 'paywall')
      }
      if (!res.ok) throw new Error('Failed to create cluster')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Cluster criado!')
      setNome('')
      setCampanhas('')
      onSuccess()
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="flex gap-2">
      <Input placeholder="Nome do cluster" value={nome} onChange={(e) => setNome(e.target.value)} />
      <Input placeholder="Campanhas (separadas por vírgula)" value={campanhas} onChange={(e) => setCampanhas(e.target.value)} />
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !nome}>
        <Plus className="h-4 w-4 mr-1" />
        Criar
      </Button>
    </div>
  )
}

export default function ClustersPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery<Cluster[]>({
    queryKey: ['clusters'],
    queryFn: async () => {
      const res = await fetch('/api/clusters')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--typography-size-3xl)] font-[var(--typography-weight-bold)]">
          Clusters de Campanhas
        </h1>
        <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] mt-1">
          Agrupe campanhas cross-canal em portfólios estratégicos
        </p>
      </div>

      <PaywallGate
        feature="Clusters de Campanhas"
        description="Agrupe campanhas de diferentes canais e visualize métricas consolidadas por portfólio."
        locked={error?.message?.includes('paywall') ?? false}
      >
        <div className="space-y-4">
          <CreateClusterForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['clusters'] })} />

          {isLoading && (
            <p className="text-center py-8 text-[var(--color-muted-foreground)]">Carregando clusters...</p>
          )}

          {data && data.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <GitBranch className="h-12 w-12 text-[var(--color-muted-foreground)] mb-4" />
                <CardTitle className="text-[length:var(--typography-size-xl)] mb-2">Nenhum cluster</CardTitle>
                <CardDescription>Crie seu primeiro cluster para agrupar campanhas relacionadas.</CardDescription>
              </CardContent>
            </Card>
          )}

          {data && data.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((cluster) => (
                <Card key={cluster.id}>
                  <CardHeader>
                    <CardTitle className="text-[length:var(--typography-size-base)]">{cluster.nome}</CardTitle>
                    <CardDescription>{cluster.campanhas.length} campanhas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {cluster.campanhas.slice(0, 3).map((c) => (
                        <Badge key={c} variant="secondary" className="text-[length:var(--typography-size-xs)]">
                          {c}
                        </Badge>
                      ))}
                      {cluster.campanhas.length > 3 && (
                        <Badge variant="outline">+{cluster.campanhas.length - 3}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PaywallGate>
    </div>
  )
}
