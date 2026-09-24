import { notFound } from 'next/navigation'
import ProjectForm from '@/components/admin/ProjectForm'
import { getProject } from '@/lib/db'
import { parseId } from '@/lib/auth'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id)
  const project = id === null ? null : getProject(id)
  if (!project) notFound()
  return (
    <>
      <h1 className="text-xl font-bold mb-6">
        <span className="text-terminal-accent-red">$</span> edit {project.name}
      </h1>
      <ProjectForm initial={project} />
    </>
  )
}
