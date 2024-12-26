# common/nats_client.py
import asyncio
from nats.aio.client import Client as NATS
from nats.js.api import KeyValue
from projects.precepto.backend.common.models import User, TranscriptTemplate, TranscriptionMeta
import logging
from typing import Optional

class NATSClient:
    def __init__(self, loop=None):
        self.loop = loop or asyncio.get_event_loop()
        self.nc = NATS()
        self.js = None
        self.kv_users: Optional[KeyValue] = None
        self.kv_templates: Optional[KeyValue] = None
        self.kv_transcriptions: Optional[KeyValue] = None
        self.logger = logging.getLogger(self.__class__.__name__)

    async def connect(self, servers=["nats://localhost:4222"]):
        await self.nc.connect(servers=servers, loop=self.loop)
        self.js = self.nc.jetstream()
        self.logger.info("Connected to NATS")

        # Initialize KV stores
        self.kv_users = await self.js.key_value(bucket='users')
        self.kv_templates = await self.js.key_value(bucket='templates')
        self.kv_transcriptions = await self.js.key_value(bucket='transcriptions')

    async def kv_put(self, bucket: KeyValue, key: str, value: str):
        await bucket.put(key, value.encode())
        self.logger.info(f"KV Put: {key}")

    async def kv_get(self, bucket: KeyValue, key: str) -> Optional[str]:
        try:
            entry = await bucket.get(key)
            self.logger.info(f"KV Get: {key}")
            return entry.value.decode()
        except Exception as e:
            self.logger.error(f"KV Get Error: {e}")
            return None

    async def subscribe(self, subject: str, callback):
        await self.nc.subscribe(subject, cb=callback)
        self.logger.info(f"Subscribed to subject: {subject}")

    async def publish(self, subject: str, message: str, headers=None):
        await self.nc.publish(subject, message.encode(), headers=headers)
        self.logger.info(f"Published to subject: {subject}")

    async def close(self):
        await self.nc.close()
        self.logger.info("Disconnected from NATS")
