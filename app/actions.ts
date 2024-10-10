'use server'

import { ComfyResponse } from '@/lib/types'
import workflow from '@/workflow.json'
import axios from 'axios'
import { z } from 'zod'

export const generateFormSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Please enter a prompt',
  }),
})

export async function queuePrompt(prompt: string, clientId: string) {
  const validatedFields = generateFormSchema.safeParse({ prompt })

  if (!validatedFields.success) {
    throw new Error('Invalid fields')
  }

  workflow['62']['inputs']['text'] = prompt
  try {
    await axios.post<ComfyResponse>(
      `http://${process.env.COMFY_SERVER_URL}/prompt`,
      {
        prompt: workflow,
        client_id: clientId,
      }
    )

    await axios.get(`http://${process.env.COMFY_SERVER_URL}/view`, {})
  } catch (error) {
    console.error('Error queuing prompt:', error)
    throw new Error('Failed to queue prompt')
  }
}
