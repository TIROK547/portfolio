'use client'
import { useState } from 'react'
import type { ProjectImage } from '@/lib/db'

export default function ProjectGallery({
  images,
  name,
}: {
  images: ProjectImage[]
  name: string
}) {
  const [selected, setSelected] = useState(0)
  if (!images.length) return null
  const current = images[selected]
  return (
    <section aria-label="Project gallery" className="space-y-3 my-8">
      <figure className="border border-terminal-text-light/20 dark:border-terminal-text-dark/20 bg-black/10">
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open full-size image"
        >
          <img
            src={current.url}
            alt={current.alt || `${name} ${current.kind}`}
            className={`w-full max-h-[560px] object-contain ${current.kind === 'logo' ? 'p-12 h-72' : ''}`}
          />
        </a>
        <figcaption className="p-3 border-t border-terminal-text-light/20 dark:border-terminal-text-dark/20 text-xs flex justify-between gap-4">
          <span>{current.alt || `${name} ${current.kind}`}</span>
          <span className="shrink-0 opacity-50">
            {selected + 1} / {images.length}
          </span>
        </figcaption>
      </figure>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              aria-label={`Show ${img.alt || `image ${index + 1}`}`}
              aria-pressed={selected === index}
              className={`shrink-0 border p-1 ${selected === index ? 'border-terminal-accent-cyan/50' : 'border-transparent opacity-60'}`}
            >
              <img
                src={img.url}
                alt=""
                loading="lazy"
                className="w-24 h-16 object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
