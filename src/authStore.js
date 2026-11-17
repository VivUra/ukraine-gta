import { ref } from 'vue'
import { db } from './firebase.js'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'

// Поточна активна сесія гравця
export const currentUser = ref(
  JSON.parse(localStorage.getItem('ugta_current_user')) || null
)

// Реєстрація нового гравця у хмарну базу Firestore
export const registerUser = async (nickname, password) => {
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

  const usersRef = collection(db, 'users')
  
  // Перевіряємо в базі, чи не зайнятий нікнейм
  const q = query(usersRef, where('nicknameLower', '==', cleanNick.toLowerCase()))
  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    throw new Error('Гравець із таким нікнеймом вже існує.')
  }

  // Записуємо нового гравця в базу даних
  const docRef = await addDoc(usersRef, {
    nickname: cleanNick,
    nicknameLower: cleanNick.toLowerCase(),
    password: password,
    role: 'player',
    createdAt: new Date().toLocaleString('uk-UA')
  })

  const sessionUser = { id: docRef.id, nickname: cleanNick, role: 'player' }
  localStorage.setItem('ugta_current_user', JSON.stringify(sessionUser))
  currentUser.value = sessionUser
}

// Вхід гравця з перевіркою по хмарній базі
export const loginUser = async (nickname, password) => {
  const cleanNick = nickname.trim()
  const usersRef = collection(db, 'users')

  const q = query(usersRef, where('nicknameLower', '==', cleanNick.toLowerCase()))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error('Акаунт з таким нікнеймом не знайдено.')
  }

  const userDoc = snapshot.docs[0]
  const userData = userDoc.data()

  if (userData.password !== password) {
    throw new Error('Невірний пароль.')
  }

  const sessionUser = {
    id: userDoc.id,
    nickname: userData.nickname,
    role: userData.role || 'player'
  }
  localStorage.setItem('ugta_current_user', JSON.stringify(sessionUser))
  currentUser.value = sessionUser
}

// Вихід з акаунта
export const logoutUser = () => {
  localStorage.removeItem('ugta_current_user')
  currentUser.value = null
}