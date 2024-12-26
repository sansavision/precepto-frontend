# services/transcription_service/transcription_service.py
import asyncio
import datetime
import os
from common.nats_client import NATSClient
from projects.precepto.backend.common.models import TranscriptionMeta
from transformers import pipeline
import logging

logging.basicConfig(level=logging.INFO)

TRANSCRIPTIONS_PATH = 'transcriptions'
if not os.path.exists(TRANSCRIPTIONS_PATH):
    os.makedirs(TRANSCRIPTIONS_PATH)

# Initialize Hugging Face Whisper model
transcriber = pipeline('automatic-speech-recognition', model='openai/whisper-base')

async def run():
    nats_client = NATSClient()
    await nats_client.connect()

    js = nats_client.js

    # Subscribe to 'recording.completed' messages
    async def handle_completed_recording(msg):
        transcription_meta = TranscriptionMeta.from_json(msg.data.decode())
        recording_id = transcription_meta.id
        nats_client.logger.info(f"Processing transcription for recording ID: {recording_id}")

        # Locate and combine audio chunks
        chunk_files = [f for f in os.listdir('audio_chunks') if f.startswith(recording_id)]
        chunk_files.sort()  # Ensure correct order

        if not chunk_files:
            nats_client.logger.error(f"No audio chunks found for recording ID: {recording_id}")
            return

        combined_audio_path = os.path.join('audio_chunks', f"{recording_id}_combined.webm")
        with open(combined_audio_path, 'wb') as outfile:
            for fname in chunk_files:
                with open(os.path.join('audio_chunks', fname), 'rb') as infile:
                    outfile.write(infile.read())

        # Transcribe audio
        result = transcriber(combined_audio_path)
        transcription_text = result['text']

        # Update transcription meta
        transcription_meta.transcript = transcription_text
        transcription_meta.status = 'complete'
        transcription_meta.backend_status = 'transcription_service'
        transcription_meta.updated_at = datetime.utcnow().isoformat()

        # Save transcription
        transcription_file = os.path.join(TRANSCRIPTIONS_PATH, f"{recording_id}.txt")
        with open(transcription_file, 'w') as f:
            f.write(transcription_text)

        # Update KV store
        await nats_client.kv_put(nats_client.kv_transcriptions, recording_id, transcription_meta.to_json())

        # Notify summarization service
        await nats_client.publish('transcription.completed', transcription_meta.to_json())

    # Subscribe to subjects
    await nats_client.subscribe('recording.completed', handle_completed_recording)

    # Keep the service running
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await nats_client.close()

if __name__ == '__main__':
    asyncio.run(run())
