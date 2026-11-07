import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { visit } from 'unist-util-visit'

/** Fetch only at edit time; public pages always render the saved Markdown. */
export async function fetchProjectReadme(github: string): Promise<string> {
  const match =
    /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/?$/.exec(
      github,
    )
  if (!match) throw new Error('Enter a GitHub repository URL first.')
  const repo = match[2].replace(/\.git$/, '')
  const response = await fetch(
    `https://api.github.com/repos/${match[1]}/${repo}/readme`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'portfolio-editor',
      },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
      redirect: 'error',
    },
  )
  if (!response.ok)
    throw new Error(
      response.status === 404
        ? 'No public README found. Add a description manually or check the repository URL.'
        : 'GitHub could not provide the README. Try again or add a description manually.',
    )
  const data = await response.json()
  if (
    data.encoding !== 'base64' ||
    typeof data.content !== 'string' ||
    data.size > 200_000
  )
    throw new Error('README is too large or unsupported.')
  const markdown = Buffer.from(data.content, 'base64').toString('utf8')
  if (markdown.length > 200_000) throw new Error('README is too long.')
  const linkBase = data.html_url as string
  const imageBase = data.download_url as string
  const resolve = (url: string, image: boolean) => {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return url
    try {
      return new URL(url, image ? imageBase : linkBase).href
    } catch {
      return url
    }
  }
  // Parse Markdown so code samples and escaped syntax are never rewritten.
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkStringify)
  const tree = processor.parse(markdown)
  const imageReferences = new Set<string>()
  visit(tree, 'imageReference', (node) => {
    imageReferences.add(node.identifier)
  })
  visit(tree, (node) => {
    if (
      node.type === 'image' ||
      node.type === 'link' ||
      node.type === 'definition'
    ) {
      node.url = resolve(
        node.url,
        node.type === 'image' ||
          (node.type === 'definition' && imageReferences.has(node.identifier)),
      )
    }
  })
  return processor.stringify(tree)
}
