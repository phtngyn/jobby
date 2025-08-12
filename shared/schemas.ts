import { z } from 'zod'

export const TypeEnum = z.enum([
  'SELBSTAENDIGKEIT',
  'PRAKTIKUM_TRAINEE',
  'KUENSTLER',
  'AUSBILDUNG',
  'ARBEIT',
])

export const JobtypenEnumSchema = z.enum([
  'Werkstudierendenstelle und HiWi-Stellen',
  'Traineeprogramm',
  'Berufserfahrene',
  'DoktorandInnen',
  'Arbeitsstelle',
  'Duales Studium',
  'MitgründerIn gesucht',
  'Ausbildung',
  'Berufseinstieg nach dem Studium',
  'Nebenjob (fachfremd)',
  'Abschlussarbeit',
  'Praktikum',
])

export const HomeofficeEnumSchema = z.enum([
  '0% Homeoffice',
  '0-49% Homeoffice',
  '50-100% Homeoffice',
  '100% Homeoffice',
])

export const JobSchema = z.object({
  jobId: z.string(),
  angebotstitel: z.string(),
  kurzbeschreibung: z.string(),
  firma: z.string(),
  emailAnsprechpartner: z.email(),
  freigabedatum: z.iso.datetime(),
  arbeitsort: z.string(),
  anzeigeText: z.string(),
  country: z.string(),
  einleitungTitel: z.string().optional().optional(),
  einleitungText: z.string().optional().optional(),
  aufgabenTitel: z.string().optional().optional(),
  aufgabenText: z.string().optional().optional(),
  erwartungenTitel: z.string().optional().optional(),
  erwartungenText: z.string().optional().optional(),
  angebotTitel: z.string().optional().optional(),
  angebotText: z.string().optional().optional(),
  kontaktTitel: z.string().optional().optional(),
  kontaktText: z.string().optional().optional(),
  spracheDeutsch: z.boolean(),
  spracheLand: z.boolean(),
  arbeitszeitMin: z.number().int(),
  arbeitszeitMax: z.number().int(),
  berufsfelder: z.array(z.string()),
  fachbereiche: z.array(z.string()),
  homeoffice: z.array(HomeofficeEnumSchema),
  jobtypen: z.array(JobtypenEnumSchema),
})

export const MetadataSchema = z.object({
  model: z.string().optional(),
  duration: z.number().optional(),
  totalTokens: z.number().optional(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  finishReason: z.string().optional(),
})

export const FilterItemWithChildrenSchema = z.object({
  label: z.string(),
  children: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      checked: z.boolean(),
    }),
  ),
})

export const FilterItemWithoutChildrenSchema = z.object({
  label: z.string(),
  value: z.string(),
  checked: z.boolean(),
})

export const FiltersSchema = z.object({
  search: z.string(),
  worktime: FilterItemWithChildrenSchema,
  duration: FilterItemWithChildrenSchema,
  type: FilterItemWithChildrenSchema,
  homeoffice: FilterItemWithoutChildrenSchema,
})
