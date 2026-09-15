import type { JSX } from 'solid-js'

type IconProps = JSX.SvgSVGAttributes<SVGSVGElement>

const defaults: IconProps = {
  fill: 'none',
  height: 24,
  stroke: 'currentColor',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': 2,
  viewBox: '0 0 24 24',
  width: 24,
}

// Exact Lucide icon geometry, kept local because this Solid island is
// server-rendered by Astro and lucide-solid currently ships a client-only ESM
// entry. Astro-rendered documentation icons use @lucide/astro directly.
export function SearchIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  )
}

export function FileTextIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}

export function CornerDownLeftIcon(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
      <path d="m9 10-5 5 5 5" />
    </svg>
  )
}
