export class ErrorDominio extends Error {
  constructor(
    message: string,
    public readonly codigo: string,
  ) {
    super(message)
    this.name = 'ErrorDominio'
  }
}

export class ErrorValidacion extends ErrorDominio {
  constructor(message: string) {
    super(message, 'VALIDACION')
    this.name = 'ErrorValidacion'
  }
}

export class ErrorNoEncontrado extends ErrorDominio {
  constructor(recurso: string) {
    super(`${recurso} no encontrado`, 'NO_ENCONTRADO')
    this.name = 'ErrorNoEncontrado'
  }
}

export function mensajeSeguro(error: unknown): string {
  if (error instanceof ErrorDominio) return error.message
  return 'Ocurrio un error. Por favor intenta de nuevo.'
}
