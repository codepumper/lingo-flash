"use client"

import { useEffect, useRef } from "react"

type DataPoint = {
  value: number,
  day: string
}

type StatsChartProps = {
  data: DataPoint[]
}

export default function StatsChart({ data }: StatsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const ctx = canvasRef.current.getContext("2d")
    const canvas = canvasRef.current

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Chart dimensions
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Find max value for scaling
    const maxValue = Math.max(...data.map((d) => d.value), 10)

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Draw bars
    const barWidth = (chartWidth / data.length) * 0.6
    const barSpacing = (chartWidth / data.length) * 0.4

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2
      const y = canvas.height - padding - barHeight

      // Draw bar
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw day label
      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.day, x + barWidth / 2, canvas.height - padding + 20)

      // Draw value on top of bar
      ctx.fillStyle = "#1e293b"
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 10)
    })
  }, [data])

  // Default data if none provided
  const defaultData = data.length
    ? data
    : [
        { day: "Mon", value: 0 },
        { day: "Tue", value: 0 },
        { day: "Wed", value: 0 },
        { day: "Thu", value: 0 },
        { day: "Fri", value: 0 },
        { day: "Sat", value: 0 },
        { day: "Sun", value: 0 },
      ]

  return (
    <div className="w-full h-[300px] relative">
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No data available yet</p>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
