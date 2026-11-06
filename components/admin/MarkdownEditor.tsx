'use client'

import { useRef, useState } from 'react'
import Markdown from '@/components/Markdown'

type View = 'write' | 'preview' | 'split'
const toolBtn =
  'px-2 py-1 text-xs border border-terminal-text-dark/20 hover:border-terminal-accent-cyan/50 hover:text-terminal-accent-cyan transition-colors'

/** Shared Markdown authoring surface for posts and project descriptions. */
export default function MarkdownEditor({
  value,
  onChange,
  id,
}: {
  value: string
  onChange: (value: string) => void
  id?: string
}) {
  const [view, setView] = useState<View>('write')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const ta = useRef<HTMLTextAreaElement>(null)
  const imageInput = useRef<HTMLInputElement>(null)
  // execCommand keeps the browser's undo stack intact; setRangeText is the fallback.
  function replaceRange(
    start: number,
    end: number,
    text: string,
    selFrom?: number,
    selTo?: number,
  ) {
    const el = ta.current
    if (!el) return
    el.focus()
    el.setSelectionRange(start, end)
    if (!document.execCommand('insertText', false, text)) {
      el.setRangeText(text, start, end, 'end')
      onChange(el.value)
    }
    const from = selFrom ?? start + text.length
    el.setSelectionRange(from, selTo ?? from)
  }

  function wrap(before: string, after: string, placeholder: string) {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const sel = value.slice(s, e) || placeholder
    replaceRange(
      s,
      e,
      before + sel + after,
      s + before.length,
      s + before.length + sel.length,
    )
  }

  function prefixLines(prefix: string, stripHeading = false) {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const nl = value.indexOf('\n', e)
    const lineEnd = nl === -1 ? value.length : nl
    const block = value
      .slice(lineStart, lineEnd)
      .split('\n')
      .map((l) => prefix + (stripHeading ? l.replace(/^#{1,6}\s+/, '') : l))
      .join('\n')
    replaceRange(lineStart, lineEnd, block)
  }

  function insertBlock(text: string) {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const lead =
      s > 0 && value[s - 1] !== '\n'
        ? '\n\n'
        : s > 0 && value[s - 2] !== '\n'
          ? '\n'
          : ''
    replaceRange(s, e, `${lead}${text}\n`)
  }

  async function upload(file: File): Promise<string | null> {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'upload failed')
      return data.url as string
    } catch (err) {
      setError(err instanceof Error ? err.message : 'upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  async function insertImages(files: File[]) {
    for (const f of files) {
      const url = await upload(f)
      if (url) {
        const alt =
          f.name.replace(/\.[^.]+$/, '').replace(/[[\]]/g, '') || 'image'
        insertBlock(`![${alt}](${url})`)
      }
    }
  }

  const imagesFrom = (list: FileList | null | undefined) =>
    Array.from(list ?? []).filter((f) => f.type.startsWith('image/'))

  const writeHidden = view === 'preview'
  const previewHidden = view === 'write'
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={toolBtn}
          onClick={() => prefixLines('## ', true)}
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          className={toolBtn}
          onClick={() => prefixLines('### ', true)}
          title="Subheading"
        >
          H3
        </button>
        <button
          type="button"
          className={`${toolBtn} font-bold`}
          onClick={() => wrap('**', '**', 'bold')}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          className={`${toolBtn} italic`}
          onClick={() => wrap('*', '*', 'italic')}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          className={toolBtn}
          onClick={() => wrap('`', '`', 'code')}
          title="Inline code"
        >
          {'`c`'}
        </button>
        <button
          type="button"
          className={toolBtn}
          onClick={() => wrap('\n```\n', '\n```\n', 'code')}
          title="Code block"
        >
          {'```'}
        </button>
        <button
          type="button"
          className={toolBtn}
          onClick={() => prefixLines('> ')}
          title="Quote"
        >
          quote
        </button>
        <button
          type="button"
          className={toolBtn}
          onClick={() => prefixLines('- ')}
          title="Bullet list"
        >
          list
        </button>
        <button
          type="button"
          className={toolBtn}
          onClick={() => prefixLines('1. ')}
          title="Numbered list"
        >
          1.
        </button>
        <button
          type="button"
          className={toolBtn}
          onClick={() => wrap('[', '](https://)', 'link text')}
          title="Link"
        >
          link
        </button>
        <button
          type="button"
          className={toolBtn}
          onClick={() => insertBlock('---')}
          title="Divider"
        >
          —
        </button>
        <button
          type="button"
          className={`${toolBtn} text-terminal-accent-green border-terminal-accent-green/40`}
          onClick={() => imageInput.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'uploading…' : 'image'}
        </button>
        <input
          ref={imageInput}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          hidden
          onChange={(e) => {
            void insertImages(imagesFrom(e.target.files))
            e.target.value = ''
          }}
        />

        <div className="ms-auto flex gap-1 text-xs">
          {(['write', 'preview', 'split'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-2 py-1 border ${v === 'split' ? 'hidden lg:block' : ''} ${
                view === v
                  ? 'border-terminal-accent-cyan text-terminal-accent-cyan'
                  : 'border-terminal-text-dark/20'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div
        className={view === 'split' ? 'lg:grid lg:grid-cols-2 lg:gap-4' : ''}
      >
        <textarea
          ref={ta}
          dir="auto"
          id={id}
          aria-label="Markdown content"
          maxLength={200000}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => {
            const imgs = imagesFrom(e.clipboardData.files)
            if (imgs.length) {
              e.preventDefault()
              void insertImages(imgs)
            }
          }}
          onDrop={(e) => {
            const imgs = imagesFrom(e.dataTransfer.files)
            if (imgs.length) {
              e.preventDefault()
              void insertImages(imgs)
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          placeholder={
            'Write in Markdown. Paste or drop images straight in.\n\n## A header\nSome thoughts…'
          }
          className={`adm-input font-mono leading-relaxed min-h-[28rem] h-[70vh] resize-y ${writeHidden ? 'hidden' : ''}`}
          spellCheck
        />
        <div
          className={`border border-terminal-text-dark/20 p-4 min-h-[28rem] max-h-[70vh] overflow-y-auto ${previewHidden ? 'hidden' : ''}`}
        >
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-terminal-text-dark/40">
              Nothing to preview yet.
            </p>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-terminal-accent-red">
          {error}
        </p>
      )}
    </div>
  )
}
