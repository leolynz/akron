'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PaywallGate } from '@/components/shared/paywall-gate'
import { Users, Plus } from 'lucide-react'

interface Client {
  id: string
  nome: string
  canaisConectados: string[]
  criadoEm: string
}

function CreateClientForm({ onSuccess }: { onSuccess: () => void }) {
  const [nome, setNome] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: 'default', nome, canaisConectados: [] }),
      })
      if (res.status === 403) {
        const data = await res.json()
        throw new Error(data.error ?? 'paywall')
      }
      if (!res.ok) throw new Error('Failed to create client')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Cliente adicionado!')
      setNome('')
      onSuccess()
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="flex gap-2">
      <Input placeholder="Nome do cliente" value={nome} onChange={(e) => setNome(e.target.value)} />
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !nome}>
        <Plus className="h-4 w-4 mr-1" />
        Adicionar
      </Button>
    </div>
  )
}

export default function ClientsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[length:var(--typography-size-3xl)] font-[var(--typography-weight-bold)]">
          Clientes
        </h1>
        <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] mt-1">
          Gerencie múltiplos clientes com visão centralizada por conta
        </p>
      </div>

      <PaywallGate
        feature="Multi-cliente"
        description="Gerencie campanhas de múltiplos clientes em um único workspace com visão consolidada."
        locked={error?.message?.includes('paywall') ?? false}
      >
        <div className="space-y-4">
          <CreateClientForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['clients'] })} />

          {isLoading && (
            <p className="text-center py-8 text-[var(--color-muted-foreground)]">Carregando clientes...</p>
          )}

          {data && data.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Users className="h-12 w-12 text-[var(--color-muted-foreground)] mb-4" />
                <CardTitle className="text-[length:var(--typography-size-xl)] mb-2">Nenhum cliente</CardTitle>
                <CardDescription>Adicione seus clientes para gerenciar campanhas de múltiplas contas.</CardDescription>
              </CardContent>
            </Card>
          )}

          {data && data.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((client) => (
                <Card key={client.id}>
                  <CardHeader>
                    <CardTitle className="text-[length:var(--typography-size-base)]">{client.nome}</CardTitle>
                    <CardDescription>
                      {client.canaisConectados.length > 0
                        ? `${client.canaisConectados.length} canais conectados`
                        : 'Nenhum canal conectado'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {client.canaisConectados.map((canal) => (
                        <Badge key={canal} variant="outline">
                          {canal}
                        </Badge>
                      ))}
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
