import Studio from '@/app/pages/(main)/transcription'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/transcription/$id')({
  component: Studio,
})
