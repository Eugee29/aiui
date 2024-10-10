'use client'

import { queuePrompt } from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const FormSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Please enter a prompt',
  }),
})

export default function GenerateForm() {
  const clientId = useRef(uuidv4())
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: '',
    },
  })

  useEffect(() => {
    const ws = new WebSocket(
      `ws://${process.env.NEXT_PUBLIC_COMFY_SERVER_URL}/ws?clientId=${clientId.current}`
    )
    ws.onopen = () => {
      ws.onmessage = ({ data }) => {
        const parsedData = JSON.parse(data)
        if (parsedData.type === 'progress') {
          console.log(`${parsedData.data.value}/${parsedData.data.max}`)
        }
      }
    }
  }, [])

  function onSubmit(values: z.infer<typeof FormSchema>) {
    queuePrompt(values.prompt, clientId.current)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="self-center p-4 border bg-card rounded-b w-96 space-y-4"
      >
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A cat in a hat eating a cookie"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Generate
        </Button>
      </form>
    </Form>
  )
}
