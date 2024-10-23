import { clientId, COMFY_SERVER_URL, workflow } from '@/lib/constants'
import { GenerationEvent } from '@/lib/definitions'
import axios from 'axios'
import { NextResponse } from 'next/server'
import WebSocket from 'ws'

export async function GET() {
  const ws = new WebSocket(`ws://${COMFY_SERVER_URL}/ws?clientId=${clientId}`)

  ws.on('error', (error) => {
    console.error('A WebSocket error occurred:', error)
    ws.close()
  })

  return new NextResponse(
    new ReadableStream({
      start: async (controller) => {
        const encoder = new TextEncoder()

        ws.on('message', async (data, isBinary) => {
          let generationEvent: GenerationEvent | null = null

          if (isBinary) {
            generationEvent = {
              type: 'preview',
              data: `data:image/png;base64,${(data.slice(8) as Buffer).toString(
                'base64'
              )}`,
            }
          } else {
            const parsedData = JSON.parse(data.toString())

            switch (parsedData.type) {
              case 'progress':
                generationEvent = {
                  type: 'progress',
                  data: Math.round(
                    (parsedData.data.value / parsedData.data.max) * 100
                  ),
                }
                break
              case 'execution_start':
                const res = await axios.get(`http://${COMFY_SERVER_URL}/queue`)
                const queues = res.data
                const currentJob = queues.queue_running[0]
                const jobId = currentJob[1]
                const currentWorkflow: typeof workflow = currentJob[2]
                generationEvent = {
                  type: 'execution-start',
                  data: {
                    id: jobId,
                    prompt: currentWorkflow[6].inputs.text,
                    batchSize: currentWorkflow[135].inputs.batch_size,
                  },
                }
            }
          }

          if (process.env.NODE_ENV === 'development') {
            const debugData: GenerationEvent = {
              type: 'debug',
              data: isBinary ? data : JSON.parse(data.toString()),
            }
            const message = `data: ${JSON.stringify(debugData)}\n\n`
            controller.enqueue(encoder.encode(message))
          }

          if (generationEvent) {
            const message = `data: ${JSON.stringify(generationEvent)}\n\n`
            controller.enqueue(encoder.encode(message))
          }
        })
      },
      cancel: () => {
        ws.close()
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    }
  )
}
