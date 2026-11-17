import { ref } from 'vue'
import { db } from './firebase.js'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'

// Усі вузли (і головні розділи, і будь-які підрозділи)
export const forumNodes = ref([])
// Усі теми (дописи)
export const forumTopics = ref([])
// Усі відповіді в темах
export const forumReplies = ref([])
export const isForumLoading = ref(true)

export const initForumListeners = () => {
  const nodesQuery = query(collection(db, 'nodes'), orderBy('order', 'asc'))
  onSnapshot(nodesQuery, (snapshot) => {
    forumNodes.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }))
    isForumLoading.value = false
  })

  const topicsQuery = query(collection(db, 'topics'), orderBy('createdAt', 'desc'))
  onSnapshot(topicsQuery, (snapshot) => {
    forumTopics.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }))
  })

  const repliesQuery = query(collection(db, 'replies'), orderBy('createdAt', 'asc'))
  onSnapshot(repliesQuery, (snapshot) => {
    forumReplies.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }))
  })
}

// Створити розділ (parentId = null) або підрозділ (parentId = id батьківського розділу)
export const createNode = async ({ title, description = '', parentId = null }) => {
  const cleanTitle = title.trim()
  if (!cleanTitle) throw new Error('Введіть назву.')

  await addDoc(collection(db, 'nodes'), {
    title: cleanTitle,
    description: description.trim(),
    parentId: parentId,
    order: Date.now(),
    createdAt: serverTimestamp()
  })
}

// Видалити розділ або підрозділ
export const deleteNode = async (nodeId) => {
  await deleteDoc(doc(db, 'nodes', nodeId))
}

// Створити тему в будь-якому розділі чи підрозділі
export const createTopic = async ({ nodeId, title, content, prefix, authorNickname, authorRole, isLocked = false }) => {
  if (!title.trim() || !content.trim()) {
    throw new Error('Заповніть заголовок та текст теми.')
  }

  await addDoc(collection(db, 'topics'), {
    nodeId,
    title: title.trim(),
    content: content.trim(),
    prefix: prefix || '',
    author: authorNickname,
    authorBadge: authorRole === 'admin' ? 'Адміністратор' : 'Гравець',
    isLocked: isLocked,
    views: 1,
    dateText: new Date().toLocaleString('uk-UA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    createdAt: serverTimestamp()
  })
}

// Збільшити лічильник переглядів при відкритті теми
export const incrementTopicViews = async (topicId) => {
  try {
    await updateDoc(doc(db, 'topics', topicId), {
      views: increment(1)
    })
  } catch (e) {
    // Ігноруємо помилку, якщо немає прав на запис
  }
}

// Видалити тему
export const deleteTopic = async (topicId) => {
  await deleteDoc(doc(db, 'topics', topicId))
}

// Додати відповідь у тему (для авторизованих гравців та адмінів)
export const createReply = async ({ topicId, content, authorNickname, authorRole }) => {
  if (!content.trim()) throw new Error('Введіть текст повідомлення.')

  await addDoc(collection(db, 'replies'), {
    topicId,
    content: content.trim(),
    author: authorNickname,
    authorBadge: authorRole === 'admin' ? 'Адміністратор' : 'Гравець',
    dateText: new Date().toLocaleString('uk-UA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    createdAt: serverTimestamp()
  })
}

// Видалити відповідь
export const deleteReply = async (replyId) => {
  await deleteDoc(doc(db, 'replies', replyId))
}