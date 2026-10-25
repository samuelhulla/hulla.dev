import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
  untrack,
} from 'solid-js'
import { EditorState } from '@codemirror/state'
import {
  EditorView,
  drawSelection,
  keymap,
  lineNumbers,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import {
  HighlightStyle,
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import { setDiagnostics, type Diagnostic } from '@codemirror/lint'
import { tags } from '@lezer/highlight'

// There is no editable-code primitive in the installed UI registry. This site
// adapter uses CodeMirror's editing behavior and the existing code-block tokens.
export default function DemoEditor(props: {
  value: string
  onChange?: (value: string) => void
  label: string
  filename: string
  language?: 'typescript' | 'json' | 'text'
  height?: number
  readOnly?: boolean
  diagnostics?: readonly { start?: number; length?: number; message: string }[]
}) {
  let element!: HTMLDivElement
  let view: EditorView | undefined
  let external = false
  const [ready, setReady] = createSignal(false)
  onMount(() => {
    view = new EditorView({
      parent: element,
      state: EditorState.create({
        doc: props.value,
        extensions: [
          props.language === 'json'
            ? json()
            : props.language === 'text'
              ? []
              : javascript({ typescript: true, jsx: true }),
          lineNumbers(),
          history(),
          drawSelection(),
          bracketMatching(),
          indentOnInput(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorState.readOnly.of(!!props.readOnly),
          EditorView.editable.of(!props.readOnly),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({
            'aria-label': props.label,
            'aria-multiline': 'true',
            spellcheck: 'false',
          }),
          EditorState.changeFilter.of(
            (transaction) => transaction.newDoc.length <= 30000
          ),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !external)
              untrack(() => props.onChange?.(update.state.doc.toString()))
          }),
          EditorView.theme({
            '&': {
              color: 'var(--color-foreground)',
              backgroundColor: 'var(--color-surface-raised)',
              fontSize: '14px',
            },
            '&.cm-focused': {
              outline: '2px solid var(--color-focus-ring)',
              outlineOffset: '-2px',
            },
            '.cm-scroller': {
              fontFamily: 'var(--font-mono)',
              lineHeight: '1.65',
              height: `${props.height ?? 300}px`,
              overflow: 'auto',
            },
            '.cm-content': {
              padding: '16px 0',
              caretColor: 'var(--color-foreground)',
            },
            '.cm-line': { padding: '0 16px 0 8px' },
            '.cm-gutters': {
              backgroundColor: 'transparent',
              color: 'var(--color-muted-foreground)',
              border: 'none',
              fontSize: '12px',
            },
            '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 12px' },
            '.cm-cursor': { borderLeftColor: 'var(--color-foreground)' },
            '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection':
              { backgroundColor: 'var(--color-selected-surface)' },
            '.cm-tooltip': {
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-foreground)',
              border: '1px solid var(--color-border)',
            },
            '.cm-diagnostic': { fontSize: '14px', lineHeight: '1.6' },
            '.cm-diagnostic-error': { borderLeftColor: 'var(--color-danger)' },
          }),
          syntaxHighlighting(
            HighlightStyle.define([
              {
                tag: [tags.keyword, tags.operator],
                color: 'var(--color-primary-text)',
              },
              {
                tag: [tags.string, tags.special(tags.string)],
                color: 'var(--color-success)',
              },
              { tag: [tags.number, tags.bool], color: 'var(--color-warning)' },
              { tag: [tags.comment], color: 'var(--color-muted-foreground)' },
              {
                tag: [tags.function(tags.variableName)],
                color: 'var(--color-primary-text)',
              },
            ])
          ),
        ],
      }),
    })
    setReady(true)
  })
  createEffect(() => {
    const value = props.value
    if (!ready() || !view || value === view.state.doc.toString()) return
    external = true
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    })
    external = false
  })
  createEffect(() => {
    const errors = props.diagnostics ?? []
    if (!ready() || !view) return
    const max = view.state.doc.length
    const diagnostics: Diagnostic[] = errors.map((error) => ({
      from: Math.min(max, error.start ?? 0),
      to: Math.min(max, (error.start ?? 0) + (error.length ?? 1)),
      severity: 'error',
      message: error.message,
    }))
    view.dispatch(setDiagnostics(view.state, diagnostics))
  })
  onCleanup(() => view?.destroy())
  return (
    <div
      class="border-border bg-surface-raised min-w-0 overflow-hidden rounded-md border"
      data-demo-editor>
      <div class="border-border flex min-h-11 items-center justify-between gap-3 border-b px-4 py-2 text-sm">
        <span class="font-mono">{props.filename}</span>
        <span class="text-muted-foreground">
          {props.readOnly ? 'Generated output' : 'Editable'}
        </span>
      </div>
      <Show when={!ready()}>
        <pre
          class="m-0 overflow-auto p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap"
          style={{ 'max-height': `${props.height ?? 300}px` }}
          textContent={props.value}
        />
      </Show>
      <div
        ref={(node) => {
          element = node
        }}
      />
    </div>
  )
}
