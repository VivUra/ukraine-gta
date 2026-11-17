import { ref } from 'vue'

// Реактивна змінна поточного користувача (підтягуємо з сесії при завантаженні)
export const currentUser = ref(
  JSON.parse(localStorage.getItem('ugta_current_user')) || null
)

// Отримати список усіх зареєстрованих акаунтів
const getUsers = () => {
  return JSON.parse(localStorage.getItem('ugta_users')) || []
}

// Реєстрація нового акаунта
export const registerUser = (nickname, password) => {
  const cleanNick = nickname.trim()
  if (!cleanNick || !password) {
    throw new Error('Заповніть усі поля.')
  }
  if (cleanNick.length < 3) {
    throw new Error('Нікнейм має містити щонайменше 3 символи.')
  }
  if (password.length < 6) {
    throw new Error('Пароль має містити щонайменше 6 символів.')
  }

  const users = getUsers()
  const exists = users.some(
    (u) => u.nickname.toLowerCase() === cleanNick.toLowerCase()
  )

  if (exists) {
    throw new Error('Гравець із таким нікнеймом вже зареєстрований.')
  }

  const newUser = {
    id: Date.now(),
    nickname: cleanNick,
    password: password,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  localStorage.setItem('ugta_users', JSON.stringify(users))

  // Автоматичний вхід після реєстрації
  const sessionUser = { id: newUser.id, nickname: newUser.nickname }
  localStorage.setItem('ugta_current_user', JSON.stringify(sessionUser))
  currentUser.value = sessionUser
}

// Вхід в існуючий акаунт
export const loginUser = (nickname, password) => {
  const cleanNick = nickname.trim()
  const users = getUsers()

  const user = users.find(
    (u) => u.nickname.toLowerCase() === cleanNick.toLowerCase()
  )

  if (!user) {
    throw new Error('Акаунт з таким нікнеймом не знайдено.')
  }

  if (user.password !== password) {
    throw new Error('Невірний пароль.')
  }

  const sessionUser = { id: user.id, nickname: user.nickname }
  localStorage.setItem('ugta_current_user', JSON.stringify(sessionUser))
  currentUser.value = sessionUser
}

// Вихід з акаунта
export const logoutUser = () => {
  localStorage.removeItem('ugta_current_user')
  currentUser.value = null
}