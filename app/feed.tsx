'use client'

import { GenerationEvent } from '@/lib/definitions'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Feed() {
  const [outputs, setsOutputs] = useState<string[]>([])
  const [batchSize, setBatchSize] = useState(0)

  useEffect(() => {
    const eventSource = new EventSource('/api/generation-events/')
    eventSource.onmessage = (event) => {
      const generationEvent: GenerationEvent = JSON.parse(event.data)
      if (generationEvent.type === 'debug') {
        console.log(generationEvent.data)
      }

      if (generationEvent.type === 'execution-start') {
        setBatchSize(generationEvent.data.batchSize)
      }

      if (generationEvent.type === 'preview') {
        // TODO...
        setsOutputs([])
      }
    }
  }, [, batchSize, outputs])

  return (
    <div className="grid gap-4 grid-cols-4">
      {outputs.map((output, i) => (
        <Image
          key={i}
          priority
          quality={100}
          src={output}
          alt="output"
          width={0}
          height={0}
          sizes="100vw"
          className="size-[768px] object-contain"
        />
      ))}
    </div>
  )
}
