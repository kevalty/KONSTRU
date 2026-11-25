// In-memory rate limiter — replace with Redis for multi-instance deployments
// shortcut: in-memory, resets on server restart; use Redis when scaling

const conteos = new Map<string, { count: number; resetAt: number }>()

export function verificarRateLimit(
  clave: string,
  maxPorHora: number,
): { permitido: boolean; restante: number } {
  const ahora = Date.now()
  const ventana = 60 * 60 * 1000  // 1 hour

  const entrada = conteos.get(clave)
  if (!entrada || ahora > entrada.resetAt) {
    conteos.set(clave, { count: 1, resetAt: ahora + ventana })
    return { permitido: true, restante: maxPorHora - 1 }
  }

  if (entrada.count >= maxPorHora) {
    return { permitido: false, restante: 0 }
  }

  entrada.count++
  return { permitido: true, restante: maxPorHora - entrada.count }
}
