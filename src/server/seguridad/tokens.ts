import { createHash, randomBytes } from 'crypto'
import { v4 as uuidv4 } from 'uuid'

export function generarToken(): { token: string; hash: string } {
  const token = uuidv4()
  const hash = hashToken(token)
  return { token, hash }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generarCodigoAcceso(): string {
  // 6-character alphanumeric code (uppercase, no ambiguous chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(randomBytes(6)).map(b => chars[b % chars.length]).join('')
}
