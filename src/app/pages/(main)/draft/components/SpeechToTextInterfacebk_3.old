import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatTime } from '@/lib/utils/recorder-helper'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTemplates } from '@/hooks/use-templates'
import { useTranscriptions } from '@/hooks/use-transcriptions'
import { Input } from '@/components/ui/input'
import { useAudioSyncManager } from '@/hooks/use-audio-sync'
import {
    Mic, Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward,
    Scissors, Plus, Trash2, Check, Edit2, Save
} from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'
import type { Region } from 'wavesurfer.js/dist/plugins/regions.js'
import type { TranscriptionMeta } from '@/lib/types/transcript.types'

interface SpeechToTextInterfaceProps {
    draftId: string
}

const SpeechToTextInterface: React.FC<SpeechToTextInterfaceProps> = ({ draftId }) => {
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [recordingTime, setRecordingTime] = useState(0)
    const [isEditingName, setIsEditingName] = useState(false)
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
    const [hasRecordedAudio, setHasRecordedAudio] = useState(false)


    const { updateTranscription, deleteTranscription, transcriptions } = useTranscriptions()
    const [name, setName] = useState("")
    
    const selectedTranscription = useMemo(()=> transcriptions?.find((t) => t.id === draftId), [transcriptions, draftId])
    const waveformRef = useRef<HTMLDivElement>(null)
    const wavesurfer = useRef<WaveSurfer | null>(null)
    const record = useRef<RecordPlugin | null>(null)
    const regions = useRef<RegionsPlugin | null>(null)

    const { templates } = useTemplates()
    const { chunks, addChunk, applyEdit, syncFromBackend } = useAudioSyncManager(draftId)

    const loadAudioFromChunks = useCallback(async () => {
        if (chunks.length > 0 && wavesurfer.current) {
            const blob = new Blob(chunks.map(chunk => chunk.data), { type: 'audio/webm' })
            try {
                await wavesurfer.current.loadBlob(blob)
                setHasRecordedAudio(true)
            } catch (error) {
                console.error('Error loading audio:', error)
            }
        }
    }, [chunks])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        loadAudioFromChunks()
    }, [chunks, loadAudioFromChunks])

    useEffect(() => {
        if (selectedTranscription) {
            setName(selectedTranscription.name)
        }
    }, [selectedTranscription])

    useEffect(() => {
        let cleanup: (() => void) | undefined

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

            record.current = wavesurfer.current.registerPlugin(RecordPlugin.create({
                mimeType: 'audio/webm'
            }))
            regions.current = wavesurfer.current.registerPlugin(RegionsPlugin.create())

            wavesurfer.current.on('ready', () => {
                setDuration(wavesurfer.current?.getDuration() ?? 0)
            })

            wavesurfer.current.on('audioprocess', () => {
                setCurrentTime(wavesurfer.current?.getCurrentTime() ?? 0)
            })

            wavesurfer.current.on('play', () => setIsPlaying(true))
            wavesurfer.current.on('pause', () => setIsPlaying(false))

            record.current.on('record-progress', (time: number) => {
                setRecordingTime(time)
            })

            regions.current.on('region-clicked', (region) => {
                setSelectedRegion(region)
            })

            // Load existing chunks
            if (chunks.length > 0) {
                const blob = new Blob(chunks.map(chunk => chunk.data), { type: 'audio/webm' })
                wavesurfer.current.loadBlob(blob)
                setHasRecordedAudio(true)
            }

            cleanup = () => wavesurfer.current?.destroy()
        }

        return () => cleanup?.()
    }, [chunks])

    const handlePlayPause = useCallback(() => {
        wavesurfer.current?.playPause()
    }, [])



    //   const handleRecordToggle = useCallback(async () => {
    //     if (isRecording) {
    //       const recordedBlob = record.current?.stopRecording()
    //       if (recordedBlob instanceof Blob) {
    //         const buffer = await recordedBlob.arrayBuffer()
    //         addChunk(recordedBlob, recordingTime, recordingTime + buffer.byteLength / 44100)
    //         setHasRecordedAudio(true)
    //       }
    //       setIsRecording(false)
    //       setIsPaused(false)
    //     } else {
    //       try {
    //         await record.current?.startRecording()
    //         setIsRecording(true)
    //         setRecordingTime(0)
    //       } catch (error) {
    //         console.error('Error starting recording:', error)
    //       }
    //     }
    //   }, [isRecording, recordingTime, addChunk])

    // const handleRecordToggle = useCallback(async () => {
    //     if (isRecording) {
    //       try {
    //         const recordedBlob = record.current?.stopRecording() as unknown as Blob
    //         if (recordedBlob) {
    //           const buffer = await recordedBlob.arrayBuffer()
    //           addChunk(recordedBlob, recordingTime, recordingTime + buffer.byteLength / 44100)
    //           setHasRecordedAudio(true)
    //         }
    //       } catch (error) {
    //         console.error('Error stopping recording:', error)
    //       }
    //       setIsRecording(false)
    //       setIsPaused(false)
    //     } else {
    //       try {
    //         await record.current?.startRecording()
    //         setIsRecording(true)
    //         setRecordingTime(0)
    //       } catch (error) {
    //         console.error('Error starting recording:', error)
    //       }
    //     }
    // }, [isRecording, recordingTime, addChunk])

    const handleRecordToggle = useCallback(async () => {
        if (isRecording) {
            try {
                const recordedBlob = record.current?.stopRecording() as unknown as Blob
                console.info("recordedBlob", recordedBlob)
                if (recordedBlob && recordedBlob instanceof Blob) {

                    const buffer = await recordedBlob.arrayBuffer()

                    addChunk(recordedBlob, recordingTime, recordingTime + buffer.byteLength / 44100)
                    console.info("after addChunk", addChunk)
                    await wavesurfer.current?.loadBlob(recordedBlob)
                    setHasRecordedAudio(true)
                }
            } catch (error) {
                console.error('Error stopping recording:', error)
            }
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
    }, [isRecording, recordingTime, addChunk])

    const handleSaveRecording = useCallback(async () => {
        if (chunks.length > 0) {
            await syncFromBackend()
            // Optional: Add visual feedback for save success
        }
    }, [chunks, syncFromBackend])


    const handlePauseResume = useCallback(() => {
        if (isPaused) {
            record.current?.resumeRecording()
            setIsPaused(false)
        } else {
            record.current?.pauseRecording()
            setIsPaused(true)
        }
    }, [isPaused])

    const handleSkip = useCallback((seconds: number) => {
        if (wavesurfer.current) {
            const newTime = Math.max(0, Math.min(wavesurfer.current.getCurrentTime() + seconds, duration))
            wavesurfer.current.seekTo(newTime / duration)
            setCurrentTime(newTime)
        }
    }, [duration])

    // const handleInsert = useCallback(async () => {
    //     if (!selectedRegion) return

    //     const startTime = selectedRegion.start
    //     await record.current?.startRecording()
    //     const blob = await record.current?.stopRecording()
    //     if (blob) {
    //         const arrayBuffer = await blob.arrayBuffer()
    //         await applyEdit({
    //             type: 'insert',
    //             startTime,
    //             endTime: startTime + arrayBuffer.byteLength / 44100,
    //             data: blob
    //         })
    //     }
    // }, [selectedRegion, applyEdit])

    const handleInsert = useCallback(async () => {
        if (!selectedRegion) return

        const startTime = selectedRegion.start
        try {
            await record.current?.startRecording()
            const blob = record.current?.stopRecording() as unknown as Blob
            if (blob) {
                const arrayBuffer = await blob.arrayBuffer()
                await applyEdit({
                    type: 'insert',
                    startTime,
                    endTime: startTime + arrayBuffer.byteLength / 44100,
                    data: blob
                })
            }
        } catch (error) {
            console.error('Error during insert:', error)
        }
    }, [selectedRegion, applyEdit])

    // const handleReplace = useCallback(async () => {
    //     if (!selectedRegion) return

    //     await record.current?.startRecording()
    //     const blob = await record.current?.stopRecording()
    //     if (blob) {
    //         await applyEdit({
    //             type: 'replace',
    //             startTime: selectedRegion.start,
    //             endTime: selectedRegion.end,
    //             data: blob
    //         })
    //     }
    // }, [selectedRegion, applyEdit])

    const handleReplace = useCallback(async () => {
        if (!selectedRegion) return

        try {
            await record.current?.startRecording()
            const blob = await record.current?.stopRecording()
            //   if (blob && blob instanceof Blob) {
            if (blob) {
                await applyEdit({
                    type: 'replace',
                    startTime: selectedRegion.start,
                    endTime: selectedRegion.end,
                    data: blob
                })
                await wavesurfer.current?.loadBlob(blob)
            }
        } catch (error) {
            console.error('Error during replace:', error)
        }
    }, [selectedRegion, applyEdit])

    const handleDelete = useCallback(() => {
        if (!selectedRegion) return

        applyEdit({
            type: 'delete',
            startTime: selectedRegion.start,
            endTime: selectedRegion.end
        })
    }, [selectedRegion, applyEdit])

    const handleNameUpdate = useCallback(() => {
        const update: TranscriptionMeta = {
            id: draftId,
            name,
            status: 'draft',
            template_id: selectedTranscription?.template?.id,
            created_at: new Date().toISOString()
        }
        updateTranscription(update)
        setIsEditingName(false)
    }, [draftId, name, updateTranscription, selectedTranscription])

    const handleTemplateChange = useCallback((templateId: string) => {
        const update: TranscriptionMeta = {
            id: draftId,
            name,
            status: 'draft',
            template_id: templateId,
            created_at: new Date().toISOString()
        }
        updateTranscription(update)
    }, [draftId, name, updateTranscription])
 

    const handleMarkComplete = useCallback(async () => {
        const update: TranscriptionMeta = {
            id: draftId,
            name,
            status: 'processing',
            backend_status: 'recording_service',
            created_at: new Date().toISOString()
        }
        await updateTranscription(update)
    }, [draftId, name, updateTranscription])

    return (
        <div className="shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                {isEditingName ? (
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleNameUpdate}
                        placeholder='Enter transcription name'
                        className="w-64"
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">{name}</h2>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsEditingName(true)}
                        >
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
                                                {
                                                    selectedTranscription?.template?.id === template.id && (
                                                        <Check className="ml-auto h-4 w-4" />
                                                    )
                                                }
                                                {/* <Check className="ml-auto h-4 w-4" /> */}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="destructive"
                        onClick={() => deleteTranscription(draftId)}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            <div ref={waveformRef} className="w-full h-32 mb-4" />

            <div className="flex justify-between items-center mb-4">
                <span className="text-sm">
                    {isRecording ? formatTime(recordingTime) : formatTime(currentTime)}
                </span>
                <Slider
                    value={[isRecording ? 0 : (currentTime / Math.max(duration, 1) * 100)]}
                    onValueChange={(value) => {
                        if (wavesurfer.current) {
                            const newTime = (value[0] / 100) * duration
                            wavesurfer.current.seekTo(newTime / duration)
                            setCurrentTime(newTime)
                        }
                    }}
                    max={100}
                    step={0.1}
                    className="w-full mx-4"
                    disabled={isRecording}
                />
                <span className="text-sm">{formatTime(duration)}</span>
            </div>

            {/* <div className="flex justify-center space-x-4">
        <Button onClick={() => handleSkip(-5)} size="icon" variant="outline" disabled={isRecording}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleSkip(-2)} size="icon" variant="outline" disabled={isRecording}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button onClick={handleRecordToggle} size="icon" variant={isRecording ? "destructive" : "default"}>
          {isRecording ? <Pause className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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
      </div> */}

            <div className="flex justify-center space-x-4">
                <Button onClick={() => handleSkip(-5)} size="icon" variant="outline" disabled={isRecording}>
                    <RotateCcw className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleSkip(-2)} size="icon" variant="outline" disabled={isRecording}>
                    <SkipBack className="h-4 w-4" />
                </Button>

                {hasRecordedAudio && !isRecording && (
                    <Button onClick={handlePlayPause} size="icon" variant="default">
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                )}

                {isRecording && (
                    <Button onClick={handlePauseResume} size="icon" variant="outline">
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                )}

                <Button onClick={handleRecordToggle} size="icon" variant={isRecording ? "destructive" : "default"}>
                    {isRecording ? <Pause className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                {hasRecordedAudio && (
                    <Button onClick={handleSaveRecording} size="icon" variant="outline">
                        <Save className="h-4 w-4" />
                    </Button>
                )}

                <Button onClick={() => handleSkip(2)} size="icon" variant="outline" disabled={isRecording}>
                    <SkipForward className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleSkip(5)} size="icon" variant="outline" disabled={isRecording}>
                    <RotateCw className="h-4 w-4" />
                </Button>
            </div>

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

            <div className="mt-4 flex justify-center">
                <Button onClick={handleMarkComplete} disabled={isRecording}>
                    Mark as Complete
                </Button>
            </div>
        </div>
    )
}

export default SpeechToTextInterface