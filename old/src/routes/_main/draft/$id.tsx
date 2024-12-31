import RecordAudio from '@/app/pages/(main)/draft'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/draft/$id')({
  component: Draft,
})

function Draft() {
  const {id} = Route.useParams()
  return <RecordAudio draft_id={id}/>
}