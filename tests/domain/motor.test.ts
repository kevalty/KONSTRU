import { describe, it, expect } from 'vitest'
import { calcular } from '@/domain/calculo/motor'
import type { Receta } from '@/domain/calculo/tipos-receta'
import type { Medidas, Ubicacion } from '@/domain/compartido/tipos'

const recetaTest: Receta = {
  id: 'test-piso',
  nombre: 'Piso cerámica test',
  version: 1,
  tipo_trabajo: 'piso',
  items: [
    {
      producto_categoria: 'ceramica_piso',
      formula: 'area * 1.1',
      unidad: 'm2',
      desperdicio: 0.1,
      gama: ['economica', 'media', 'premium'],
    },
    {
      producto_categoria: 'pegante_ceramica',
      formula: 'area / 5',
      unidad: 'bolsa',
      desperdicio: 0.05,
      gama: ['economica', 'media', 'premium'],
    },
    {
      producto_categoria: 'parquet_exclusivo',
      formula: 'area',
      unidad: 'm2',
      desperdicio: 0.08,
      gama: ['premium'],
    },
  ],
}

const medidas: Medidas = { largo: 5, ancho: 4 }  // area = 20m²
const ubicacionCosta: Ubicacion = { provincia: 'Guayas', zona: 'costa', altitud: 'bajo' }
const ubicacionSierra: Ubicacion = { provincia: 'Pichincha', zona: 'sierra', altitud: 'alto' }

describe('motor de calculo', () => {
  it('calcula ceramica economica correctamente', () => {
    const resultado = calcular(recetaTest, medidas, ubicacionCosta, 'economica')
    const ceramica = resultado.items.find(i => i.producto_categoria === 'ceramica_piso')
    expect(ceramica).toBeDefined()
    // 20 * 1.1 (formula) * 1.1 (desperdicio) = 24.2, rounded to 24.5 (m2 to 0.5)
    expect(ceramica!.cantidad).toBe(24.5)
  })

  it('excluye items de gama incorrecta', () => {
    const resultado = calcular(recetaTest, medidas, ubicacionCosta, 'economica')
    const parquet = resultado.items.find(i => i.producto_categoria === 'parquet_exclusivo')
    expect(parquet).toBeUndefined()
  })

  it('incluye items premium en gama premium', () => {
    const resultado = calcular(recetaTest, medidas, ubicacionCosta, 'premium')
    const parquet = resultado.items.find(i => i.producto_categoria === 'parquet_exclusivo')
    expect(parquet).toBeDefined()
  })

  it('incluye notas climaticas', () => {
    const resultado = calcular(recetaTest, medidas, ubicacionCosta, 'media')
    expect(resultado.notas_climaticas.length).toBeGreaterThan(0)
  })

  it('agrega nota de sierra alta', () => {
    const resultado = calcular(recetaTest, medidas, ubicacionSierra, 'media')
    expect(resultado.notas_climaticas.some(n => n.toLowerCase().includes('alta') || n.toLowerCase().includes('termico'))).toBe(true)
  })

  it('usa area provista directamente', () => {
    const resultado = calcular(recetaTest, { area: 30 }, ubicacionCosta, 'economica')
    const ceramica = resultado.items.find(i => i.producto_categoria === 'ceramica_piso')
    // 30 * 1.1 * 1.1 = 36.3, rounded up to 36.5
    expect(ceramica!.cantidad).toBe(36.5)
  })
})
