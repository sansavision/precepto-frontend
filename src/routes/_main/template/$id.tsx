
 
import { createFileRoute } from '@tanstack/react-router'
import TemplateManager from '@/app/pages/(main)/template/Template'

export const Route = createFileRoute('/_main/template/$id')({
  component: Template,
})


function Template() {
  const {id} = Route.useParams()
  return (
    <TemplateManager template_id={id} />
  )
}
 