import ProjectForm from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
  return (
    <>
      <h1 className="text-xl font-bold mb-6">
        <span className="text-terminal-accent-red">$</span> new project
      </h1>
      <ProjectForm />
    </>
  )
}
