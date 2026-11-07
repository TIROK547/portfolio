'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

type Option = { value: string; label: string }

export default function TerminalSelect({
  label,
  value,
  options: allOptions,
  onChange,
  disabled = false,
  admin = false,
  hideLabel = false,
  editable = false,
  placeholder,
  maxLength,
}: {
  disabled?: boolean
  admin?: boolean
  hideLabel?: boolean
  editable?: boolean
  placeholder?: string
  maxLength?: number
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement | HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const search = useRef({ text: '', time: 0 })
  const [isOpen, setOpen] = useState(false)
  const open = isOpen && !disabled
  const options = editable
    ? allOptions.filter((option) =>
        option.label.toLowerCase().includes(value.toLowerCase()),
      )
    : allOptions
  const [active, setActive] = useState(0)
  const selected = options.findIndex((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  useEffect(() => {
    if (open)
      list.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function show(index = Math.max(0, selected)) {
    if (disabled) return
    setActive(index)
    search.current = { text: '', time: 0 }
    setOpen(true)
  }

  function choose(index: number) {
    if (disabled || trigger.current?.matches(':disabled') || !options[index])
      return
    onChange(options[index].value)
    setOpen(false)
    trigger.current?.focus()
  }

  function keyDown(event: KeyboardEvent<HTMLButtonElement | HTMLInputElement>) {
    if (disabled) return
    const last = options.length - 1
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault()
        if (!options.length) return
        if (!open)
          show(selected < 0 ? (event.key === 'ArrowUp' ? last : 0) : selected)
        else
          setActive(
            (index) =>
              (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) %
              options.length,
          )
        return
      case 'Home':
      case 'End':
        if (editable || !options.length) return
        event.preventDefault()
        show(event.key === 'Home' ? 0 : last)
        return
      case 'Enter':
      case ' ':
        if (editable && (event.key === ' ' || !open)) return
        event.preventDefault()
        if (open) choose(active)
        else show()
        return
      case 'Escape':
        if (open) {
          event.preventDefault()
          event.stopPropagation()
          setOpen(false)
        }
        return
      case 'Tab':
        setOpen(false)
        return
    }
    if (
      !editable &&
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault()
      const now = Date.now()
      const text =
        (now - search.current.time > 600 ? '' : search.current.text) +
        event.key.toLowerCase()
      search.current = { text, time: now }
      const query = [...text].every((char) => char === text[0]) ? text[0] : text
      const from = open ? active : selected
      for (let offset = 1; offset <= options.length; offset++) {
        const index = (from + offset + options.length) % options.length
        if (options[index].label.toLowerCase().startsWith(query)) {
          setActive(index)
          setOpen(true)
          break
        }
      }
    }
  }

  return (
    <div
      ref={root}
      className={`relative min-w-0 text-xs ${admin ? 'dark' : ''} ${hideLabel ? 'min-w-[10rem]' : 'space-y-2'}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false)
      }}
    >
      <span
        id={`${id}-label`}
        className={
          hideLabel
            ? 'sr-only'
            : admin
              ? 'block text-terminal-accent-cyan'
              : 'block opacity-60'
        }
      >
        {label}
      </span>
      {editable ? (
        <input
          ref={(element) => {
            trigger.current = element
          }}
          type="text"
          role="combobox"
          aria-labelledby={`${id}-label`}
          aria-expanded={open}
          aria-controls={open ? `${id}-list` : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            open && options[active] ? `${id}-option-${active}` : undefined
          }
          className="adm-input"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete="off"
          onFocus={() => show()}
          onClick={() => {
            if (!open) show()
          }}
          onChange={(event) => {
            onChange(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onKeyDown={keyDown}
        />
      ) : (
        <button
          ref={(element) => {
            trigger.current = element
          }}
          type="button"
          role="combobox"
          aria-labelledby={`${id}-label`}
          aria-expanded={open}
          aria-controls={open ? `${id}-list` : undefined}
          aria-haspopup="listbox"
          aria-activedescendant={open ? `${id}-option-${active}` : undefined}
          disabled={disabled || !options.length}
          onClick={() => (open ? setOpen(false) : show())}
          onKeyDown={keyDown}
          className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left text-sm transition-colors ${admin ? 'bg-black/20 text-terminal-text-dark' : ''} focus-visible:outline-none focus-visible:border-terminal-accent-cyan/60 disabled:opacity-40 ${open ? 'border-terminal-accent-cyan/40' : 'border-terminal-text-light/20 dark:border-terminal-text-dark/20 hover:border-terminal-accent-cyan/40'}`}
        >
          <span className="truncate">{options[selected]?.label ?? value}</span>
          <span
            aria-hidden="true"
            className="shrink-0 text-xs text-terminal-accent-cyan/70"
          >
            {open ? '[-]' : '[+]'}
          </span>
        </button>
      )}
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute left-0 right-0 top-full z-30 !mt-1 max-h-64 overflow-y-auto overscroll-contain border border-terminal-text-light/20 dark:border-terminal-text-dark/20 bg-terminal-bg-light dark:bg-terminal-bg-dark py-1 shadow-lg shadow-black/10"
        >
          {editable && options.length === 0 && (
            <li role="presentation" className="px-3 py-2 text-xs opacity-60">
              {value
                ? 'New category — saved with your post'
                : 'Type a new category'}
            </li>
          )}
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              onPointerMove={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              className={`flex cursor-pointer items-start gap-2 px-3 py-2 text-sm ${active === index ? 'bg-terminal-accent-cyan/10 text-terminal-accent-cyan' : 'text-terminal-text-light dark:text-terminal-text-dark'}`}
            >
              <span
                aria-hidden="true"
                className="w-3 shrink-0 text-terminal-accent-cyan"
              >
                {active === index ? '>' : ' '}
              </span>
              <span className="min-w-0 flex-1 break-words">{option.label}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-xs text-terminal-accent-green"
              >
                {option.value === value ? '*' : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
