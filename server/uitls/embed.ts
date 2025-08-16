export function chunk(
  text: string,
  max = 400,
  overlap = 50,
): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|\S+/g) || []

  const chunks: string[] = []
  let chunk: string[] = []
  let length = 0

  for (const sentence of sentences) {
    const _tokens = sentence.trim().split(/\s+/)
    const _length = _tokens.length

    if (length + _length > max) {
      if (chunk.length > 0) {
        chunks.push(chunk.join(' ').trim())
      }

      if (chunks.length > 0) {
        const _overlap = chunk.slice(
          Math.max(0, chunk.length - overlap),
        )
        chunk = [..._overlap]
        length = _overlap.length
      }
      else {
        chunk = []
        length = 0
      }
    }

    chunk.push(..._tokens)
    length += _length
  }

  if (chunk.length > 0) {
    chunks.push(chunk.join(' ').trim())
  }

  return chunks
}

export function clean(html: string) {
  if (!html)
    return ''

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\?/g, ' ')
    .replace(/•/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
