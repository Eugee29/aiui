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
import { clientId } from '@/lib/constants'
import { GenerationEvent } from '@/lib/definitions'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FormSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Please enter a prompt',
  }),
})

export default function GenerateForm() {
  const [output, setOutput] = useState('')
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: '',
    },
  })

  useEffect(() => {
    const eventSource = new EventSource(`/api/progress/${clientId}`)
    eventSource.onmessage = (event) => {
      const progressEvent: GenerationEvent = JSON.parse(event.data)
      if (progressEvent.type === 'preview') {
        setOutput(progressEvent.data)
      }
    }
  }, [])

  async function onSubmit(values: z.infer<typeof FormSchema>) {
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
          priority
          quality={100}
          src={output}
          alt="output"
          width={0}
          height={0}
          sizes="100vw"
          className="size-[768px] object-contain"
        />
      )}
    </>
  )
}
