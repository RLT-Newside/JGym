// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { type InputHTMLAttributes, type TextareaHTMLAttributes, useId } from 'react'

type CommonProps = { label?: string; error?: string }
type Props =
  | (CommonProps & { multiline?: false } & InputHTMLAttributes<HTMLInputElement>)
  | (CommonProps & { multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>)

/** Labeled input/textarea sharing the `.field` class. Wires htmlFor/id for a11y
 *  and renders an optional field-level error linked via aria-describedby. */
export function FormField(props: Props) {
  const autoId = useId()
  const errorId = `${autoId}-error`

  if (props.multiline) {
    const { label, error, multiline: _multiline, className = '', id, ...rest } = props
    const fieldId = id ?? autoId
    return (
      <div>
        {label && (
          <label htmlFor={fieldId} className="label-caption block mb-1">
            {label}
          </label>
        )}
        <textarea
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`field resize-none ${className}`}
          {...rest}
        />
        {error && (
          <p id={errorId} className="text-xs text-red-400 mt-1">
            {error}
          </p>
        )}
      </div>
    )
  }

  const { label, error, multiline: _multiline, className = '', id, ...rest } = props
  const fieldId = id ?? autoId
  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="label-caption block mb-1">
          {label}
        </label>
      )}
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`field ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-400 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
