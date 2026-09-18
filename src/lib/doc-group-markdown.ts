import type { DocGroup } from '@/data/docs'

export function renderDocGroupMarkdown(
  group: DocGroup,
  siteOrigin = 'https://hulla.dev'
): string {
  const guides = group.entries
    .map(
      (entry) =>
        `- [${entry.title}](${siteOrigin}${entry.href}.md): ${entry.description}`
    )
    .join('\n')

  const hasDecisionGuide =
    group.chooserTitle !== undefined &&
    group.entries.every(
      (entry) =>
        entry.chooseWhen !== undefined && entry.applicationOwns !== undefined
    )
  if (!hasDecisionGuide) return `## Guides\n\n${guides}`

  const rows = group.entries
    .map(
      (entry) =>
        `| [${entry.title}](${siteOrigin}${entry.href}.md) | ${entry.chooseWhen} | ${entry.applicationOwns} |`
    )
    .join('\n')

  return `## ${group.chooserTitle}

| ${group.chooserColumnTitle ?? 'Option'} | Choose it when | The application owns |
| --- | --- | --- |
${rows}

## Guides

${guides}`
}
