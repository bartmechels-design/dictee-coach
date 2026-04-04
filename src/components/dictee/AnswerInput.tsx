'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export type AnswerInputHandle = {
  focus: () => void
}

const AnswerInput = forwardRef<AnswerInputHandle, Props>(
  ({ value, onChange, onSubmit, disabled }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }))

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

    function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === 'Enter' && !disabled) onSubmit()
    }

    return (
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Typ het woord..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 rounded-xl border-2 border-slate-300 px-4 py-3 text-xl text-slate-800 focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
        />
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          Controleer
        </button>
      </div>
    )
  }
)

AnswerInput.displayName = 'AnswerInput'
export default AnswerInput
