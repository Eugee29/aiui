'use server'

import { clientId, COMFY_SERVER_URL, workflow } from '@/lib/constants'
import { ComfyResponse } from '@/lib/definitions'
import { FormSchema } from '@/lib/schemas'
import axios from 'axios'
import { z } from 'zod'

export async function queuePrompt(params: z.infer<typeof FormSchema>) {
  // workflow['6']['inputs']['text'] = params.prompt
  // workflow['135']['inputs']['batch_size'] = params.batchSize
  // workflow['294']['inputs']['seed'] = Math.random() * 1000

  workflow['6']['inputs']['text'] = params.prompt
  workflow['5']['inputs']['batch_size'] = params.batchSize
  workflow['KSampler']['inputs']['seed'] = Math.random() * 1000

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
