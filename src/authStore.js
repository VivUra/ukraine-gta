import { ref } from 'vue'
import { db } from './firebase.js'
import { collection, addDoc, getDocs, query, where, doc, updateDoc, onSnapshot } from 'firebase/firestore'

export const currentUser = ref(
  JSON.parse(localStorage.getItem('ugta_current_user')) || null
)

const saveSession = (userObj) => {
  localStorage.setItem('ugta_current_user', JSON.stringify(userObj))
  currentUser.value = userObj
}

// Жива синхронізація поточного профілю з Firebase (миттєво оновлює роль, статуси, мут або бан)
export const initCurrentUserSync = () => {
  if (!currentUser.value?.id) return
  onSnapshot(doc(db, 'users', currentUser.value.id), async (snap) => {
    if (snap.exists()) {
      const data = snap.data()
      let activeRole = data.role || 'player'

      // Захист власника проєкту: автоматично повертає Головного Розробника (11/11)
      if (data.nickname?.toLowerCase() === 'yurii_kondratskyi' && activeRole !== 'developer') {
        activeRole = 'developer'
        await updateDoc(doc(db, 'users', snap.id), { role: 'developer' })
      }

      saveSession({
        id: snap.id,
        nickname: data.nickname,
        role: activeRole,
        extraBadges: data.extraBadges || [],
        title: data.title || '',
        avatarUrl: data.avatarUrl || '',
        status: data.status || '',
        signature: data.signature || '',
        about: data.about || '',
        reactions: data.reactions || 0,
        points: data.points || 10,
        muteUntil: data.muteUntil || 0,
        muteReason: data.muteReason || '',
        banUntil: data.banUntil || 0,
        banReason: data.banReason || ''
      })
    }
  })
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

  const initialRole = cleanNick.toLowerCase() === 'yurii_kondratskyi' ? 'developer' : 'player'

  const newUserData = {
    nickname: cleanNick,
    nicknameLower: cleanNick.toLowerCase(),
    password: password,
    role: initialRole,
    extraBadges: [],
    title: '',
    avatarUrl: '',
    status: '',
    signature: '',
    about: '',
    reactions: 0,
    points: 10,
    muteUntil: 0,
    muteReason: '',
    banUntil: 0,
    banReason: '',
    createdAt: new Date().toLocaleString('uk-UA')
  }

  const docRef = await addDoc(usersRef, newUserData)
  saveSession({ id: docRef.id, ...newUserData })
  initCurrentUserSync()
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

  let activeRole = userData.role || 'player'
  if (userData.nickname?.toLowerCase() === 'yurii_kondratskyi' && activeRole !== 'developer') {
    activeRole = 'developer'
    await updateDoc(doc(db, 'users', userDoc.id), { role: 'developer' })
  }

  saveSession({
    id: userDoc.id,
    nickname: userData.nickname,
    role: activeRole,
    extraBadges: userData.extraBadges || [],
    title: userData.title || '',
    avatarUrl: userData.avatarUrl || '',
    status: userData.status || '',
    signature: userData.signature || '',
    about: userData.about || '',
    reactions: userData.reactions || 0,
    points: userData.points || 10,
    muteUntil: userData.muteUntil || 0,
    muteReason: userData.muteReason || '',
    banUntil: userData.banUntil || 0,
    banReason: userData.banReason || ''
  })
  initCurrentUserSync()
}

export const updateUserProfile = async (updates) => {
  if (!currentUser.value?.id) return
  const userRef = doc(db, 'users', currentUser.value.id)
  await updateDoc(userRef, updates)

  saveSession({
    ...currentUser.value,
    ...updates
  })
}

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

export const assignUserRole = async (targetUserId, newRoleKey) => {
  await updateDoc(doc(db, 'users', targetUserId), {
    role: newRoleKey
  })
}

// Видача муту або блокування гравцю (durationMinutes = 0 означає назавжди)
export const punishUser = async (targetUserId, { type, durationMinutes, reason }) => {
  const untilTimestamp = durationMinutes > 0
    ? Date.now() + durationMinutes * 60 * 1000
    : 4102444800000 // 2100 рік (перманентно)

  if (type === 'mute') {
    await updateDoc(doc(db, 'users', targetUserId), {
      muteUntil: untilTimestamp,
      muteReason: reason.trim() || 'Порушення правил форуму'
    })
  } else if (type === 'ban') {
    await updateDoc(doc(db, 'users', targetUserId), {
      banUntil: untilTimestamp,
      banReason: reason.trim() || 'Порушення правил форуму'
    })
  }
}

// Дострокове зняття муту або блокування
export const unpunishUser = async (targetUserId, type) => {
  if (type === 'mute') {
    await updateDoc(doc(db, 'users', targetUserId), {
      muteUntil: 0,
      muteReason: ''
    })
  } else if (type === 'ban') {
    await updateDoc(doc(db, 'users', targetUserId), {
      banUntil: 0,
      banReason: ''
    })
  }
}

export const logoutUser = () => {
  localStorage.removeItem('ugta_current_user')
  currentUser.value = null
}