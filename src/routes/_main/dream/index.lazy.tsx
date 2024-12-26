import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_main/dream/')({
  component: About,
})

function About() {
  return <div className="p-2">Hello from dream!</div>
}