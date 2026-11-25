import { describe, it, expect } from 'vitest'
import { generarToken, hashToken, generarCodigoAcceso } from '@/server/seguridad/tokens'

describe('tokens', () => {
  it('genera token UUID v4 y su hash', () => {
    const { token, hash } = generarToken()
    expect(token).toMatch(/^[0-9a-f-]{36}$/)
    expect(hash).toHaveLength(64)                 // SHA-256 hex
    expect(hash).toBe(hashToken(token))           // determinista
  })

  it('tokens distintos producen hashes distintos', () => {
    const { hash: h1 } = generarToken()
    const { hash: h2 } = generarToken()
    expect(h1).not.toBe(h2)
  })

  it('codigo de acceso tiene 6 caracteres alfanumericos en mayuscula', () => {
    const codigo = generarCodigoAcceso()
    expect(codigo).toHaveLength(6)
    expect(codigo).toMatch(/^[A-Z2-9]{6}$/)
  })

  it('codigos distintos en llamadas consecutivas', () => {
    const codigos = new Set(Array.from({ length: 50 }, () => generarCodigoAcceso()))
    expect(codigos.size).toBeGreaterThan(40)      // very unlikely to have >10 collisions
  })
})
