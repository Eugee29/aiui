import { z } from 'zod'

export const FormSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Please enter a prompt',
  }),
  batchSize: z.coerce
    .number()
    .min(1, {
      message: 'Batch size must be at least 1',
    })
    .max(4, {
      message: 'Batch size must be at most 4',
    }),
})
