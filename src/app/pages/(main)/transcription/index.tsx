// src/components/transcription.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Editor from '@monaco-editor/react';
import {
  FastForward,
  Pause,
  Play,
  Rewind,
  SkipBack,
  Volume2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
// import { useGlobalStore } from '@/lib/store/globalstore'
// import type { TranscriptionMeta } from './studio.types'

// interface StudioProps {
//    transcriptionMeta: TranscriptionMeta
//   }
export default function Transcription() {
  // const activeTranscription = useGlobalStore((state) => state.activeTranscription)
  const [editorContent, setEditorContent] = useState('Enter your text here...');
  const [loading, _setIsLoading] = useState(false);
  const [audioUrl, _setAudioUrl] = useState('/placeholder.mp3');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [highlightedWord, setHighlightedWord] = useState(0);
  const [columnSizes, setColumnSizes] = useState({ left: 50, right: 50 });

  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;
    }
  }, [playbackRate, volume]);

  useEffect(() => {
    const container = containerRef.current;
    const resizeHandle = resizeHandleRef.current;

    if (!container) {
      return;
    }
    if (!resizeHandle) {
      return;
    }

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!container) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const newRightWidth = 100 - newLeftWidth;

      if (newLeftWidth > 20 && newRightWidth > 20) {
        setColumnSizes({ left: newLeftWidth, right: newRightWidth });
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    resizeHandle.addEventListener('mousedown', onMouseDown);

    return () => {
      resizeHandle.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    setEditorContent(value || '');
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      const wordIndex =
        Math.floor(audioRef.current.currentTime / 0.5) %
        editorContent.split(' ').length;
      setHighlightedWord(wordIndex);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  if (loading) {
    return (
      <div
        ref={containerRef}
        className="flex flex-col flex-1 items-center justify-center gap-4 bg-background text-foreground p-4"
      >
        <span>Laddar...</span>
      </div>
    );
  }

  return (
    // <div ref={containerRef} className="flex h-full w-full bg-background text-foreground">
    <div
      ref={containerRef}
      className="flex flex-1 bg-background text-foreground p-4"
    >
      {/* Left Column: Editable Text Editor */}
      <div
        style={{ width: `${columnSizes.left}%` }}
        className="flex flex-col h-full p-4"
      >
        {/* <h2 className="text-xl font-bold mb-2">Editable Text</h2> */}
        <div className="flex-grow">
          <Editor
            height="100%"
            defaultLanguage="plaintext"
            defaultValue={editorContent}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{ automaticLayout: true }}
          />
        </div>
      </div>

      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className="w-1 bg-border hover:bg-primary cursor-col-resize"
      />

      {/* Right Column: Non-editable Text Display and Audio Controls */}
      <div
        style={{ width: `${columnSizes.right}%` }}
        className="flex flex-col h-full"
      >
        <div className="flex-grow p-4 overflow-hidden">
          {/* <h2 className="text-xl font-bold mb-2">Non-editable Text</h2> */}
          <div className="h-[calc(100%-2rem)]">
            <Editor
              height="100%"
              defaultLanguage="plaintext"
              value={editorContent
                .split(' ')
                .map((word, index) =>
                  index === highlightedWord
                    ? `<span style="background-color: yellow;">${word}</span>`
                    : word,
                )
                .join(' ')}
              options={{ readOnly: true, automaticLayout: true }}
              theme="vs-dark"
            />
          </div>
        </div>

        {/* Audio Playback Controls */}
        <div className="h-48 border-t border-border p-4 flex flex-col">
          {/* <h3 className="text-lg font-semibold mb-2">Audio Playback</h3> */}
          {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
          <div className="flex justify-between items-center mb-2">
            <Button
              variant={'outline'}
              onClick={() => skipTime(-5)}
              size="icon"
            >
              <Rewind className="h-4 w-4" />
            </Button>
            <Button variant={'default'} onClick={togglePlayPause} size="icon">
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant={'outline'} onClick={stop} size="icon">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant={'outline'} onClick={() => skipTime(5)} size="icon">
              <FastForward className="h-4 w-4" />
            </Button>
          </div>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={(value) => {
              if (audioRef.current) {
                audioRef.current.currentTime = value[0];
              }
            }}
            className="mb-2 flex-grow"
          />
          <div className="flex justify-between items-center mb-2 text-sm">
            <Button
              variant={'outline'}
              onClick={() => changePlaybackRate(playbackRate - 0.25)}
              disabled={playbackRate <= 0.5}
              size="sm"
            >
              Slower
            </Button>
            <span>{playbackRate.toFixed(2)}x</span>
            <Button
              variant={'outline'}
              onClick={() => changePlaybackRate(playbackRate + 0.25)}
              disabled={playbackRate >= 2}
              size="sm"
            >
              Faster
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 flex-shrink-0" />
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-grow"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
