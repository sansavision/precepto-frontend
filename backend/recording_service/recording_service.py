# recording_service.py
import asyncio
import os
from common.nats_client import NATSClient
from projects.precepto.backend.common.models import TranscriptionMeta
import logging

logging.basicConfig(level=logging.INFO)

CHUNK_STORAGE_PATH = 'audio_chunks'
if not os.path.exists(CHUNK_STORAGE_PATH):
    os.makedirs(CHUNK_STORAGE_PATH)

async def run():
    nats_client = NATSClient()
    await nats_client.connect()

    js = nats_client.js

    # Create stream for audio chunks if not exists
    await js.add_stream(name="AUDIO_CHUNKS", subjects=["audio.chunks"])

    async def handle_audio_chunk(msg):
        recording_id = msg.headers.get('Recording-ID')
        if not recording_id:
            nats_client.logger.error("Recording ID missing in headers")
            return

        chunk_filename = f"{recording_id}_{int(asyncio.get_event_loop().time() * 1000)}.webm"
        chunk_path = os.path.join(CHUNK_STORAGE_PATH, chunk_filename)
        with open(chunk_path, 'wb') as f:
            f.write(msg.data)
        nats_client.logger.info(f"Saved audio chunk: {chunk_filename}")

    async def handle_kv_transcription_put(msg):
        kv_key = msg.headers.get('KV-Key')
        if kv_key:
            value = msg.data.decode()
            await nats_client.kv_put(nats_client.kv_transcriptions, kv_key, value)

    # Subscribe to subjects
    await nats_client.subscribe("audio.chunks", handle_audio_chunk)
    await nats_client.subscribe("kv.transcriptions.put", handle_kv_transcription_put)

    # Keep the service running
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await nats_client.close()

if __name__ == '__main__':
    asyncio.run(run())
