export const ROLES_LIST = [
    { key: 'player', level: 1, label: 'Гравець', cssClass: 'role-player' },
    { key: 'moderator', level: 2, label: 'Модератор', cssClass: 'role-moderator' },
    { key: 'sr_moderator', level: 3, label: 'Старший модератор', cssClass: 'role-sr-moderator' },
    { key: 'jr_admin', level: 4, label: 'Мол.Адміністратор', cssClass: 'role-jr-admin' },
    { key: 'admin', level: 5, label: 'Адміністратор', cssClass: 'role-admin' },
    { key: 'sr_admin', level: 6, label: 'Старший Адміністратор', cssClass: 'role-sr-admin' },
    { key: 'ka', level: 7, label: 'Куратор Адміністрації', cssClass: 'role-ka' },
    { key: 'zga', level: 8, label: 'ЗГА', cssClass: 'role-zga' },
    { key: 'ga', level: 9, label: 'ГА', cssClass: 'role-ga' },
    { key: 'dev', level: 10, label: 'Розробник', cssClass: 'role-dev' },
    { key: 'lead_dev', level: 11, label: 'Головний розробник', cssClass: 'role-lead-dev' }
  ]
  
  export const getRoleInfo = (roleKey) => {
    return ROLES_LIST.find((r) => r.key === roleKey) || ROLES_LIST[0]
  }
  
  export const getRoleLevel = (roleKey) => {
    return getRoleInfo(roleKey).level
  }