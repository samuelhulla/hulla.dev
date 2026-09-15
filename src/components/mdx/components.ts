import MH1 from './h1.astro'
import MH2 from './h2.astro'
import MH3 from './h3.astro'
import MH4 from './h4.astro'
import MH5 from './h5.astro'
import MH6 from './h6.astro'
import MP from './p.astro'
import MA from './a.astro'
import MUl from './ul.astro'
import MOl from './ol.astro'
import MLi from './li.astro'
import MBlockquote from './blockquote.astro'
import MHr from './hr.astro'
import MStrong from './strong.astro'
import MEm from './em.astro'
import MTable from './table.astro'
import Code from '@/components/code/code.astro'
import TableHeader from '@/components/table/table-header.astro'
import TableBody from '@/components/table/table-body.astro'
import TableRow from '@/components/table/table-row.astro'
import TableHead from '@/components/table/table-head.astro'
import TableCell from '@/components/table/table-cell.astro'
export const components = {
  h1: MH1,
  h2: MH2,
  h3: MH3,
  h4: MH4,
  h5: MH5,
  h6: MH6,
  p: MP,
  a: MA,
  ul: MUl,
  ol: MOl,
  li: MLi,
  blockquote: MBlockquote,
  hr: MHr,
  strong: MStrong,
  em: MEm,
  table: MTable,
  code: Code,
  thead: TableHeader,
  tbody: TableBody,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
}
