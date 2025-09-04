import { generateObject } from 'ai'
import { z } from 'zod'
import { DEFAULT_FILTER, JOB_WORKINGTIMES, LIGHT_MODEL } from '~~/shared/constants'
import { FiltersSchema } from '~~/shared/schemas'
import { provider } from '../ai/llm'

export default defineEventHandler(async (event) => {
  const { prompt, history, filters } = await readValidatedBody(
    event,
    z.object({
      prompt: z.string().trim().nonempty(),
      history: z.array(z.string()).min(1),
      filters: FiltersSchema.omit({ search: true }),
    }).parse,
  )

  const system = `
You are a precise filter extractor AI. Your task is to analyze the user's current prompt and convert it into structured job filters based on the provided schema. Output ONLY a JSON object that strictly matches the schema—no explanations, no extra text.

Rules:
1. Prioritize the CURRENT PROMPT above all else. Use history and previous filters only for context—do not let them override explicit details in the current prompt.
2. Merging and Conflict Resolution:
   - MERGE by default: Add new values from the current prompt to existing filters without removing old ones (e.g., if previous has "IT Beratung" and prompt adds "Softwareentwicklung", include both).
   - OVERRIDE if prompt uses words like "change to", "only", "instead", "just", "switch to": Replace values in that specific dimension (e.g., "change to only remote jobs" overrides homeoffices).
   - RESET if prompt uses "remove all filters", "reset filters", "forget everything", "start over": Return the default filters: ${JSON.stringify(DEFAULT_FILTER, null, 2)}.
   - REMOVE specific filters if explicitly stated (e.g., "remove IT fields" clears the fields array for that category).
   - Do NOT remove or alter existing filters unless explicitly instructed in the current prompt.
3. Field-Specific Mapping:
   - Remote/work-from-home (e.g., "remote jobs", "home office", "telecommute"): Map ONLY to 'homeoffices' (e.g., "fully remote" -> ["100% Homeoffice"]).
   - Working times: Interpret as hours/week (e.g., "part-time" -> [0, 30]; "full-time" -> [35, 60]). Always ensure min <= max and within 0-60.
   - For categories, types, fields: Match closely to allowed values. If no exact match, omit or use the closest logical fit—do not invent new ones.
   - Ignore irrelevant details (e.g., location like "Berlin" goes to search, not filters).
4. Handle Ambiguities:
   - If prompt is vague (e.g., "tech jobs"), map to the most relevant fields/categories based on context/history.
   - Typos or synonyms: Normalize (e.g., "homeoffice" -> "homeoffices"; "internship" -> "Praktikum").
   - If no changes needed, return previous filters unchanged.
5. Step-by-Step Reasoning (think internally, do not output):
   - Step 1: Parse current prompt for new filter mentions.
   - Step 2: Compare with previous filters and history for merges/overrides.
   - Step 3: Apply rules and map to schema values.
   - Step 4: Validate output against schema.

Output strictly as a JSON object matching the schema.
`

  const _prompt = `
Task: Based on the system rules, extract structured filters from the current user prompt. Merge with previous filters, using history for context only where needed. Output ONLY the JSON object matching the schema.

---

Context Details:

- Previous Filters (merge into these unless overridden):
${JSON.stringify(filters, null, 2)}

- Recent User Input History (last 10 entries; use for context and intent inference, but prioritize current prompt):
${JSON.stringify(history.slice(-10), null, 2)}

- Current User Prompt (highest priority; analyze this for new filters, overrides, or resets):
${prompt}

---

Apply the rules: Prioritize current prompt, merge by default, override on explicit instructions, reset if requested. Map inputs accurately to allowed schema values.
`

  const { object } = await generateObject({
    model: provider(LIGHT_MODEL),
    schema: FiltersSchema.omit({ search: true }),
    output: 'object',
    system,
    prompt: _prompt,
  })

  if (object?.workingtimes?.length) {
    const times = object.workingtimes.flatMap(x => Number.isInteger(x) ? [x] : [])
    object.workingtimes = (() => {
      if (times.length === 1)
        return [times[0], JOB_WORKINGTIMES.max]
      return times
    })()
  }

  return object
})
