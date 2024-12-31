import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
// import type { Region } from '@/lib/types/region.types' // or remove if you have no Region
import {
  Mic, Play, Pause, StopCircle, RotateCcw, RotateCw, SkipBack, SkipForward,
  Scissors, Plus, Trash2, Check, Edit2, Save
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command'

import { useTemplates } from '@/hooks/use-templates'
import { useTranscriptions } from '@/hooks/use-transcriptions'
import { useAudioSyncManager } from '@/hooks/use-audio-sync'
import { formatTime } from '@/lib/utils/recorder-helper'
import type { TranscriptionMeta } from '@/lib/types/transcript.types'

interface SpeechToTextInterfaceProps {
  draftId: string
}

const SpeechToTextInterface: React.FC<SpeechToTextInterfaceProps> = ({ draftId }) => {
  // ---- States for recording & playback
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // ---- Time states
  const [currentTime, setCurrentTime] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const accumulatedTimeRef = useRef(0) // total length of all previous snippets

  // We'll store a reference to the user’s microphone stream & MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // ---- For naming transcription
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState('')

  // ---- If you want region-based editing, we still keep a "selectedRegion"
//   const [selectedRegion, _setSelectedRegion] = useState<Region | null>(null)
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const [selectedRegion, _setSelectedRegion] = useState<any>(null)

  // ---- Our combined audio element reference (for playback)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ---- Hooks for backend data
  const { updateTranscription, deleteTranscription, transcriptions } = useTranscriptions()
  const { templates } = useTemplates()
  const { chunks, addChunk, applyEdit, syncFromBackend } = useAudioSyncManager(draftId)

  // Find the transcription we’re editing
  const selectedTranscription = useMemo(
    () => transcriptions?.find((t) => t.id === draftId),
    [transcriptions, draftId]
  )

  // ---- Combine all chunks so we can play them in a single <audio> tag
  const combinedBlob = useMemo(() => {
    if (chunks.length === 0) return null
    return new Blob(chunks.map(c => c.data), { type: 'audio/webm' })
  }, [chunks])

  // Whenever combinedBlob changes, create an object URL for playback
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!combinedBlob) {
      setAudioUrl(null)
      return
    }
    const url = URL.createObjectURL(combinedBlob)
    setAudioUrl(url)
    // cleanup old object URLs
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [combinedBlob])

  // Keep the transcription name in sync
  useEffect(() => {
    if (selectedTranscription) {
      setName(selectedTranscription.name)
    }
  }, [selectedTranscription])

  // ================
  // Record start/stop
  // ================
  const handleRecordToggle = useCallback(async () => {
    if (!isRecording) {
      // Start recording
      console.info('Starting recording...')
      setIsRecording(true)
      setRecordingTime(0)

      try {
        // Ask for mic permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        // Create MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm; codecs=opus'
          // you can do 'audio/wav' if supported
        })
        mediaRecorderRef.current = mediaRecorder

        const tempChunks: BlobPart[] = []

        // Called ~every chunk of data
        mediaRecorder.ondataavailable = (e) => {
            console.log('MediaRecorder ondataavailable ', e.data)
          if (e.data.size > 0) {
            console.log('MediaRecorder ondataavailable => adding chunk')
            tempChunks.push(e.data)
          }
        }

        // Called when we fully stop
        mediaRecorder.onstop = () => {
          console.info('MediaRecorder onstop => building final Blob, tempChunks',tempChunks)
          const finalBlob = new Blob(tempChunks, { type: 'audio/webm' })
            console.log('MediaRecorder onstop => finalBlob',finalBlob)
          // snippet length is "recordingTime" in seconds
          const startTime = accumulatedTimeRef.current
          const endTime = accumulatedTimeRef.current + recordingTime
          accumulatedTimeRef.current = endTime

          console.info(`Adding chunk from ${startTime} to ${endTime}`)
          addChunk(finalBlob, startTime, endTime)

          // Release mic
          // biome-ignore lint/complexity/noForEach: <explanation>
                    stream.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        // (Optional) track real-time
        const startTimestamp = performance.now()
        const updateInterval = setInterval(() => {
          if (mediaRecorder.state !== 'recording') {
            clearInterval(updateInterval)
            return
          }
          const elapsedMs = performance.now() - startTimestamp
          setRecordingTime(elapsedMs / 1000)
        }, 200)

        mediaRecorder.start()
      } catch (err) {
        console.error('Could not start recording:', err)
        setIsRecording(false)
      }
    } else {
      // Stop recording
      console.info('Stopping recording...')
      setIsRecording(false)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      // mediaRecorderRef.current = null
    }
  }, [isRecording, addChunk, recordingTime])

  // ================
  // Playback
  // ================
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !audioUrl) return
    if (audioRef.current.paused) {
      audioRef.current.play().catch(console.error)
      setIsPlaying(true)
      // Also watch for “timeupdate” if you want to track currentTime
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [audioUrl])

  // ================
  // Skip forward/back
  // ================
  const handleSkip = useCallback((seconds: number) => {
    if (!audioRef.current) return
    const newTime = Math.max(0, audioRef.current.currentTime + seconds)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }, [])

  // (If you want a “pause” button mid-recording, that would be separate.)

  // ================
  // Insert / Replace / Delete
  // ================
  const handleInsert = useCallback(() => {
    console.log('Insert snippet at region', selectedRegion)
    // Without wave, we can’t do real region splicing, but we can still:
    // applyEdit({ type: 'insert', startTime: region.start, ... })
  }, [selectedRegion])

  const handleReplace = useCallback(() => {
    console.log('Replace snippet at region', selectedRegion)
  }, [selectedRegion])

  const handleDelete = useCallback(() => {
    if (!selectedRegion) return
    applyEdit({
      type: 'delete',
      startTime: selectedRegion.start,
      endTime: selectedRegion.end
    })
  }, [selectedRegion, applyEdit])

  // ================
  // Save => calls syncFromBackend
  // ================
  const handleSaveRecording = useCallback(async () => {
    console.info('Manual save => calling syncFromBackend()')
    await syncFromBackend()
  }, [syncFromBackend])

  // ================
  // Name update & Template
  // ================
  const handleNameUpdate = useCallback(() => {
    if (!selectedTranscription) return
    const update: TranscriptionMeta = {
      id: draftId,
      name,
      status: 'draft',
      template_id: selectedTranscription.template?.id,
      created_at: new Date().toISOString()
    }
    updateTranscription(update)
    setIsEditingName(false)
  }, [draftId, name, selectedTranscription, updateTranscription])

  const handleTemplateChange = useCallback((templateId: string) => {
    if (!selectedTranscription) return
    const update: TranscriptionMeta = {
      id: draftId,
      name,
      status: 'draft',
      template_id: templateId,
      created_at: new Date().toISOString()
    }
    updateTranscription(update)
  }, [draftId, name, selectedTranscription, updateTranscription])

  // ================
  // Mark Complete
  // ================
  const handleMarkComplete = useCallback(async () => {
    if (!selectedTranscription) return
    const update: TranscriptionMeta = {
      id: draftId,
      name,
      status: 'processing',
      backend_status: 'recording_service',
      created_at: new Date().toISOString()
    }
    await updateTranscription(update)
  }, [draftId, name, selectedTranscription, updateTranscription])

  return (
    <div className="shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
      {/* Title / Name */}
      <div className="flex justify-between items-center mb-4">
        {isEditingName ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameUpdate}
            placeholder="Enter transcription name"
            className="w-64"
          />
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{name}</h2>
            <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Change Template</Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandInput placeholder="Search templates..." />
                <CommandEmpty>No templates found</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {templates?.map((template) => (
                      <CommandItem
                        key={template.id}
                        onSelect={() => handleTemplateChange(template.id)}
                      >
                        {template.name}
                        {selectedTranscription?.template?.id === template.id && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button variant="destructive" onClick={() => deleteTranscription(draftId)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Audio element for playback */}
      {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
          }
        }}
        onEnded={() => setIsPlaying(false)}
        controls
        className="w-full mb-2"
      />

      {/* We display the times. There's no wave, so we do a simple slider for currentTime. */}
      <div className="flex items-center mb-2">
        <span className="text-sm w-16">{isRecording ? formatTime(recordingTime) : formatTime(currentTime)}</span>
        <Slider
          value={audioRef.current && !isRecording
            ? [(audioRef.current.currentTime /
                Math.max(audioRef.current.duration || 1, 1)) * 100]
            : [0]
          }
          onValueChange={(val) => {
            if (!audioRef.current || isRecording) return
            const duration = audioRef.current.duration || 1
            const newTime = (val[0] / 100) * duration
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
          }}
          max={100}
          step={0.1}
          className="flex-1 mx-2"
          disabled={isRecording || !audioUrl}
        />
        <span className="text-sm w-16 text-right">
          {audioRef.current
            ? formatTime(audioRef.current.duration || 0)
            : '00:00'}
        </span>
      </div>

      {/* Playback & Recording Controls */}
      <div className="flex justify-center space-x-4">
        <Button onClick={() => handleSkip(-5)} size="icon" variant="outline" disabled={isRecording || !audioUrl}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleSkip(-2)} size="icon" variant="outline" disabled={isRecording || !audioUrl}>
          <SkipBack className="h-4 w-4" />
        </Button>

        {/* If we have audio, show Play/Pause */}
        {audioUrl && (
          <Button onClick={handlePlayPause} size="icon" variant="default" disabled={isRecording}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        )}

        {/* Single record toggle */}
        <Button
          onClick={handleRecordToggle}
          size="icon"
          variant={isRecording ? 'destructive' : 'default'}
        >
          {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        {/* Manual save button */}
        <Button onClick={handleSaveRecording} size="icon" variant="outline" disabled={isRecording}>
          <Save className="h-4 w-4" />
        </Button>

        <Button onClick={() => handleSkip(2)} size="icon" variant="outline" disabled={isRecording || !audioUrl}>
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleSkip(5)} size="icon" variant="outline" disabled={isRecording || !audioUrl}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Region editing (placeholder) */}
      <div className="flex justify-center space-x-4 mt-4">
        <Button onClick={handleInsert} size="icon" variant="outline" disabled={!selectedRegion}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={handleReplace} size="icon" variant="outline" disabled={!selectedRegion}>
          <Scissors className="h-4 w-4" />
        </Button>
        <Button onClick={handleDelete} size="icon" variant="outline" disabled={!selectedRegion}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Mark Complete */}
      <div className="mt-4 flex justify-center">
        <Button onClick={handleMarkComplete} disabled={isRecording}>
          Mark as Complete
        </Button>
      </div>
    </div>
  )
}

export default SpeechToTextInterface
