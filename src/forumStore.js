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

export const forumNodes = ref([])
export const forumTopics = ref([])
export const forumReplies = ref([])
export const usersByNick = ref({})
export const isForumLoading = ref(true)

export const initForumListeners = () => {
  // Слухаємо профілі користувачів (для актуальних аватарок, звань і підписів)
  onSnapshot(collection(db, 'users'), (snapshot) => {
    const map = {}
    snapshot.docs.forEach((d) => {
      const data = d.data()
      if (data.nickname) {
        map[data.nickname.toLowerCase()] = data
      }
    })
    usersByNick.value = map
  })

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

export const deleteNode = async (nodeId) => {
  await deleteDoc(doc(db, 'nodes', nodeId))
}

export const createTopic = async ({
  nodeId,
  title,
  content,
  prefix,
  authorNickname,
  authorRole,
  authorAvatar = '',
  isLocked = false
}) => {
  if (!title.trim() || !content.trim()) {
    throw new Error('Заповніть заголовок та текст теми.')
  }

  await addDoc(collection(db, 'topics'), {
    nodeId,
    title: title.trim(),
    content: content.trim(),
    prefix: prefix || '',
    author: authorNickname,
    authorAvatar: authorAvatar,
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

export const incrementTopicViews = async (topicId) => {
  try {
    await updateDoc(doc(db, 'topics', topicId), {
      views: increment(1)
    })
  } catch (e) {
    // Ігноруємо помилку лічильника
  }
}

export const deleteTopic = async (topicId) => {
  await deleteDoc(doc(db, 'topics', topicId))
}

export const createReply = async ({
  topicId,
  content,
  authorNickname,
  authorRole,
  authorAvatar = ''
}) => {
  if (!content.trim()) throw new Error('Введіть текст повідомлення.')

  await addDoc(collection(db, 'replies'), {
    topicId,
    content: content.trim(),
    author: authorNickname,
    authorAvatar: authorAvatar,
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

export const deleteReply = async (replyId) => {
  await deleteDoc(doc(db, 'replies', replyId))
}