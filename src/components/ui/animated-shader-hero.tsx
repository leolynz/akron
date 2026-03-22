'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

// ─── WebGL Shader (azul royal adaptado do shader de Matthias Hurrle) ──────────
const SHADER_SRC = `#version 300 es
/**
 * Adapted from Matthias Hurrle (@atzedent)
 * Colors tuned to Akron blue (#2563EB) palette.
 */
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
    a=rnd(i),
    b=rnd(i+vec2(1,0)),
    c=rnd(i+vec2(0,1)),
    d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}

float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}

void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    /* blue/cyan palette instead of warm orange */
    col+=.00125/d*(cos(sin(i)*vec3(3,2,1))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    /* dark navy base blend */
    col=mix(col,vec3(bg*.02,bg*.05,bg*.25),d);
  }
  O=vec4(col,1);
}
`

// ─── Hook: WebGL renderer ─────────────────────────────────────────────────────
function useShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2')
    if (!gl) return

    // Vertex shader
    const vsSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`

    const vertices = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1])

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const vs = compileShader(gl.VERTEX_SHADER, vsSrc)
    const fs = compileShader(gl.FRAGMENT_SHADER, SHADER_SRC)
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(prog, 'position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uRes  = gl.getUniformLocation(prog, 'resolution')
    const uTime = gl.getUniformLocation(prog, 'time')

    const resize = () => {
      const dpr = Math.max(1, 0.5 * window.devicePixelRatio)
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const render = (now: number) => {
      gl.useProgram(prog)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, now * 1e-3)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      gl.deleteProgram(prog)
    }
  }, [])

  return canvasRef
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AnimatedShaderHero() {
  const canvasRef = useShaderBackground()

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Shader canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ background: '#0A0D1A' }}
      />

      {/* Gradient overlay — fade bottom into page bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,13,26,0.35) 0%, rgba(10,13,26,0.55) 60%, #0A0D1A 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6"
        style={{ minHeight: '100vh' }}>

        {/* Trust badge */}
        <div
          className="mb-8 flex items-center gap-2 rounded-full border px-5 py-2 text-sm backdrop-blur-sm"
          style={{
            background: 'rgba(37,99,235,0.12)',
            borderColor: 'rgba(37,99,235,0.35)',
            color: '#93C5FD',
            animation: 'fadeInDown 0.8s ease-out forwards',
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] inline-block" />
          14 dias grátis · Sem cartão de crédito
        </div>

        {/* Headline */}
        <h1
          className="mx-auto max-w-5xl text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl"
          style={{
            color: '#FFFFFF',
            animation: 'fadeInUp 0.8s ease-out 0.2s both',
          }}
        >
          Identifique problemas, aplique otimizações e monitore o impacto das suas campanhas —{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #60A5FA, #2563EB, #818CF8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              animation: 'fadeInUp 0.8s ease-out 0.2s both, gradientShift 3s ease infinite',
            }}
          >
            tudo em um lugar
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed"
          style={{
            color: 'rgba(241,245,249,0.75)',
            animation: 'fadeInUp 0.8s ease-out 0.4s both',
          }}
        >
          Plataforma de gestão de campanhas multi-canal com detecção automática de problemas,
          sugestões de otimização com impacto projetado e log auditável de ações para gestores
          de tráfego e agências.
        </p>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
        >
          <Link href="/login">
            <Button size="lg" className="gap-2 px-8 font-semibold shadow-lg shadow-blue-700/30">
              Começar 14 dias grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="px-8 backdrop-blur-sm"
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.18)',
                color: '#F1F5F9',
              }}
            >
              Ver como funciona
            </Button>
          </Link>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  )
}
