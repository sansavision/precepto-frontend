import { useCallback, useRef, useState } from 'react'
import { useNats } from '@/lib/providers/nats-provider'
import { headers } from 'nats.ws';
interface AudioChunk {
    id: string
    startTime: number
    endTime: number
    data: Blob
    status: 'pending' | 'synced' | 'deleted' | 'modified'
}

interface AudioEdit {
    type: 'replace' | 'insert' | 'delete'
    startTime: number
    endTime: number
    data?: Blob
}

export function useAudioSyncManager(draftId: string) {
    const { request, publish } = useNats()
    const [chunks, setChunks] = useState<AudioChunk[]>([])
    const pendingEdits = useRef<AudioEdit[]>([])
    const syncTimeoutRef = useRef<NodeJS.Timeout>()

    // const callTranscriptionCombine = () => {
    //     const h = headers();
    //     h.set('Recording-ID', draftId);
    //     publish('audio.chunks', new Uint8Array(), { 
    //         headers: h
    //     })
    // }

    const saveChunk = useCallback(async (chunk: AudioChunk) => {
        try {
            console.info(`Saving chunk ${chunk.id} [${chunk.startTime}, ${chunk.endTime}] to backend...`)
            const arrayBuffer = await chunk.data.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)

            const h = headers();
            h.set('Recording-ID', draftId);
            h.set('Chunk-ID', chunk.id);
            h.set('Content-Type', 'audio/webm');
            h.set('Metadata', JSON.stringify({
                start_time: chunk.startTime,
                end_time: chunk.endTime,
            }));
            publish('audio.chunks', uint8Array, {
                headers: h  // pass the actual Headers object
            });
            //   publish('audio.chunks', uint8Array, {
            //     headers: {
            //       'Recording-ID': draftId,
            //       'Chunk-ID': chunk.id,
            //       'Content-Type': 'audio/webm',
            //       'Metadata': JSON.stringify({
            //         start_time: chunk.startTime,
            //         end_time: chunk.endTime
            //       })
            //     }
            //   })

            setChunks(prev =>
                prev.map(c =>
                    c.id === chunk.id ? { ...c, status: 'synced' } : c
                )
            )
        } catch (error) {
            console.error('Failed to save chunk:', error)
        }
    }, [draftId, publish])

    const scheduleSync = useCallback((chunks:AudioChunk[]) => {

        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current)
        }
        console.info('Scheduling sync in 5s for pending chunks...', chunks)
        for (const chunk of chunks.filter(ch => ch.status === 'pending')) {
            console.info('will save chunk -- chunk:', chunk)
            saveChunk(chunk)
        }
        // syncTimeoutRef.current = setTimeout(() => {
        //   console.info('Time to sync pending chunks...')
        //   for (const chunk of chunks.filter(ch => ch.status === 'pending')) {
        //     saveChunk(chunk)
        //   }
        // }, 5000)
    }, [saveChunk])

    const addChunk = useCallback((data: Blob, startTime: number, endTime: number) => {
        const newChunk: AudioChunk = {
            id: crypto.randomUUID(),
            data,
            startTime,
            endTime,
            status: 'pending'
        }
        console.info('addChunk => Created new chunk:', newChunk, newChunk.id, `[${startTime}, ${endTime}]`)
        const newChunks = [...chunks, newChunk]
        console.info(' in set chunks newChunks:', newChunks)
        // setChunks(prev => [...prev, newChunk])
        setChunks(newChunks)
        setTimeout(() => {
            scheduleSync(newChunks)
        }, 100);
    }, [scheduleSync, chunks])

    const applyEdit = useCallback(async (edit: AudioEdit) => {
        pendingEdits.current.push(edit)
        let updatedChunks = [...chunks]

        switch (edit.type) {
            case 'replace':
                updatedChunks = updatedChunks.map(chunk => {
                    if (chunk.startTime >= edit.startTime && chunk.endTime <= edit.endTime) {
                        return { ...chunk, status: 'deleted' }
                    }
                    return chunk
                })
                if (edit.data) {
                    addChunk(edit.data, edit.startTime, edit.endTime)
                }
                break

            case 'insert':
                if (edit.data) {
                    addChunk(edit.data, edit.startTime, edit.endTime)
                }
                break

            case 'delete':
                updatedChunks = updatedChunks.map(chunk => {
                    if (chunk.startTime >= edit.startTime && chunk.endTime <= edit.endTime) {
                        return { ...chunk, status: 'deleted' }
                    }
                    return chunk
                })
                break

            default:
                break
        }
        setChunks(updatedChunks)
        scheduleSync(updatedChunks)
    }, [chunks, addChunk, scheduleSync])

    const syncFromBackend = useCallback(async () => {
        try {
            console.info('syncFromBackend => requesting existing chunks from server...')
            const accessToken = localStorage.getItem('access_token') || ''
            const data = {
                access_token: accessToken,
                recording_id: draftId
            }
            const response = await request('audio.chunks.get', JSON.stringify(data))
            const backendChunks = JSON.parse(response)

            console.info('Got backend chunks:', backendChunks)
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const newChunks: AudioChunk[] = backendChunks.map((bc: any) => ({
                id: bc.id,
                startTime: bc.start_time,
                endTime: bc.end_time,
                data: new Blob([bc.data], { type: 'audio/webm' }),
                status: 'synced'
            }))
            setChunks(newChunks)
        } catch (error) {
            console.error('Failed to sync from backend:', error)
        }
    }, [draftId, request])

    return {
        chunks,
        addChunk,
        applyEdit,
        syncFromBackend,
        // callTranscriptionCombine
    }
}
