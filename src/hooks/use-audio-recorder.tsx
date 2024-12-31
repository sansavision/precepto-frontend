import { useState, useRef, useCallback, useEffect } from 'react'

type AudioData = {
  channelData: Float32Array[]
  sampleRate: number
}

type VisualizerCallback = (audioData: AudioData) => void

export function useAudioRecorder() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const analyser = useRef<AnalyserNode | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const visualizerCallbacks = useRef<VisualizerCallback[]>([])
  const animationFrameId = useRef<number | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      audioContext.current = new AudioContext()
      analyser.current = audioContext.current.createAnalyser()
      analyser.current.fftSize = 2048
      const source = audioContext.current.createMediaStreamSource(stream)
      source.connect(analyser.current)

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        setIsRecording(false)
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current)
        }
      }

      mediaRecorder.current.onerror = (event) => {
        const errorEvent = event as ErrorEvent
        setError(`MediaRecorder error: ${errorEvent.error.name}`)
      }

      mediaRecorder.current.start(250) // Collect data every 250ms
      setIsRecording(true)
      setError(null)

      visualize()
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Permission to access microphone was denied')
        } else if (err.name === 'NotFoundError') {
          setError('No microphone was found')
        } else {
          setError(`Error accessing the microphone: ${err.message}`)
        }
      } else {
        setError(`Unexpected error: ${err}`)
      }
      console.error('Error starting recording:', err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop()
      for (const track of mediaRecorder.current.stream.getTracks()) {
        track.stop()
      }
    }
    setIsRecording(false)
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume()
      setIsRecording(true)
      visualize()
    }
  }, [])

  const visualize = useCallback(() => {
    if (!analyser.current) {return}

    const bufferLength = analyser.current.frequencyBinCount
    const dataArray = new Float32Array(bufferLength)

    const updateVisualizer = () => {
      if (!isRecording) {return}

      analyser.current?.getFloatTimeDomainData(dataArray)
      const audioData: AudioData = {
        channelData: [dataArray],
        sampleRate: audioContext.current?.sampleRate ?? 44100
      }

      for (const callback of visualizerCallbacks.current) {
        callback(audioData)
      }
      animationFrameId.current = requestAnimationFrame(updateVisualizer)
    }

    updateVisualizer()
  }, [isRecording])

  const addVisualizerCallback = useCallback((callback: VisualizerCallback) => {
    visualizerCallbacks.current.push(callback)
  }, [])

  const removeVisualizerCallback = useCallback((callback: VisualizerCallback) => {
    visualizerCallbacks.current = visualizerCallbacks.current.filter(cb => cb !== callback)
  }, [])

  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop()
      }
      if (audioContext.current) {
        audioContext.current.close()
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return { 
    startRecording, 
    stopRecording, 
    resumeRecording, 
    audioBlob, 
    error, 
    isRecording,
    addVisualizerCallback,
    removeVisualizerCallback
  }
}

