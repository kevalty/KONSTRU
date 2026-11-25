import { z } from 'zod'

const schema = z.object({
  supabaseUrl: z.string().url(),
  supabaseAnonKey: z.string().min(1),
  supabaseServiceRoleKey: z.string().min(1),
  anthropicApiKey: z.string().min(1),
  chatModel: z.string().default('claude-sonnet-4-6'),
  whatsappMode: z.enum(['simulado', 'real']).default('simulado'),
  whatsappToken: z.string().default(''),
  whatsappPhoneNumberId: z.string().default(''),
  whatsappAppSecret: z.string().default(''),
  whatsappVerifyToken: z.string().default(''),
  appUrl: z.string().url().default('http://localhost:3000'),
  ivaPorcentaje: z.coerce.number().default(0.15),
  cotizacionValidezDias: z.coerce.number().int().default(7),
})

function cargarConfig() {
  const result = schema.safeParse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    chatModel: process.env.CHAT_MODEL,
    whatsappMode: process.env.WHATSAPP_MODE,
    whatsappToken: process.env.WHATSAPP_TOKEN,
    whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    whatsappAppSecret: process.env.WHATSAPP_APP_SECRET,
    whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appUrl: process.env.APP_URL,
    ivaPorcentaje: process.env.IVA_PORCENTAJE,
    cotizacionValidezDias: process.env.COTIZACION_VALIDEZ_DIAS,
  })
  if (!result.success) {
    // Only throw in server context (not during static generation of public pages)
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      throw new Error('Configuracion invalida: ' + result.error.message)
    }
    return schema.parse({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'anon',
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'service',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? 'sk-ant-placeholder',
      chatModel: process.env.CHAT_MODEL,
      whatsappMode: process.env.WHATSAPP_MODE,
      whatsappToken: process.env.WHATSAPP_TOKEN,
      whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      whatsappAppSecret: process.env.WHATSAPP_APP_SECRET,
      whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
      appUrl: process.env.APP_URL,
      ivaPorcentaje: process.env.IVA_PORCENTAJE,
      cotizacionValidezDias: process.env.COTIZACION_VALIDEZ_DIAS,
    })
  }
  return result.data
}

export const config = cargarConfig()
