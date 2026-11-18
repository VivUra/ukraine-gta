// Основна ієрархія посад (1..11) — визначає права доступу та фірмові стилі зі style.css
export const ROLES_HIERARCHY = [
  { id: 'player', label: 'Гравець', level: 1, cssClass: 'role-player' },
  { id: 'moderator', label: 'Модератор', level: 2, cssClass: 'role-moderator' },
  { id: 'sr_moderator', label: 'Старший модератор', level: 3, cssClass: 'role-sr-moderator' },
  { id: 'jr_admin', label: 'Мол. Адміністратор', level: 4, cssClass: 'role-jr-admin' },
  { id: 'admin', label: 'Адміністратор', level: 5, cssClass: 'role-admin' },
  { id: 'sr_admin', label: 'Ст. Адміністратор', level: 6, cssClass: 'role-sr-admin' },
  { id: 'curator', label: 'КА — Куратор адміністрації', level: 7, cssClass: 'role-ka' },
  { id: 'zga', label: 'ЗГА — Заст. Головного Адміністратора', level: 8, cssClass: 'role-zga' },
  { id: 'ga', label: 'ГА — Головний Адміністратор', level: 9, cssClass: 'role-ga' },
  { id: 'dev', label: 'Розробник', level: 10, cssClass: 'role-dev' },
  { id: 'developer', label: 'Головний Розробник', level: 11, cssClass: 'role-lead-dev' }
]

const LEGACY_ROLE_ALIASES = {
  senior_moderator: 'sr_moderator',
  junior_admin: 'jr_admin',
  senior_admin: 'sr_admin',
  ka: 'curator',
  deputy_ga: 'zga',
  chief_admin: 'ga',
  spec_admin: 'dev',
  special_admin: 'dev',
  lead_dev: 'developer',
  head_dev: 'developer',
  main_developer: 'developer',
  owner: 'developer',
  creator: 'developer',
  'Головний розробник': 'developer',
  'Головний Розробник': 'developer'
}

// Незалежні статусні ролі (без привілеїв, відображаються як додаткові анімовані плашки)
export const EXTRA_BADGE_ROLES = [
  {
    id: 'blogger',
    label: 'Блогер',
    cssClass: 'ugta-badge-blogger'
  },
  {
    id: 'donater',
    label: 'Донатер',
    cssClass: 'ugta-badge-donater'
  }
]

export const getRoleInfo = (roleId) => {
  if (!roleId) return ROLES_HIERARCHY[0]
  const normalizedId = LEGACY_ROLE_ALIASES[roleId] || roleId
  return ROLES_HIERARCHY.find((r) => r.id === normalizedId) || ROLES_HIERARCHY[0]
}

export const getRoleLevel = (roleId) => {
  return getRoleInfo(roleId).level
}

export const getExtraBadgeInfo = (badgeId) => {
  return EXTRA_BADGE_ROLES.find((b) => b.id === badgeId) || null
}