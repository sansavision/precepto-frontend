import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions'
import type { Region } from 'wavesurfer.js/dist/plugins/regions.js'

import {
  Mic, Play, StopCircle, Pause, RotateCcw, RotateCw, SkipBack, SkipForward,
  Scissors, Plus, Trash2, Check, Edit2,
  //  Save
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  // Recording / playback states
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Times
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)

  // Keep track of how many seconds of total audio we have so far,
  // so each snippet doesn't overwrite the old wave.
  const accumulatedTimeRef = useRef(0)

  // For naming transcription
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState('')

  // Regions
  const [selectedRegion, _setSelectedRegion] = useState<Region | null>(null)

  // WaveSurfer references
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const recordPlugin = useRef<RecordPlugin | null>(null)
  const regionsPlugin = useRef<RegionsPlugin | null>(null)

  // From your hooks
  const { updateTranscription, deleteTranscription, transcriptions, completeRecording } = useTranscriptions()
  const { templates } = useTemplates()

  // Audio sync manager: store & retrieve chunks from backend
  const { chunks, addChunk, applyEdit } = useAudioSyncManager(draftId)

//   const lastProgressRef = useRef(0);
  // Which transcription are we editing
  const selectedTranscription = useMemo(
    () => transcriptions?.find((t) => t.id === draftId),
    [transcriptions, draftId]
  )

  // =============================
  // 1) Setup WaveSurfer & Plugins
  // =============================

        // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
              useEffect(() => {
    if (!waveformRef.current) return

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
      cursorColor: 'navy',
      barWidth: 2,
      barRadius: 3,
      height: 100
    })

    recordPlugin.current = wavesurfer.current.registerPlugin(
      RecordPlugin.create({
        mimeType: 'audio/webm'
      })
    ) as RecordPlugin

    regionsPlugin.current = wavesurfer.current.registerPlugin(
      RegionsPlugin.create()
    ) as RegionsPlugin

    // WaveSurfer events
    wavesurfer.current.on('ready', () => {
      const dur = wavesurfer.current?.getDuration() ?? 0
      setDuration(dur)
    })

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current?.getCurrentTime() ?? 0)
    })

    wavesurfer.current.on('play', () => setIsPlaying(true))
    wavesurfer.current.on('pause', () => setIsPlaying(false))

    // // Record plugin events
    recordPlugin.current.on('record-progress', (sec: number) => {
      setRecordingTime(sec)
    })

    // NOTE: Some plugin versions do NOT fire "finish", but do fire "record-end"
    // So let's use "record-end" as the final event containing the blob:
    recordPlugin.current.on('record-pause', (blob: Blob) => {
      console.info('**record-pause** event => final blob:', blob)
      if (blob instanceof Blob) {
        // snippet length in seconds is "recordingTime"
        const snippetDuration = recordingTime
        const startTime = accumulatedTimeRef.current
        const endTime = accumulatedTimeRef.current + snippetDuration
        accumulatedTimeRef.current = endTime

        // Now we add the chunk to the manager. In 5s, scheduleSync will save it.
        addChunk(blob, startTime, endTime)
      }
    })
    recordPlugin.current.on('record-end', (blob: Blob) => {
      console.info('**record-end** event => final blob:', blob)
      if (blob instanceof Blob) {
        // snippet length in seconds is "recordingTime"
        const snippetDuration = recordingTime
        const startTime = accumulatedTimeRef.current
        const endTime = accumulatedTimeRef.current + snippetDuration
        accumulatedTimeRef.current = endTime

        // Now we add the chunk to the manager. In 5s, scheduleSync will save it.
        addChunk(blob, startTime, endTime)
      }
    })
 
    // recordPlugin.current.on('record-progress', (sec: number) => {
    //     lastProgressRef.current = sec; // store in a ref
    //     setRecordingTime(sec);
    //   });
      
    //   recordPlugin.current.on('record-end', (blob: Blob) => {
    //     const snippetDuration = lastProgressRef.current;
    //     if (snippetDuration <= 0) {
    //       console.warn('No snippet duration? Possibly ended too quickly or plugin mismatch...');
    //       return;
    //     }
      
    //     const startTime = accumulatedTimeRef.current;
    //     const endTime = startTime + snippetDuration;
    //     accumulatedTimeRef.current = endTime;
      
    //     console.info(`Adding chunk from ${startTime} to ${endTime}, length = ${snippetDuration}`);
    //     addChunk(blob, startTime, endTime); // set status = pending
      
    //     // Optional: Attempt to load the final snippet directly or rely on combined blob effect
    //   });
    // regionsPlugin.current.on('region-clicked', (region) => {
    //   setSelectedRegion(region)
    // })

    return () => {
      wavesurfer.current?.destroy()
    }
  }, [addChunk])

  // ======================================
  // 2) Combine all chunks for single wave
  // ======================================
  const combinedBlob = useMemo(() => {
    if (chunks.length === 0) return null
    return new Blob(chunks.map(c => c.data), { type: 'audio/webm' })
  }, [chunks])

  // Whenever combinedBlob changes, load it
  useEffect(() => {
    if (!wavesurfer.current) return
    if (!combinedBlob) return

    console.info('Loading combined blob of all chunks into WaveSurfer...')
    wavesurfer.current.loadBlob(combinedBlob)
      .then(() => {
        const dur = wavesurfer.current?.getDuration() ?? 0
        setDuration(dur)
        console.info('WaveSurfer loaded combined blob; new duration =', dur)
      })
      .catch(err => {
        console.error('Error loading combined blob:', err)
      })
  }, [combinedBlob])

  // Keep name in sync with selected transcription
  useEffect(() => {
    if (selectedTranscription) {
      setName(selectedTranscription.name)
    }
  }, [selectedTranscription])

  // ================
  // Recording Toggle
  // ================
  const handleRecordToggle = useCallback(async () => {
    if (!recordPlugin.current) return

    if (!isRecording) {
      // Start recording
      console.info('Starting recording...')
      try {
        await recordPlugin.current.startRecording()
        setIsRecording(true)
        setRecordingTime(0)
      } catch (err) {
        console.error('Could not start recording:', err)
      }
    } else {
      // Stop recording
      console.info('Stopping recording...')
      try {
        // recordPlugin.current.stopRecording()
        recordPlugin.current.pauseRecording()
      } catch (err) {
        console.error('Error stopping recording:', err)
      }
      setIsRecording(false)
    }
  }, [isRecording])

  // ================
  // Playback
  // ================
  const handlePlayPause = useCallback(() => {
    wavesurfer.current?.playPause()
  }, [])

  // ================
  // Skips
  // ================
  const handleSkip = useCallback((seconds: number) => {
    if (!wavesurfer.current) return
    const dur = wavesurfer.current.getDuration()
    const cur = wavesurfer.current.getCurrentTime()
    const newTime = Math.max(0, Math.min(cur + seconds, dur))
    wavesurfer.current.seekTo(newTime / dur)
    setCurrentTime(newTime)
  }, [])

  // ================
  // Insert / Replace / Delete
  // ================
  const handleInsert = useCallback(async () => {
    if (!selectedRegion || !recordPlugin.current) return
    try {
      await recordPlugin.current.startRecording()
      const snippetBlob = (await recordPlugin.current.stopRecording()) as Blob | undefined
      if (snippetBlob && snippetBlob instanceof Blob) {
        const arrBuf = await snippetBlob.arrayBuffer()
        await applyEdit({
          type: 'insert',
          startTime: selectedRegion.start,
          endTime: selectedRegion.start + arrBuf.byteLength / 44100,
          data: snippetBlob
        })
      }
    } catch (err) {
      console.error('Error inserting snippet:', err)
    }
  }, [applyEdit, selectedRegion])

  const handleReplace = useCallback(async () => {
    if (!selectedRegion || !recordPlugin.current) return
    try {
      await recordPlugin.current.startRecording()
      const snippetBlob = (await recordPlugin.current.stopRecording()) as Blob | undefined
      if (snippetBlob && snippetBlob instanceof Blob) {
        await applyEdit({
          type: 'replace',
          startTime: selectedRegion.start,
          endTime: selectedRegion.end,
          data: snippetBlob
        })
      }
    } catch (err) {
      console.error('Error replacing snippet:', err)
    }
  }, [applyEdit, selectedRegion])

  const handleDelete = useCallback(() => {
    if (!selectedRegion) return
    applyEdit({
      type: 'delete',
      startTime: selectedRegion.start,
      endTime: selectedRegion.end
    })
  }, [applyEdit, selectedRegion])

  // ================
  // Save => calls syncFromBackend
  // ================
  // const handleSaveRecording = useCallback(async () => {
  //   console.info('Manual save => calling syncFromBackend()')
  //   await syncFromBackend()
  // }, [syncFromBackend])

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
    recordPlugin.current?.stopRecording()
    if (!selectedTranscription) return
    const update: TranscriptionMeta = {
      id: draftId,
      name,
      status: 'processing',
      backend_status: 'recording_service',
      created_at: new Date().toISOString()
    }
    await updateTranscription(update)
    await completeRecording(draftId)
  }, [draftId, name, selectedTranscription, updateTranscription,completeRecording])

  // ================
  // Render
  // ================
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

      {/* Waveform */}
      <div ref={waveformRef} className="w-full h-32 mb-4" />

      {/* Time + slider */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">
          {isRecording ? formatTime(recordingTime) : formatTime(currentTime)}
        </span>
        <Slider
          value={[
            isRecording
              ? 0
              : (currentTime / Math.max(duration, 1)) * 100
          ]}
          onValueChange={(value) => {
            if (isRecording || !wavesurfer.current) return
            const newTime = (value[0] / 100) * duration
            wavesurfer.current.seekTo(newTime / duration)
            setCurrentTime(newTime)
          }}
          max={100}
          step={0.1}
          className="w-full mx-4"
          disabled={isRecording}
        />
        <span className="text-sm">{formatTime(duration)}</span>
      </div>

      {/* Bottom controls */}
      <div className="flex justify-center space-x-4">
        <Button onClick={() => handleSkip(-5)} size="icon" variant="outline" disabled={isRecording}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleSkip(-2)} size="icon" variant="outline" disabled={isRecording}>
          <SkipBack className="h-4 w-4" />
        </Button>

        {/* Play/pause */}
        <Button onClick={handlePlayPause} size="icon" variant="default" disabled={isRecording}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        {/* Record Toggle */}
        <Button
          onClick={handleRecordToggle}
          size="icon"
          variant={isRecording ? 'destructive' : 'default'}
        >
          {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        {/* Save to backend (manual) */}
        {/* <Button onClick={handleSaveRecording} size="icon" variant="outline">
          <Save className="h-4 w-4" />
        </Button> */}

        <Button onClick={() => handleSkip(2)} size="icon" variant="outline" disabled={isRecording}>
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleSkip(5)} size="icon" variant="outline" disabled={isRecording}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Region editing (optional) */}
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
