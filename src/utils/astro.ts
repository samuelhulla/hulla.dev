import { entries, keys } from './objects'

type MappedData<Data extends Record<string, unknown>> = {
  [K in keyof Data as `data-${string & K}`]: Data[K]
} & {
  _keys: string[]
}

export function setData<Data extends Record<string, unknown>>(data: Data) {
  return entries({ ...data, __keys: keys(data).join(',') }).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`data-${key as string}`]: value,
    }),
    {} as MappedData<Data>
  )
}

export function getData(element: HTMLElement, ...keys: string[]) {
  const properties =
    // @ts-expect-error we're acessing an unindexed property
    (keys.length && keys) || element.dataset['__keys'].split(',')
  if (!properties || properties.length === 0) {
    console.error(
      'No data keys found, use the setData function to set them or specify them explicitly'
    )
  }
  return properties.reduce(
    (acc, prop) => ({ ...acc, [prop]: element.dataset[prop] }),
    {} as { [K in (typeof properties)[number]]: string | undefined }
  )
}
