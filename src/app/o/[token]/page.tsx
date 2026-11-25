export const dynamic = 'force-dynamic'

import { obtenerPedidoPorToken, listarItemsPedido } from '@/server/db/repositorios'
import { notFound } from 'next/navigation'
import { VistaOrden } from '@/components/orden/VistaOrden'

export default async function PaginaOrden({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let pedido
  try {
    pedido = await obtenerPedidoPorToken(token)
  } catch {
    notFound()
  }

  const items = await listarItemsPedido(pedido.id)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <h1 className="font-bold text-slate-800">Pedido <span className="text-emerald-600">{pedido.codigo_acceso}</span></h1>
        <p className="text-sm text-slate-500">Marque cada artículo y envíe la lista completa</p>
      </header>
      <VistaOrden pedidoId={pedido.id} items={items} estadoPedido={pedido.estado} />
    </main>
  )
}
