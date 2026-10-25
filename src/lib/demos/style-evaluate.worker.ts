import { evaluateStyle } from './evaluate-style'

self.onmessage = (
  event: MessageEvent<{ revision: number; source: string; benchmark: boolean }>
) => {
  const { revision, source, benchmark } = event.data
  self.postMessage({ revision, started: true })
  try {
    self.postMessage({ revision, output: evaluateStyle(source, benchmark) })
  } catch (error) {
    self.postMessage({
      revision,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
