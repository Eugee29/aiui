import { clientId, COMFY_SERVER_URL } from '@/lib/constants'
import { GenerationEvent } from '@/lib/definitions'
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

        ws.on('message', (data, isBinary) => {
          let progressEvent: GenerationEvent | null = null

          if (isBinary) {
            progressEvent = {
              type: 'preview',
              data: `data:image/png;base64,${(data.slice(8) as Buffer).toString(
                'base64'
              )}`,
            }
          } else {
            const parsedData = JSON.parse(data.toString())

            switch (parsedData.type) {
              case 'progress':
                progressEvent = {
                  type: 'progress',
                  data: Math.round(
                    (parsedData.data.value / parsedData.data.max) * 100
                  ),
                }
                break
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

          if (progressEvent) {
            const message = `data: ${JSON.stringify(progressEvent)}\n\n`
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
