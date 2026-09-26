import Link from 'next/link'
import ProjectsList from '@/components/admin/ProjectsList'
import { listProjects } from '@/lib/db'

export default function ProjectsAdminPage() {
  const projects = listProjects()
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          <span className="text-terminal-accent-red">$</span> ls projects/
        </h1>
        <Link href="/projects/new" className="adm-btn adm-btn-primary">new project</Link>
      </div>
      <ProjectsList initial={projects} />
    </>
  )
}
