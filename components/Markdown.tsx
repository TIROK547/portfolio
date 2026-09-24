import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'

// dir="auto" lets Persian paragraphs render right-to-left while English ones stay left-to-right.
const components: Components = {
  h1: ({ node: _node, children, ...p }) => (
    <h1 dir="auto" className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-terminal-accent-green" {...p}>
      {children}
    </h1>
  ),
  h2: ({ node: _node, children, ...p }) => (
    <h2 dir="auto" className="text-xl sm:text-2xl font-bold mt-10 mb-3 text-terminal-accent-cyan" {...p}>
      <span aria-hidden className="text-terminal-accent-red">## </span>
      {children}
    </h2>
  ),
  h3: ({ node: _node, children, ...p }) => (
    <h3 dir="auto" className="text-lg font-semibold mt-8 mb-2 text-terminal-accent-blue" {...p}>
      <span aria-hidden className="text-terminal-accent-red">### </span>
      {children}
    </h3>
  ),
  h4: ({ node: _node, children, ...p }) => (
    <h4 dir="auto" className="font-semibold mt-6 mb-2 text-terminal-accent-yellow" {...p}>
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p dir="auto" className="my-4 leading-relaxed">
      {children}
    </p>
  ),
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="text-terminal-accent-yellow underline underline-offset-2 hover:text-terminal-accent-blue transition-colors"
      >
        {children}
      </a>
    )
  },
  ul: ({ children }) => <ul dir="auto" className="my-4 ps-6 list-disc space-y-1 marker:text-terminal-accent-red">{children}</ul>,
  ol: ({ children }) => <ol dir="auto" className="my-4 ps-6 list-decimal space-y-1 marker:text-terminal-accent-red">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote dir="auto" className="my-6 border-s-2 border-terminal-accent-magenta ps-4 opacity-80 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-terminal-text-light/20 dark:border-terminal-text-dark/20" />,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === 'string' ? src : undefined}
      alt={alt ?? ''}
      loading="lazy"
      className="my-6 max-w-full h-auto border border-terminal-text-light/20 dark:border-terminal-text-dark/20"
    />
  ),
  pre: ({ children }) => (
    <pre
      dir="ltr"
      className="my-6 p-4 overflow-x-auto text-sm border border-terminal-text-light/20 dark:border-terminal-text-dark/20 bg-terminal-text-light/5 dark:bg-black/30"
    >
      {children}
    </pre>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="px-1.5 py-0.5 text-[0.9em] bg-terminal-text-light/10 dark:bg-terminal-text-dark/10 text-terminal-accent-orange">
        {children}
      </code>
    ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-start p-2 border border-terminal-text-light/20 dark:border-terminal-text-dark/20 text-terminal-accent-cyan">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="p-2 border border-terminal-text-light/20 dark:border-terminal-text-dark/20">{children}</td>
  ),
}

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize, rehypeSlug]} components={components}>
      {children}
    </ReactMarkdown>
  )
}
