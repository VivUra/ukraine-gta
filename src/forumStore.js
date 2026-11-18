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
import { getRoleInfo, getExtraBadgeInfo } from './rolesConfig.js'

export const forumNodes = ref([])
export const forumTopics = ref([])
export const forumReplies = ref([])
export const profilePosts = ref([])
export const allNotifications = ref([])
export const allConversations = ref([])
export const allConversationMessages = ref([])
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

  // Живі сповіщення (Дзвіночок)
  const notifQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
  onSnapshot(notifQuery, (snapshot) => {
    allNotifications.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }))
  })

  // Живі приватні бесіди (Конверт)
  const convQuery = query(collection(db, 'conversations'), orderBy('updatedAt', 'desc'))
  onSnapshot(convQuery, (snapshot) => {
    allConversations.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }))
  })

  // Повідомлення всередині приватних бесід
  const convMsgsQuery = query(collection(db, 'conversation_messages'), orderBy('createdAt', 'asc'))
  onSnapshot(convMsgsQuery, (snapshot) => {
    allConversationMessages.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }))
  })
}

// ==========================================
// СИСТЕМА СПОВІЩЕНЬ (NOTIFICATIONS)
// ==========================================
export const sendNotification = async ({
  targetNickLower,
  actorNickname,
  actorAvatar = '',
  type = 'reply', // 'reply' | 'status' | 'role' | 'wall' | 'message'
  text,
  topicId = '',
  profileNick = ''
}) => {
  if (!targetNickLower) return
  if (actorNickname && targetNickLower === actorNickname.toLowerCase()) return

  await addDoc(collection(db, 'notifications'), {
    targetNickLower: targetNickLower.toLowerCase(),
    actorNickname: actorNickname || 'Система',
    actorAvatar,
    type,
    text,
    topicId,
    profileNick,
    isRead: false,
    dateText: new Date().toLocaleString('uk-UA', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }),
    createdAt: serverTimestamp()
  })
}

export const markNotificationRead = async (notifId) => {
  if (!notifId) return
  await updateDoc(doc(db, 'notifications', notifId), { isRead: true })
}

export const markAllNotificationsRead = async (nickLower) => {
  if (!nickLower) return
  const unread = allNotifications.value.filter(
    (n) => n.targetNickLower === nickLower.toLowerCase() && !n.isRead
  )
  await Promise.all(
    unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { isRead: true }))
  )
}

// ==========================================
// ОСОБИСТІ ПОВІДОМЛЕННЯ (ПРИВАТНІ БЕСІДИ)
// ==========================================
export const createConversation = async ({
  title,
  creatorNickname,
  creatorAvatar = '',
  participantNicknames = [],
  firstMessage
}) => {
  const cleanTitle = title.trim()
  if (!cleanTitle || !firstMessage.trim()) {
    throw new Error('Заповніть заголовок бесіди та текст повідомлення.')
  }

  // Збираємо унікальний список учасників у нижньому регістрі + зберігаємо красиві ніки
  const lowerSet = new Set([creatorNickname.toLowerCase()])
  const displayNames = [creatorNickname]

  for (const rawNick of participantNicknames) {
    const clean = rawNick.trim()
    if (!clean) continue
    const lower = clean.toLowerCase()
    const foundUser = usersByNick.value[lower]
    if (!foundUser) {
      throw new Error(`Гравця «${clean}» не знайдено на форумі.`)
    }
    if (!lowerSet.has(lower)) {
      lowerSet.add(lower)
      displayNames.push(foundUser.nickname)
    }
  }

  if (lowerSet.size < 2) {
    throw new Error('Вкажіть хоча б одного співрозмовника.')
  }

  const nowStr = new Date().toLocaleString('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const convRef = await addDoc(collection(db, 'conversations'), {
    title: cleanTitle,
    creator: creatorNickname,
    participantsLower: Array.from(lowerSet),
    participantsNames: displayNames,
    unreadBy: Array.from(lowerSet).filter((n) => n !== creatorNickname.toLowerCase()),
    lastMessagePreview: firstMessage.trim().replace(/\[\/?[A-Z0-9=#'"\s-]+\]/gi, '').slice(0, 90),
    lastSender: creatorNickname,
    dateText: nowStr,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  await addDoc(collection(db, 'conversation_messages'), {
    conversationId: convRef.id,
    author: creatorNickname,
    authorAvatar: creatorAvatar,
    content: firstMessage.trim(),
    dateText: nowStr,
    createdAt: serverTimestamp()
  })

  return convRef.id
}

export const sendConversationMessage = async ({
  conversationId,
  authorNickname,
  authorAvatar = '',
  content
}) => {
  if (!conversationId || !content.trim()) return
  const conv = allConversations.value.find((c) => c.id === conversationId)
  if (!conv) return

  const nowStr = new Date().toLocaleString('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  await addDoc(collection(db, 'conversation_messages'), {
    conversationId,
    author: authorNickname,
    authorAvatar,
    content: content.trim(),
    dateText: nowStr,
    createdAt: serverTimestamp()
  })

  const others = (conv.participantsLower || []).filter(
    (n) => n !== authorNickname.toLowerCase()
  )

  await updateDoc(doc(db, 'conversations', conversationId), {
    unreadBy: others,
    lastMessagePreview: content.trim().replace(/\[\/?[A-Z0-9=#'"\s-]+\]/gi, '').slice(0, 90),
    lastSender: authorNickname,
    dateText: nowStr,
    updatedAt: serverTimestamp()
  })
}

export const markConversationRead = async (conversationId, userNickLower) => {
  const conv = allConversations.value.find((c) => c.id === conversationId)
  if (!conv || !userNickLower) return
  const lower = userNickLower.toLowerCase()
  if (!Array.isArray(conv.unreadBy) || !conv.unreadBy.includes(lower)) return

  await updateDoc(doc(db, 'conversations', conversationId), {
    unreadBy: conv.unreadBy.filter((n) => n !== lower)
  })
}

export const addParticipantToConversation = async (conversationId, newNickname) => {
  const clean = newNickname.trim()
  if (!clean) throw new Error('Введіть нікнейм гравця.')
  const foundUser = usersByNick.value[clean.toLowerCase()]
  if (!foundUser) throw new Error(`Гравця «${clean}» не знайдено.`)

  const conv = allConversations.value.find((c) => c.id === conversationId)
  if (!conv) return

  const lower = foundUser.nickname.toLowerCase()
  if ((conv.participantsLower || []).includes(lower)) {
    throw new Error('Цей гравець вже є учасником бесіди.')
  }

  await updateDoc(doc(db, 'conversations', conversationId), {
    participantsLower: arrayUnion(lower),
    participantsNames: arrayUnion(foundUser.nickname),
    unreadBy: arrayUnion(lower)
  })
}

// ==========================================
// РОЗДІЛИ, ТЕМИ, РОЛІ ТА ПРОФІЛІ
// ==========================================
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

export const updateUserExtraBadges = async (userId, badgesArray, actorNickname = 'Адміністрація') => {
  if (!userId) return
  const cleanArr = Array.isArray(badgesArray) ? badgesArray : []
  await updateDoc(doc(db, 'users', userId), {
    extraBadges: cleanArr
  })

  const targetUser = allUsersList.value.find((u) => u.id === userId)
  if (targetUser && cleanArr.length > 0) {
    const lastBadge = getExtraBadgeInfo(cleanArr[cleanArr.length - 1])
    if (lastBadge) {
      await sendNotification({
        targetNickLower: targetUser.nickname.toLowerCase(),
        actorNickname,
        type: 'role',
        text: `Вам видано статусну роль «${lastBadge.label}»`,
        profileNick: targetUser.nickname
      })
    }
  }
}

export const updateUserBanner = async (userId, bannerUrl) => {
  if (!userId) return
  await updateDoc(doc(db, 'users', userId), {
    bannerUrl: (bannerUrl || '').trim()
  })
}

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

  await sendNotification({
    targetNickLower,
    actorNickname: authorNickname,
    actorAvatar: authorAvatar,
    type: 'wall',
    text: `${authorNickname} залишив(ла) запис на стіні вашого профілю`,
    profileNick: targetNickLower
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

export const updateTopic = async (topicId, updates, actorNickname = '') => {
  const prevTopic = forumTopics.value.find((t) => t.id === topicId)
  await updateDoc(doc(db, 'topics', topicId), updates)

  // Якщо змінився префікс/статус теми (Схвалено / Відмовлено / На розгляд) — надсилаємо сповіщення автору
  if (
    prevTopic &&
    updates.prefix !== undefined &&
    updates.prefix !== prevTopic.prefix &&
    prevTopic.author
  ) {
    const statusLabel = updates.prefix || 'Без тегу'
    await sendNotification({
      targetNickLower: prevTopic.author.toLowerCase(),
      actorNickname: actorNickname || 'Адміністрація',
      type: 'status',
      text: `Статус вашої теми «${prevTopic.title}» змінено на [${statusLabel}]`,
      topicId: prevTopic.id
    })
  }
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

  // Сповіщення автору теми про нову відповідь
  const parentTopic = forumTopics.value.find((t) => t.id === topicId)
  if (parentTopic && parentTopic.author) {
    await sendNotification({
      targetNickLower: parentTopic.author.toLowerCase(),
      actorNickname: authorNickname,
      actorAvatar: authorAvatar,
      type: 'reply',
      text: `${authorNickname} відповів(ла) у вашій темі «${parentTopic.title}»`,
      topicId: parentTopic.id
    })
  }
}

export const deleteReply = async (replyId) => {
  await deleteDoc(doc(db, 'replies', replyId))
}

// Сповіщення про зміну основної ролі (викликається з authStore або AccountDropdown)
export const notifyRoleAssigned = async (targetUserId, newRoleKey, actorNickname = 'Адміністрація') => {
  const targetUser = allUsersList.value.find((u) => u.id === targetUserId)
  if (!targetUser) return
  const rInfo = getRoleInfo(newRoleKey)
  await sendNotification({
    targetNickLower: targetUser.nickname.toLowerCase(),
    actorNickname,
    type: 'role',
    text: `Вам призначено нову посаду: ${rInfo.label}`,
    profileNick: targetUser.nickname
  })
}