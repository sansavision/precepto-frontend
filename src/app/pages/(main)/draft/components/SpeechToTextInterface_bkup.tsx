'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatTime } from '@/lib/utils/recorder-helper'
import { Mic, Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react'
import WaveSurfer  from 'wavesurfer.js'
//import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js'

interface SpeechToTextInterfaceProps {
    draftId: string
}

const SpeechToTextInterface: React.FC<SpeechToTextInterfaceProps> = ({ draftId }) => {
    console.info('studioId', draftId)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const record = useRef<RecordPlugin | null>(null)

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgb(200, 0, 200)',
        progressColor: 'rgb(100, 0, 100)',
        cursorColor: 'navy',
        barWidth: 2,
        barRadius: 3,
        height: 100,
      })

      record.current = wavesurfer.current.registerPlugin(
        RecordPlugin.create({
          renderRecordedAudio: false,
          scrollingWaveform: true,
        }) as RecordPlugin
      )

      wavesurfer.current.on('ready', () => {
        setDuration(wavesurfer.current?.getDuration() ?? 0)
      })

      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current?.getCurrentTime() ?? 0)
      })

      record.current.on('record-progress', (time: number) => {
        setRecordingTime(time / 1000) // Convert milliseconds to seconds
      })

      record.current.on('record-end', (blob: Blob) => {
        wavesurfer.current?.loadBlob(blob)
      })

      return () => wavesurfer.current?.destroy()
    }
  }, [])

  const handleRecordToggle = async () => {
    if (isRecording) {
      record.current?.stopRecording()
      setIsRecording(false)
      setIsPaused(false)
    } else {
      try {
        await record.current?.startRecording()
        setIsRecording(true)
        setRecordingTime(0)
      } catch (error) {
        console.error('Error starting recording:', error)
      }
    }
  }

  const handlePauseResume = () => {
    if (isPaused) {
      record.current?.resumeRecording()
      setIsPaused(false)
    } else {
      record.current?.pauseRecording()
      setIsPaused(true)
    }
  }

  const handlePlayPause = () => {
    wavesurfer.current?.playPause()
  }

  const handleSkip = (seconds: number) => {
    if (wavesurfer.current) {
      const newTime = Math.max(0, Math.min(wavesurfer.current.getCurrentTime() + seconds, duration))
      wavesurfer.current.seekTo(newTime / duration)
      setCurrentTime(newTime)
    }
  }

  const handleScrub = (value: number[]) => {
    if (wavesurfer.current) {
      const newTime = (value[0] / 100) * duration
      wavesurfer.current.seekTo(newTime / duration)
      setCurrentTime(newTime)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
      <div ref={waveformRef} className="w-full h-32 mb-4" />
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">
          {isRecording ? formatTime(recordingTime) : formatTime(currentTime)}
        </span>
        <Slider
          value={[isRecording ? 0 : (currentTime / Math.max(duration, 1) * 100)]}
          onValueChange={handleScrub}
          max={100}
          step={0.1}
          className="w-full mx-4"
          disabled={isRecording}
        />
        <span className="text-sm">{formatTime(duration)}</span>
      </div>
      <div className="flex justify-center space-x-4">
        <Button onClick={() => handleSkip(-5)} size="icon" variant="outline" disabled={isRecording}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleSkip(-2)} size="icon" variant="outline" disabled={isRecording}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button onClick={handlePlayPause} size="icon" disabled={isRecording}>
          {wavesurfer.current?.isPlaying() ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button onClick={handleRecordToggle} size="icon" variant={isRecording ? "destructive" : "default"}>
          <Mic className="h-4 w-4" />
        </Button>
        {isRecording && (
          <Button onClick={handlePauseResume} size="icon" variant="outline">
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        )}
        <Button onClick={() => handleSkip(2)} size="icon" variant="outline" disabled={isRecording}>
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleSkip(5)} size="icon" variant="outline" disabled={isRecording}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default SpeechToTextInterface

