# services/summarization_service/summarization_service.py
import asyncio
import datetime
from common.nats_client import NATSClient
from projects.precepto.backend.common.models import TranscriptionMeta, TranscriptTemplate
from transformers import pipeline
import logging

logging.basicConfig(level=logging.INFO)

# Initialize Hugging Face Llama 3B model (placeholder)
summarizer = pipeline('summarization', model='facebook/bart-large-cnn')

async def run():
    nats_client = NATSClient()
    await nats_client.connect()

    js = nats_client.js

    async def handle_completed_transcription(msg):
        transcription_meta = TranscriptionMeta.from_json(msg.data.decode())
        recording_id = transcription_meta.id
        nats_client.logger.info(f"Processing summarization for recording ID: {recording_id}")

        # Fetch user template from KV store
        if transcription_meta.template_id:
            template_entry = await nats_client.kv_get(nats_client.kv_templates, transcription_meta.template_id)
            if template_entry:
                transcript_template = TranscriptTemplate.from_json(template_entry)
                template = transcript_template.template
            else:
                nats_client.logger.warning(f"Template not found for ID: {transcription_meta.template_id}")
                template = "{transcript}"
        else:
            template = "{transcript}"

        # Apply template
        prompt = template.format(transcript=transcription_meta.transcript)

        # Generate summary
        summary_result = summarizer(prompt, max_length=150, min_length=40, do_sample=False)
        summary_text = summary_result[0]['summary_text']

        # Update transcription meta
        transcription_meta.summary = summary_text
        transcription_meta.backend_status = 'summarization_service'
        transcription_meta.updated_at = datetime.utcnow().isoformat()

        # Update KV store
        await nats_client.kv_put(nats_client.kv_transcriptions, recording_id, transcription_meta.to_json())

        nats_client.logger.info(f"Summarization complete for recording ID: {recording_id}")

    # Subscribe to subjects
    await nats_client.subscribe('transcription.completed', handle_completed_transcription)

    # Keep the service running
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await nats_client.close()

if __name__ == '__main__':
    asyncio.run(run())
