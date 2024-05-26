export function capitalizeFirst(str: string) {
  return `${str[0]?.toLocaleUpperCase()}${str.slice(1)}`
}
