import { describe, it, expect } from 'vitest'
import { zonaDeProvinciaString, altitudDeCiudad } from '@/domain/clima/provincias'
import { reglasParaZona } from '@/domain/clima/reglas'

describe('zonaDeProvinciaString', () => {
  it('clasifica provincias costeras', () => {
    expect(zonaDeProvinciaString('Guayas')).toBe('costa')
    expect(zonaDeProvinciaString('Manabí')).toBe('costa')
    expect(zonaDeProvinciaString('Esmeraldas')).toBe('costa')
  })

  it('clasifica provincias serranas', () => {
    expect(zonaDeProvinciaString('Pichincha')).toBe('sierra')
    expect(zonaDeProvinciaString('Azuay')).toBe('sierra')
    expect(zonaDeProvinciaString('Chimborazo')).toBe('sierra')
  })

  it('clasifica provincias del oriente', () => {
    expect(zonaDeProvinciaString('Napo')).toBe('oriente')
    expect(zonaDeProvinciaString('Pastaza')).toBe('oriente')
  })

  it('es insensible a mayúsculas y tildes', () => {
    expect(zonaDeProvinciaString('pichincha')).toBe('sierra')
    expect(zonaDeProvinciaString('GUAYAS')).toBe('costa')
  })

  it('lanza para provincia desconocida', () => {
    expect(() => zonaDeProvinciaString('Unknownville')).toThrow()
  })
})

describe('altitudDeCiudad', () => {
  it('clasifica ciudades de altura conocidas', () => {
    expect(altitudDeCiudad('Quito')).toBe('alto')
    expect(altitudDeCiudad('Riobamba')).toBe('alto')
  })

  it('retorna bajo por defecto para ciudades desconocidas', () => {
    expect(altitudDeCiudad('Guayaquil')).toBe('bajo')
    expect(altitudDeCiudad('Cuidad Desconocida')).toBe('bajo')
  })
})

describe('reglasParaZona', () => {
  it('devuelve reglas para costa', () => {
    const reglas = reglasParaZona({ provincia: 'Guayas', zona: 'costa', altitud: 'bajo' })
    expect(reglas.length).toBeGreaterThan(0)
    expect(reglas.some(r => r.nota.toLowerCase().includes('cost'))).toBe(true)
  })

  it('agrega regla extra para sierra alta', () => {
    const base = reglasParaZona({ provincia: 'Pichincha', zona: 'sierra', altitud: 'medio' })
    const alto = reglasParaZona({ provincia: 'Pichincha', zona: 'sierra', altitud: 'alto' })
    expect(alto.length).toBeGreaterThan(base.length)
  })
})
