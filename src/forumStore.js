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
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore'

export const forumNodes = ref([])
export const forumTopics = ref([])
export const forumReplies = ref([])
export const profilePosts = ref([])
export const allUsersList = ref([])
export const usersByNick = ref({})
export const isForumLoading = ref(true)

let listenersInitialized = false

export const initForumListeners = () => {
  if (listenersInitialized) return
  listenersInitialized = true

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

  const profilePostsQuery = query(collection(db, 'profile_posts'), orderBy('createdAt', 'desc'))
  onSnapshot(profilePostsQuery, (snapshot) => {
    profilePosts.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }))
  })
}

export const createNode = async ({
  title,
  description = '',
  parentId = null,
  allowSubforums = true,
  minSubforumLevel = 8,
  allowTopics = true,
  minTopicLevel = 1
}) => {
  const cleanTitle = title.trim()
  if (!cleanTitle) throw new Error('Введіть назву.')

  await addDoc(collection(db, 'nodes'), {
    title: cleanTitle,
    description: (description || '').trim(),
    parentId: parentId,
    allowSubforums: Boolean(allowSubforums),
    minSubforumLevel: Number(minSubforumLevel) || 8,
    allowTopics: Boolean(allowTopics),
    minTopicLevel: Number(minTopicLevel) || 1,
    order: Date.now(),
    createdAt: serverTimestamp()
  })
}

export const updateNode = async (nodeId, payload) => {
  if (!nodeId) return
  await updateDoc(doc(db, 'nodes', nodeId), {
    title: payload.title.trim(),
    description: (payload.description || '').trim(),
    allowSubforums: Boolean(payload.allowSubforums),
    minSubforumLevel: Number(payload.minSubforumLevel) || 8,
    allowTopics: Boolean(payload.allowTopics),
    minTopicLevel: Number(payload.minTopicLevel) || 1
  })
}

export const deleteNode = async (nodeId) => {
  await deleteDoc(doc(db, 'nodes', nodeId))
}

export const updateUserExtraBadges = async (userId, badgesArray) => {
  if (!userId) return
  await updateDoc(doc(db, 'users', userId), {
    extraBadges: Array.isArray(badgesArray) ? badgesArray : []
  })
}

// Оновлення банера профілю користувача
export const updateUserBanner = async (userId, bannerUrl) => {
  if (!userId) return
  await updateDoc(doc(db, 'users', userId), {
    bannerUrl: (bannerUrl || '').trim()
  })
}

// Записи на стіні профілю користувача
export const createProfilePost = async ({
  targetNickLower,
  authorNickname,
  authorAvatar = '',
  authorRole = 'player',
  content
}) => {
  if (!content.trim()) return
  await addDoc(collection(db, 'profile_posts'), {
    targetNickLower,
    author: authorNickname,
    authorAvatar,
    authorRole,
    content: content.trim(),
    comments: [],
    likes: [],
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

export const addProfilePostComment = async (postId, { authorNickname, authorAvatar = '', text }) => {
  if (!postId || !text.trim()) return
  await updateDoc(doc(db, 'profile_posts', postId), {
    comments: arrayUnion({
      id: Date.now().toString(),
      author: authorNickname,
      authorAvatar,
      text: text.trim(),
      dateText: new Date().toLocaleString('uk-UA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })
  })
}

export const deleteProfilePost = async (postId) => {
  await deleteDoc(doc(db, 'profile_posts', postId))
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