import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-terminal-text-dark/20 p-6">
        <h1 className="text-xl font-bold mb-6">
          <span className="text-terminal-accent-red">$</span> <span className="text-terminal-accent-green">sudo</span>{' '}
          <span className="text-terminal-accent-blue">blog</span>
        </h1>
        <LoginForm />
      </div>
    </main>
  )
}
