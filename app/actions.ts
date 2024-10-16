'use server'

import { ComfyResponse } from '@/lib/types'
import workflow from '@/workflow-sd1.5.json'
import axios from 'axios'

export async function queuePrompt(prompt: string, clientId: string) {
  workflow['6']['inputs']['text'] = prompt
  workflow['3']['inputs']['seed'] = Math.random() * 1000
  try {
    const res = await axios.post<ComfyResponse>(
      `http://${process.env.NEXT_PUBLIC_COMFY_SERVER_URL}/prompt`,
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
