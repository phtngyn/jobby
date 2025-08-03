import { generateObject, generateText, tool } from 'ai'
import { z } from 'zod'
import { LIGHT_MODEL, TABLE_FILTER_SYNONYM } from '~~/shared/constants'
import { FilterEnum } from '~~/shared/schemas'
import { provider } from '../llm'

export const FindFilterOutputSchema = z.object({
  added: z.array(FilterEnum),
  removed: z.array(FilterEnum),
  results: z.array(FilterEnum),
  summary: z.string(),
})

export const find_filter = tool({
  description: 'Extracts job-search filters from a user query, identifying which filters to add or remove.',
  inputSchema: z.object({
    input: z.string().describe(`The user's free-text query, which may include filter requests or modifications`),
    currentFilters: z.array(FilterEnum).nullable().optional().describe('Currently active filters, if any'),
  }),
  outputSchema: FindFilterOutputSchema,
  async execute(params) {
    const currentFilters = params.currentFilters ?? []

    const { object } = await generateObject({
      model: provider(LIGHT_MODEL),
      schema: FindFilterOutputSchema,
      output: 'object',
      prompt: `
You are a precise job-search filter extraction system. Your task is to identify filters in the user's query.

## AVAILABLE FILTERS
You must ONLY use these exact filter values:
${Object.keys(TABLE_FILTER_SYNONYM).map(filter => `- ${filter}`).join('\n')}

## FILTER SYNONYMS
These are known synonyms for each filter:
${Object.entries(TABLE_FILTER_SYNONYM)
  .map(([filter, synonyms]) => `- ${filter}: ${synonyms.join(', ')}`)
  .join('\n')}

## CURRENT FILTERS
The user currently has these filters active:
${currentFilters.length > 0 ? currentFilters.join(', ') : 'No active filters'}

## INSTRUCTIONS
1. Analyze the query to identify which filters should be added or removed
2. For negations like "no remote" or "exclude part-time", add the opposite filter or remove the mentioned filter
3. If the user wants to clear/reset filters, remove all current filters
4. If the query is ambiguous about a filter, do not include it

## USER QUERY
"${params.input.trim()}"

## OUTPUT REQUIREMENTS
- added: Filters that should be newly applied based on the query
- removed: Filters that should be removed based on the query
- results: The final set of filters after applying additions and removals to current filters
- Do not add a filter that's already in currentFilters
- Do not remove a filter that's not in currentFilters
`,
    })

    const calculatedResults = [
      ...currentFilters.filter(filter => !object.removed.includes(filter)),
      ...object.added.filter(filter => !currentFilters.includes(filter)),
    ]

    const finalObject = {
      ...object,
      results: calculatedResults,
    }

    const { text } = await generateText({
      model: provider(LIGHT_MODEL),
      prompt: `
You are a helpful job search assistant explaining filter changes to a user.

## FILTER CHANGES
${JSON.stringify({
  added: finalObject.added,
  removed: finalObject.removed,
  currentFilters,
  newFilters: finalObject.results,
})}

## INSTRUCTIONS
Write a brief, friendly summary (1-2 sentences) explaining what filters were added or removed.
- If filters were added: "I've added [filters] to your search."
- If filters were removed: "I've removed [filters] from your search."
- If both: "I've added [filters] and removed [filters] from your search."
- If no changes: "Your search filters remain unchanged."
- If all filters cleared: "I've cleared all your search filters."

Use natural language (e.g., "full-time positions" instead of "FULLTIME").
Be conversational and helpful.
Keep it concise - no more than 2 sentences.
`,
    })

    return { ...finalObject, summary: text.trim() }
  },
})
