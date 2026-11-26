import type OpenAI from 'openai'

// Tool definitions in OpenAI format (compatible with OpenRouter)
export const HERRAMIENTAS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'registrar_trabajo',
      description: 'Registra el tipo de trabajo de construccion o remodelacion que necesita el cliente.',
      parameters: {
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
  },
  {
    type: 'function',
    function: {
      name: 'agregar_medida',
      description: 'Registra una medida del espacio a trabajar.',
      parameters: {
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
  },
  {
    type: 'function',
    function: {
      name: 'registrar_ubicacion',
      description: 'Registra la ubicacion del proyecto para ajustar materiales segun el clima.',
      parameters: {
        type: 'object',
        properties: {
          provincia: { type: 'string', description: 'Provincia de Ecuador' },
          ciudad: { type: 'string', description: 'Ciudad o canton (opcional)' },
        },
        required: ['provincia'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'confirmar_solicitud',
      description: 'El cliente ha confirmado todos los datos. Guarda la solicitud y genera las cotizaciones.',
      parameters: {
        type: 'object',
        properties: {
          resumen: {
            type: 'string',
            description: 'Resumen de lo que va a cotizar, tal como se lo explico al cliente',
          },
          numero_telefono: {
            type: 'string',
            description: 'Numero de WhatsApp del cliente para enviarle las cotizaciones (ej: 0991234567)',
          },
        },
        required: ['resumen'],
      },
    },
  },
]
