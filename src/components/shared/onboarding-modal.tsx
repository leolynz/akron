'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap, Plug, RefreshCw, Bell, ArrowRight, CheckCircle } from 'lucide-react'

interface OnboardingModalProps {
  userName?: string | null
}

const steps = [
  {
    icon: Zap,
    iconColor: '#2563EB',
    title: 'Bem-vindo ao Akron',
    subtitle: 'Seu centro de comando para campanhas de mídia paga.',
    description:
      'O Akron monitora suas campanhas 24/7, detecta anomalias automaticamente e sugere otimizações com impacto projetado. Vamos configurar tudo em 3 passos.',
    action: 'Começar',
  },
  {
    icon: Plug,
    iconColor: '#22C55E',
    title: 'Conecte suas plataformas',
    subtitle: 'Google Ads, Meta Ads, TikTok e LinkedIn.',
    description:
      'Conecte pelo menos uma plataforma para que o Sentinela comece a monitorar suas campanhas. Você pode conectar mais plataformas depois.',
    action: 'Ir para Integrações',
    link: '/app/integrations',
  },
  {
    icon: RefreshCw,
    iconColor: '#F59E0B',
    title: 'Sincronize seus dados',
    subtitle: 'Importe campanhas e métricas históricas.',
    description:
      'Após conectar, clique em "Sincronizar" na página de integrações. O sistema vai importar suas campanhas e detectar os primeiros alertas automaticamente.',
    action: 'Próximo',
  },
  {
    icon: Bell,
    iconColor: '#2563EB',
    title: 'Pronto para decolar 🚀',
    subtitle: 'O Sentinela está ativo.',
    description:
      'Seus alertas aparecerão em "Insights" e as otimizações sugeridas em "Otimizações". Você pode carregar dados de demonstração para ver o sistema funcionando agora mesmo.',
    action: 'Entrar no Dashboard',
  },
]

async function completeOnboarding() {
  await fetch('/api/onboarding/complete', { method: 'POST' })
}

export function OnboardingModal({ userName }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const router = useRouter()

  if (completed) return null

  const step = steps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === steps.length - 1
  const showSkip = currentStep === 1 || currentStep === 2

  async function handleAction() {
    if (isLastStep) {
      await completeOnboarding()
      setCompleted(true)
      return
    }

    if (currentStep === 1 && step.link) {
      // Step 2: navigate to integrations (don't mark completed, just navigate)
      setCurrentStep(currentStep + 1)
      router.push(step.link)
      return
    }

    setCurrentStep(currentStep + 1)
  }

  async function handleSkip() {
    await completeOnboarding()
    setCompleted(true)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#111827',
          borderRadius: '0.75rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '32rem',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Step dots */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                height: '8px',
                borderRadius: '9999px',
                transition: 'all 0.2s',
                width: i === currentStep ? '24px' : '8px',
                background: i <= currentStep ? '#2563EB' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              height: '4rem',
              width: '4rem',
              borderRadius: '9999px',
              background: `${step.iconColor}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon style={{ height: '2rem', width: '2rem', color: step.iconColor }} />
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {currentStep === 0 && userName && (
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Olá, {userName}!
            </p>
          )}
          <h2 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {step.title}
          </h2>
          <p style={{ color: step.iconColor, fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            {step.subtitle}
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6' }}>
            {step.description}
          </p>
        </div>

        {/* Progress text */}
        <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.75rem', marginBottom: '1rem' }}>
          Passo {currentStep + 1} de {steps.length}
        </p>

        {/* Action button */}
        <Button
          onClick={handleAction}
          className="w-full"
          size="lg"
          style={{ marginBottom: showSkip ? '0.75rem' : '0' }}
        >
          {isLastStep ? (
            <>
              <CheckCircle style={{ height: '1rem', width: '1rem' }} />
              {step.action}
            </>
          ) : (
            <>
              {step.action}
              <ArrowRight style={{ height: '1rem', width: '1rem' }} />
            </>
          )}
        </Button>

        {/* Skip link */}
        {showSkip && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleSkip}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0.25rem',
              }}
            >
              Pular configuração
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
