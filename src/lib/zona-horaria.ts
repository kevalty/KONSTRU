const ZONA = 'America/Guayaquil'

export function ahoraEC(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: ZONA }))
}

export function formatearFechaEC(fecha: Date): string {
  return fecha.toLocaleDateString('es-EC', {
    timeZone: ZONA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatearFechaHoraEC(fecha: Date): string {
  return fecha.toLocaleString('es-EC', {
    timeZone: ZONA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
