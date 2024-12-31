import Studio from '@/app/pages/(main)/transcription'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/transcription/$id')({
  component: Draft,
})

function Draft() {
  const {id} = Route.useParams()
  return <Studio transcription_id={id}/>
}