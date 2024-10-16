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
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const FormSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Please enter a prompt',
  }),
})

export default function GenerateForm() {
  const { current: clientId } = useRef(uuidv4())
  const [output, setOutput] = useState('')
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: '',
    },
  })

  useEffect(() => {
    const ws = new WebSocket(
      `ws://${process.env.NEXT_PUBLIC_COMFY_SERVER_URL}/ws?clientId=${clientId}`
    )

    const reader = new FileReader()

    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result !== 'string') return
      setOutput(result)
    }

    ws.onopen = () => {
      console.log('WebSocket connection established')
    }

    ws.onmessage = async ({ data }) => {
      if (data instanceof Blob) {
        reader.readAsDataURL(data.slice(8))
      } else {
        const parsedData = JSON.parse(data)
        if (parsedData.type === 'progress') {
          console.log(`${parsedData.data.value}/${parsedData.data.max}`)
        }
      }
    }

    return () => ws.close()
  }, [clientId])

  function onSubmit(values: z.infer<typeof FormSchema>) {
    queuePrompt(values.prompt, clientId)
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="self-center p-4 border bg-card rounded w-96 space-y-4"
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
      {output && (
        <Image
          src={output}
          alt="output"
          width={512}
          height={512}
          className="size-[512px]"
        />
      )}
    </>
  )
}
