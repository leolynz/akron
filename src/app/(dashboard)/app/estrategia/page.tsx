'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, X, Check, Target } from 'lucide-react'

interface ClusterEnriched {
  id: string
  nome: string
  campanhas: string[]
  criadoEm: string
  metaRoas: number | null
  metaCpa: number | null
  metaOrcamento: number | null
  pacing: number | null
  actualRoas: number | null
  actualCpa: number | null
  totalGasto: number | null
  totalImpressions: number | null
}

interface ClusterFormState {
  nome: string
  campanhas: string
  metaRoas: string
  metaCpa: string
  metaOrcamento: string
}

const emptyForm: ClusterFormState = {
  nome: '',
  campanhas: '',
  metaRoas: '',
  metaCpa: '',
  metaOrcamento: '',
}

function parseCampanhas(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

function statusBadge(cluster: ClusterEnriched) {
  const { actualRoas, metaRoas, actualCpa, metaCpa } = cluster

  let score = 0
  let checks = 0

  if (metaRoas != null && actualRoas != null) {
    checks++
    if (actualRoas >= metaRoas) score++
  }
  if (metaCpa != null && actualCpa != null) {
    checks++
    if (actualCpa <= metaCpa) score++
  }

  if (checks === 0) return null

  if (score === checks) {
    return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/20 text-green-400">Acima da Meta</span>
  }
  if (score > 0) {
    return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400">Na Meta</span>
  }
  return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500/20 text-red-400">Abaixo da Meta</span>
}

function MetricBar({ actual, meta, lowerIsBetter = false }: { actual: number | null; meta: number | null; lowerIsBetter?: boolean }) {
  if (meta == null || actual == null) return <div className="h-1.5 rounded-full bg-white/10 mt-1" />

  const ratio = lowerIsBetter
    ? meta / Math.max(actual, 0.01)
    : actual / Math.max(meta, 0.01)

  const pct = Math.min(ratio * 100, 100)
  const isGood = lowerIsBetter ? actual <= meta : actual >= meta

  return (
    <div className="h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: isGood ? '#22c55e' : '#ef4444',
        }}
      />
    </div>
  )
}

function ClusterCard({
  cluster,
  onEdit,
  onDelete,
}: {
  cluster: ClusterEnriched
  onEdit: (c: ClusterEnriched) => void
  onDelete: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{cluster.nome}</p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {cluster.campanhas.length} campanha{cluster.campanhas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {statusBadge(cluster)}
            <button
              onClick={() => onEdit(cluster)}
              className="p-1.5 rounded hover:bg-white/10 text-[var(--color-muted-foreground)] hover:text-white transition-colors"
              aria-label="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {confirmDelete ? (
              <>
                <button
                  onClick={() => onDelete(cluster.id)}
                  className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                  aria-label="Confirmar exclusão"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="p-1.5 rounded hover:bg-white/10 text-[var(--color-muted-foreground)] hover:text-white transition-colors"
                  aria-label="Cancelar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded hover:bg-red-500/10 text-[var(--color-muted-foreground)] hover:text-red-400 transition-colors"
                aria-label="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Campaign badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          {cluster.campanhas.slice(0, 3).map((c) => (
            <Badge key={c} variant="secondary" className="text-xs max-w-[120px] truncate">
              {c}
            </Badge>
          ))}
          {cluster.campanhas.length > 3 && (
            <Badge variant="outline" className="text-xs">+{cluster.campanhas.length - 3} mais</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* ROAS */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-muted-foreground)]">ROAS</span>
            <span className="text-white">
              {cluster.actualRoas != null ? `${cluster.actualRoas.toFixed(2)}x` : '—'}
              {cluster.metaRoas != null && (
                <span className="text-[var(--color-muted-foreground)] ml-1">/ meta {cluster.metaRoas.toFixed(2)}x</span>
              )}
            </span>
          </div>
          <MetricBar actual={cluster.actualRoas} meta={cluster.metaRoas} />
        </div>

        {/* CPA */}
        <div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-muted-foreground)]">CPA</span>
            <span className="text-white">
              {cluster.actualCpa != null ? `R$ ${cluster.actualCpa.toFixed(2)}` : '—'}
              {cluster.metaCpa != null && (
                <span className="text-[var(--color-muted-foreground)] ml-1">/ meta R$ {cluster.metaCpa.toFixed(2)}</span>
              )}
            </span>
          </div>
          <MetricBar actual={cluster.actualCpa} meta={cluster.metaCpa} lowerIsBetter />
        </div>

        {/* Daily budget */}
        {cluster.metaOrcamento != null && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-muted-foreground)]">Orçamento diário</span>
            <span className="text-white">R$ {cluster.metaOrcamento.toFixed(2)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ClusterForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  initial: ClusterFormState
  onSubmit: (form: ClusterFormState) => void
  onCancel: () => void
  isPending: boolean
  submitLabel: string
}) {
  const [form, setForm] = useState<ClusterFormState>(initial)

  const set = (field: keyof ClusterFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">Nome do grupo</label>
            <Input placeholder="Ex: Campanhas de Awareness" value={form.nome} onChange={set('nome')} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">
              Campanhas <span className="opacity-60">(IDs separados por vírgula)</span>
            </label>
            <Input placeholder="camp_123, camp_456" value={form.campanhas} onChange={set('campanhas')} />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">Meta de ROAS</label>
            <Input type="number" step="0.01" min="0" placeholder="Ex: 3.5" value={form.metaRoas} onChange={set('metaRoas')} />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">Meta de CPA (R$)</label>
            <Input type="number" step="0.01" min="0" placeholder="Ex: 50.00" value={form.metaCpa} onChange={set('metaCpa')} />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">Orçamento diário (R$)</label>
            <Input type="number" step="0.01" min="0" placeholder="Ex: 500.00" value={form.metaOrcamento} onChange={set('metaOrcamento')} />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button size="sm" onClick={() => onSubmit(form)} disabled={isPending || !form.nome.trim()}>
            {isPending ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EstrategiaPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<ClusterEnriched[]>({
    queryKey: ['clusters'],
    queryFn: async () => {
      const res = await fetch('/api/clusters')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (form: ClusterFormState) => {
      const res = await fetch('/api/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'default',
          nome: form.nome.trim(),
          campanhas: parseCampanhas(form.campanhas),
          metaRoas: form.metaRoas ? parseFloat(form.metaRoas) : undefined,
          metaCpa: form.metaCpa ? parseFloat(form.metaCpa) : undefined,
          metaOrcamento: form.metaOrcamento ? parseFloat(form.metaOrcamento) : undefined,
        }),
      })
      if (res.status === 403) {
        const data = await res.json()
        throw new Error(data.error ?? 'paywall')
      }
      if (!res.ok) throw new Error('Falha ao criar grupo')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Grupo criado!')
      setShowCreate(false)
      queryClient.invalidateQueries({ queryKey: ['clusters'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: ClusterFormState }) => {
      const res = await fetch(`/api/clusters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          campanhas: parseCampanhas(form.campanhas),
          metaRoas: form.metaRoas ? parseFloat(form.metaRoas) : null,
          metaCpa: form.metaCpa ? parseFloat(form.metaCpa) : null,
          metaOrcamento: form.metaOrcamento ? parseFloat(form.metaOrcamento) : null,
        }),
      })
      if (!res.ok) throw new Error('Falha ao atualizar grupo')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Grupo atualizado!')
      setEditingId(null)
      queryClient.invalidateQueries({ queryKey: ['clusters'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clusters/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir grupo')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Grupo excluído!')
      queryClient.invalidateQueries({ queryKey: ['clusters'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const clusterToForm = (c: ClusterEnriched): ClusterFormState => ({
    nome: c.nome,
    campanhas: c.campanhas.join(', '),
    metaRoas: c.metaRoas != null ? String(c.metaRoas) : '',
    metaCpa: c.metaCpa != null ? String(c.metaCpa) : '',
    metaOrcamento: c.metaOrcamento != null ? String(c.metaOrcamento) : '',
  })

  const editingCluster = data?.find((c) => c.id === editingId) ?? null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[length:var(--typography-size-3xl)] font-[var(--typography-weight-bold)] text-white">
            Estratégia
          </h1>
          <p className="text-[length:var(--typography-size-sm)] text-[var(--color-muted-foreground)] mt-1">
            Defina metas por grupo de campanha e monitore o desempenho.
          </p>
        </div>
        <Button
          onClick={() => { setShowCreate(true); setEditingId(null) }}
          disabled={showCreate}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Grupo
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <ClusterForm
          initial={emptyForm}
          onSubmit={(form) => createMutation.mutate(form)}
          onCancel={() => setShowCreate(false)}
          isPending={createMutation.isPending}
          submitLabel="Criar Grupo"
        />
      )}

      {/* Loading */}
      {isLoading && (
        <p className="text-center py-12 text-[var(--color-muted-foreground)]">Carregando grupos...</p>
      )}

      {/* Empty state */}
      {!isLoading && data && data.length === 0 && !showCreate && (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Target className="h-12 w-12 text-[var(--color-muted-foreground)] mb-4" />
            <p className="text-lg font-semibold text-white mb-1">Nenhum grupo ainda</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Crie seu primeiro grupo para definir metas e acompanhar o desempenho.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cluster grid */}
      {data && data.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((cluster) =>
            editingId === cluster.id && editingCluster ? (
              <ClusterForm
                key={cluster.id}
                initial={clusterToForm(editingCluster)}
                onSubmit={(form) => editMutation.mutate({ id: cluster.id, form })}
                onCancel={() => setEditingId(null)}
                isPending={editMutation.isPending}
                submitLabel="Salvar"
              />
            ) : (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                onEdit={(c) => { setEditingId(c.id); setShowCreate(false) }}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}
