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
export const allUsersList = ref([])
export const usersByNick = ref({})
export const isForumLoading = ref(true)

export const initForumListeners = () => {
  onSnapshot(collection(db, 'users'), (snapshot) => {
    const map = {}
    const list = []
    snapshot.docs.forEach((d) => {
      const data = { id: d.id, ...d.data() }
      list.push(data)
      if (data.nickname) {
        map[data.nickname.toLowerCase()] = data
      }
    })
    allUsersList.value = list
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
  isLocked = false,
  isPinned = false
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
    authorRole: authorRole || 'player',
    isLocked: isLocked,
    isPinned: isPinned,
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

// Оновлення теми: текст, заголовок, тег (префікс), закріплення, закриття
export const updateTopic = async (topicId, updates) => {
  await updateDoc(doc(db, 'topics', topicId), updates)
}

export const incrementTopicViews = async (topicId) => {
  try {
    await updateDoc(doc(db, 'topics', topicId), {
      views: increment(1)
    })
  } catch (e) {}
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
    authorRole: authorRole || 'player',
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