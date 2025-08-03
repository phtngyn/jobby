import type { Filter, Model } from './types'

export const LIGHT_MODEL = 'gemini-1.5-flash'

export const MODELS: Model[] = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
]

export const CHAT_CONFIG_COOKIE = 'chat-config'
export const DEFAULT_CHAT_CONFIG = { model: LIGHT_MODEL, search: false }

export const TABLE_COLUMN_VISIBILITY_COOKIE = 'table-column-visibility'
export const DEFAULT_TABLE_COLUMN_VISIBILITY = {
  id: false,
  title: true,
  occupation: false,
  type: true,
  worktime: true,
  duration: true,
  description: false,
  homeoffice: false,
  supervised: true,
  salary: false,
  employer: true,
  street: false,
  city: false,
  zip: false,
  region: false,
  country: false,
  modifiedAt: true,
}

export const TALBE_FILTER_COOKIE = 'table-filter'
export const TABLE_FILTER_DEFAULT = {
  type: [
    { label: 'SELBSTAENDIGKEIT', enable: false, value: 'SELBSTAENDIGKEIT' },
    { label: 'PRAKTIKUM_TRAINEE', enable: false, value: 'PRAKTIKUM_TRAINEE' },
    { label: 'KUENSTLER', enable: false, value: 'KUENSTLER' },
    { label: 'AUSBILDUNG', enable: false, value: 'AUSBILDUNG' },
  ],
  worktime: [
    { label: 'FULLTIME', enable: false, value: 'FULLTIME' },
    { label: 'PARTTIME', enable: false, value: 'PARTTIME' },
  ],
  homeoffice: [
    { label: 'HOMEOFFICE', enable: false, value: true },
    { label: 'NO HOMEOFFICE', enable: false, value: false },
  ],
  duration: [
    { label: 'BEFRISTET', enable: false, value: 'BEFRISTET' },
    { label: 'UNBEFRISTET', enable: false, value: 'UNBEFRISTET' },
  ],
  supervised: [
    { label: 'SUPERVISED', enable: false, value: true },
    { label: 'NO SUPERVISED', enable: false, value: false },
  ],
  modifiedAt: [
    { label: 'IN 7 DAYS', enable: false, value: 7 },
    { label: 'IN A MONTH', enable: false, value: 30 },
  ],
}
export const TABLE_FILTER_SYNONYM: Record<Filter, string[]> = {
  'SELBSTAENDIGKEIT': ['selbstständig', 'freelance', 'freiberuflich'],
  'PRAKTIKUM_TRAINEE': ['praktikum', 'trainee', 'werkstudent'],
  'KUENSTLER': ['künstler', 'artist', 'creative'],
  'AUSBILDUNG': ['ausbildung', 'lehre', 'dual studies'],
  'FULLTIME': ['vollzeit', 'full-time', '40h'],
  'PARTTIME': ['teilzeit', 'part-time', '20h', 'minijob'],
  'HOMEOFFICE': ['homeoffice', 'remote', 'home office'],
  'BEFRISTET': ['befristet', 'temporary', 'contract'],
  'UNBEFRISTET': ['unbefristet', 'permanent', 'unlimited'],
  'SUPERVISED': ['betreut', 'supervised', 'assistiert'],
  'IN 7 DAYS': ['in 7 tagen', 'next week'],
  'IN A MONTH': ['in einem monat', 'next month'],
}
