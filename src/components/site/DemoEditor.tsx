import type { ComponentProps } from 'solid-js'
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
} from '@/components/code'
import CodeMirrorSurface from './CodeMirrorSurface'
import FileIcon from './FileIcon'

export default function DemoEditor(
  props: ComponentProps<typeof CodeMirrorSurface> & { filename: string }
) {
  return (
    <CodeBlock data-demo-editor>
      <CodeBlockHeader>
        <CodeBlockTitle class="flex items-center gap-2">
          <FileIcon filename={props.filename} language={props.language} />
          <span class="truncate">{props.filename}</span>
        </CodeBlockTitle>
        <CodeBlockActions>
          <span class="text-muted-foreground text-xs">
            {props.readOnly ? 'Generated output' : 'Editable'}
          </span>
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockBody>
        <CodeMirrorSurface {...props} />
      </CodeBlockBody>
    </CodeBlock>
  )
}
