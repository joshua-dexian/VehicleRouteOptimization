
import React, { useState, useEffect } from 'react'

interface TypeWriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

export function TypeWriter({ text, speed = 25, delay = 0, className = "" }: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, index + 1))
        setIndex(index + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [index, text, speed, started])

  return <span className={className}>{displayedText}</span>
}
