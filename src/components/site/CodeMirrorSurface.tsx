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

// CodeMirror owns editing behavior; the surrounding UI is composed from @hulla/ui.
export default function CodeMirrorSurface(props: {
  value: string
  onChange?: (value: string) => void
  label: string
  language?: 'typescript' | 'json' | 'text'
  height?: number
  readOnly?: boolean
  selection?: { start: number; length: number }
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
              color: 'var(--hulla-code-foreground)',
              backgroundColor: 'var(--hulla-code-background)',
              fontSize: '0.8125rem',
            },
            '&.cm-focused': {
              outline: '2px solid var(--color-focus-ring)',
              outlineOffset: '-2px',
            },
            '.cm-scroller': {
              fontFamily: 'var(--font-mono)',
              lineHeight: '24px',
              height: `${props.height ?? 300}px`,
              overflow: 'auto',
            },
            '.cm-content': {
              padding: '16px 0',
              caretColor: 'var(--color-foreground)',
            },
            '.cm-line': { padding: '0 16px 0 0' },
            '.cm-gutters': {
              backgroundColor: 'transparent',
              color:
                'color-mix(in oklab, var(--color-muted-foreground) 70%, transparent)',
              border: 'none',
            },
            '.cm-lineNumbers .cm-gutterElement': {
              minWidth: '3ch',
              boxSizing: 'content-box',
              padding: '0 20px 0 18px',
            },
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
                tag: tags.keyword,
                color: 'var(--hulla-code-token-keyword)',
              },
              {
                tag: [tags.string, tags.special(tags.string)],
                color: 'var(--hulla-code-token-string)',
              },
              {
                tag: [
                  tags.number,
                  tags.bool,
                  tags.null,
                  tags.definition(tags.variableName),
                  tags.standard(tags.typeName),
                ],
                color: 'var(--hulla-code-token-constant)',
              },
              { tag: tags.comment, color: 'var(--hulla-code-token-comment)' },
              {
                tag: [tags.operator, tags.punctuation, tags.typeName],
                color: 'var(--hulla-code-token-punctuation)',
              },
              {
                tag: [tags.function(tags.variableName)],
                color: 'var(--hulla-code-token-function)',
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
  createEffect(() => {
    const selection = props.selection
    if (!ready() || !view || !selection) return
    const editor = view
    const frame = requestAnimationFrame(() => {
      const from = Math.max(
        0,
        Math.min(editor.state.doc.length, selection.start)
      )
      const to = Math.min(editor.state.doc.length, from + selection.length)
      editor.dispatch({
        selection: { anchor: from, head: to },
        scrollIntoView: true,
      })
      editor.focus()
    })
    onCleanup(() => cancelAnimationFrame(frame))
  })
  onCleanup(() => view?.destroy())
  return (
    <div data-demo-editor-surface>
      <Show when={!ready()}>
        <pre
          class="m-0 overflow-auto bg-[var(--hulla-code-background)] p-4 font-mono text-[0.8125rem] leading-6 text-[var(--hulla-code-foreground)]"
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
