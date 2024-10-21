export type ComfyResponse = {
  prompt_id: string
  number: number
  node_errors: unknown
}

export type GenerationEvent =
  | {
      type: 'execution-start'
      data: { id: string; batchSize: number; prompt: string }
    }
  | { type: 'progress'; data: number }
  | { type: 'preview'; data: string }
  | { type: 'debug'; data: unknown }
