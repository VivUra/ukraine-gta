import { ref } from 'vue'
import { db } from './firebase.js'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'

// Реактивні списки розділів та тем (оновлюються автоматично у всіх користувачів)
export const forumSections = ref([])
export const forumTopics = ref([])
export const isForumLoading = ref(true)

// Підписка на розділи форуму в реальному часі
export const initForumListeners = () => {
  const sectionsQuery = query(collection(db, 'sections'), orderBy('order', 'asc'))
  onSnapshot(sectionsQuery, (snapshot) => {
    forumSections.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
    isForumLoading.value = false
  })

  const topicsQuery = query(collection(db, 'topics'), orderBy('createdAt', 'desc'))
  onSnapshot(topicsQuery, (snapshot) => {
    forumTopics.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  })
}

// [ТІЛЬКИ ДЛЯ ADMIN] Створити новий розділ на форумі
export const createSection = async (title, description, subforumsText = '') => {
  const cleanTitle = title.trim()
  if (!cleanTitle) throw new Error('Введіть назву розділу.')

  // Перетворюємо рядок підрозділів через кому у масив
  const subforums = subforumsText
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  await addDoc(collection(db, 'sections'), {
    title: cleanTitle,
    description: description.trim(),
    subforums: subforums,
    order: Date.now(),
    createdAt: serverTimestamp()
  })
}

// [ТІЛЬКИ ДЛЯ ADMIN] Видалити розділ
export const deleteSection = async (sectionId) => {
  await deleteDoc(doc(db, 'sections', sectionId))
}

// [ТІЛЬКИ ДЛЯ ADMIN] Створити тему / пост у розділі
export const createTopic = async ({ sectionId, title, content, prefix, authorNickname }) => {
  if (!title.trim() || !content.trim()) {
    throw new Error('Заповніть заголовок та текст повідомлення.')
  }

  await addDoc(collection(db, 'topics'), {
    sectionId,
    title: title.trim(),
    content: content.trim(),
    prefix: prefix || '', // Наприклад: 'Важливо', 'Інформація', 'Схвалено'
    author: authorNickname,
    dateText: new Date().toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    createdAt: serverTimestamp()
  })
}

// [ТІЛЬКИ ДЛЯ ADMIN] Видалити тему
export const deleteTopic = async (topicId) => {
  await deleteDoc(doc(db, 'topics', topicId))
}