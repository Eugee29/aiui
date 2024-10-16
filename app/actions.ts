'use server'

import { COMFY_SERVER_URL } from '@/lib/constants'
import { ComfyResponse } from '@/lib/types'
import workflow from '@/workflow-flux.json'
import axios from 'axios'

export async function queuePrompt(prompt: string, clientId: string) {
  workflow['62']['inputs']['text'] = prompt
  workflow['22']['inputs']['noise_seed'] = Math.random() * 1000
  try {
    const res = await axios.post<ComfyResponse>(
      `http://${COMFY_SERVER_URL}/prompt`,
      {
        prompt: workflow,
        client_id: clientId,
      }
    )
    return res.data
  } catch (error) {
    console.error('Error queuing prompt:', error)
    throw new Error('Failed to queue prompt')
  }
}
