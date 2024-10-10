'use server'

import { ComfyResponse } from '@/lib/types'
import workflow from '@/workflow.json'
import axios from 'axios'

export async function queuePrompt(prompt: string, clientId: string) {
  workflow['62']['inputs']['text'] = prompt
  try {
    await axios.post<ComfyResponse>(
      `http://${process.env.NEXT_PUBLIC_COMFY_SERVER_URL}/prompt`,
      {
        prompt: workflow,
        client_id: clientId,
      }
    )
  } catch (error) {
    console.error('Error queuing prompt:', error)
    throw new Error('Failed to queue prompt')
  }
}
