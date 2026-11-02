import { fileIcon } from '@/lib/file-icons'

export default function FileIcon(props: {
  filename?: string
  language?: string
}) {
  return (
    <img
      src={`/file-icons/${fileIcon(props.filename, props.language)}.svg`}
      alt=""
      aria-hidden="true"
      width="14"
      height="14"
      class="size-3.5 shrink-0 object-contain"
      data-file-icon={fileIcon(props.filename, props.language)}
    />
  )
}
