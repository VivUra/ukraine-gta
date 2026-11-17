import { ref } from 'vue'
import { db } from './firebase.js'
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'

export const currentUser = ref(
  JSON.parse(localStorage.getItem('ugta_current_user')) || null
)

const saveSession = (userObj) => {
  localStorage.setItem('ugta_current_user', JSON.stringify(userObj))
  currentUser.value = userObj
}

export const registerUser = async (nickname, password) => {
  const cleanNick = nickname.trim()
  if (!cleanNick || !password) throw new Error('Заповніть усі поля.')
  if (cleanNick.length < 3) throw new Error('Нікнейм має містити щонайменше 3 символи.')
  if (password.length < 6) throw new Error('Пароль має містити щонайменше 6 символів.')

  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('nicknameLower', '==', cleanNick.toLowerCase()))
  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    throw new Error('Гравець із таким нікнеймом вже існує.')
  }

  const newUserData = {
    nickname: cleanNick,
    nicknameLower: cleanNick.toLowerCase(),
    password: password,
    role: 'player',
    title: 'Гравець UKRAINE GTA',
    avatarUrl: '',
    status: '',
    signature: '',
    about: '',
    reactions: 0,
    points: 10,
    createdAt: new Date().toLocaleString('uk-UA')
  }

  const docRef = await addDoc(usersRef, newUserData)
  saveSession({ id: docRef.id, ...newUserData })
}

export const loginUser = async (nickname, password) => {
  const cleanNick = nickname.trim()
  const usersRef = collection(db, 'users')

  const q = query(usersRef, where('nicknameLower', '==', cleanNick.toLowerCase()))
  const snapshot = await getDocs(q)

  if (snapshot.empty) throw new Error('Акаунт з таким нікнеймом не знайдено.')

  const userDoc = snapshot.docs[0]
  const userData = userDoc.data()

  if (userData.password !== password) throw new Error('Невірний пароль.')

  saveSession({
    id: userDoc.id,
    nickname: userData.nickname,
    role: userData.role || 'player',
    title: userData.title || (userData.role === 'admin' ? 'Адміністратор UKRAINE GTA' : 'Гравець UKRAINE GTA'),
    avatarUrl: userData.avatarUrl || '',
    status: userData.status || '',
    signature: userData.signature || '',
    about: userData.about || '',
    reactions: userData.reactions || 0,
    points: userData.points || 10
  })
}

// Оновлення профілю (статус, аватар, підпис, звання, інформація)
export const updateUserProfile = async (updates) => {
  if (!currentUser.value?.id) return
  const userRef = doc(db, 'users', currentUser.value.id)
  await updateDoc(userRef, updates)

  saveSession({
    ...currentUser.value,
    ...updates
  })
}

// Зміна пароля в базі Firebase
export const changeUserPassword = async (oldPassword, newPassword) => {
  if (!currentUser.value?.id) return
  if (newPassword.length < 6) throw new Error('Новий пароль має бути не коротшим за 6 символів.')

  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('nicknameLower', '==', currentUser.value.nickname.toLowerCase()))
  const snapshot = await getDocs(q)

  if (snapshot.empty) throw new Error('Користувача не знайдено.')
  const userData = snapshot.docs[0].data()

  if (userData.password !== oldPassword) {
    throw new Error('Поточний пароль введено невірно.')
  }

  await updateDoc(doc(db, 'users', currentUser.value.id), {
    password: newPassword
  })
}

export const logoutUser = () => {
  localStorage.removeItem('ugta_current_user')
  currentUser.value = null
}