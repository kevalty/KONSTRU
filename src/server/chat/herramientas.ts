import type Anthropic from '@anthropic-ai/sdk'

// Tool definitions for the chatbot — Claude calls these to persist conversation state
export const HERRAMIENTAS: Anthropic.Tool[] = [
  {
    name: 'registrar_trabajo',
    description: 'Registra el tipo de trabajo de construccion o remodelacion que necesita el cliente.',
    input_schema: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          enum: ['piso', 'paredes', 'bano', 'techo', 'fachada', 'impermeabilizacion'],
          description: 'Tipo de trabajo',
        },
        descripcion: {
          type: 'string',
          description: 'Descripcion libre del trabajo tal como lo describio el cliente',
        },
      },
      required: ['tipo'],
    },
  },
  {
    name: 'agregar_medida',
    description: 'Registra una medida del espacio a trabajar.',
    input_schema: {
      type: 'object',
      properties: {
        largo: { type: 'number', description: 'Largo en metros' },
        ancho: { type: 'number', description: 'Ancho en metros' },
        alto: { type: 'number', description: 'Alto o altura en metros' },
        area: { type: 'number', description: 'Area en metros cuadrados (si el cliente la da directo)' },
        perimetro: { type: 'number', description: 'Perimetro en metros' },
        volumen: { type: 'number', description: 'Volumen en metros cubicos' },
        notas: { type: 'string', description: 'Notas adicionales sobre las medidas' },
      },
    },
  },
  {
    name: 'registrar_ubicacion',
    description: 'Registra la ubicacion del proyecto para ajustar materiales segun el clima.',
    input_schema: {
      type: 'object',
      properties: {
        provincia: {
          type: 'string',
          description: 'Provincia de Ecuador',
        },
        ciudad: {
          type: 'string',
          description: 'Ciudad o canton (opcional)',
        },
      },
      required: ['provincia'],
    },
  },
  {
    name: 'confirmar_solicitud',
    description: 'El cliente ha confirmado todos los datos. Guarda la solicitud y genera las cotizaciones.',
    input_schema: {
      type: 'object',
      properties: {
        resumen: {
          type: 'string',
          description: 'Resumen de lo que va a cotizar, tal como se lo explico al cliente',
        },
      },
      required: ['resumen'],
    },
  },
]
