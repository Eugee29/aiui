export type ComfyResponse = {
  prompt_id: string
  number: number
  node_errors: unknown
}

export type GenerationEvent =
  | { type: 'progress'; data: number }
  | { type: 'preview'; data: string }
