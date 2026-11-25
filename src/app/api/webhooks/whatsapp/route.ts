import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { config } from '@/lib/config'

// WhatsApp Cloud API webhook verification + incoming message handler
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === config.whatsappVerifyToken) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify signature
    const signature = req.headers.get('x-hub-signature-256') ?? ''
    const body = await req.text()

    if (config.whatsappMode === 'real' && config.whatsappAppSecret) {
      const expected = 'sha256=' + createHmac('sha256', config.whatsappAppSecret).update(body).digest('hex')
      if (signature !== expected) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    }

    const payload = JSON.parse(body) as Record<string, unknown>

    // Log incoming messages — processing is handled out-of-band
    // In a production system, enqueue these for the advisor panel
    console.log('[WhatsApp webhook]', JSON.stringify(payload, null, 2))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[/api/webhooks/whatsapp]', error)
    return NextResponse.json({ ok: false }, { status: 200 }) // Always 200 to WhatsApp
  }
}
