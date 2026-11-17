<template>
  <section class="forum-page">
    <div class="container">
      <!-- ХЛІБНІ КРИХТИ -->
      <div class="breadcrumbs">
        <span @click="goHome" class="crumb-link">
          <Icon icon="majesticons:home" class="crumb-home-icon" /> Форуми
        </span>

        <template v-for="node in breadcrumbNodes" :key="node.id">
          <span class="crumb-sep">›</span>
          <span
            class="crumb-link"
            :class="{ 'crumb-current': !activeTopic && node.id === activeNode?.id }"
            @click="openNode(node)"
          >
            {{ node.title }}
          </span>
        </template>

        <template v-if="activeTopic">
          <span class="crumb-sep">›</span>
          <span class="crumb-current">{{ activeTopic.title }}</span>
        </template>
      </div>

      <!-- ВЕРХНЯ ПАНЕЛЬ РОЗДІЛУ -->
      <div v-if="!activeTopic" class="forum-top-bar">
        <div>
          <h1 class="forum-title">
            {{ activeNode ? activeNode.title : 'Форум проекту Ukraine GTA' }}
          </h1>
          <p v-if="activeNode?.description" class="forum-subtitle">
            {{ activeNode.description }}
          </p>
        </div>

        <div v-if="isAdmin" class="admin-controls">
          <button class="btn-admin-secondary" @click="openCreateNodeModal">
            <Icon icon="mdi:folder-plus-outline" />
            {{ activeNode ? '+ Створити підрозділ' : '+ Створити розділ' }}
          </button>

          <button
            v-if="activeNode"
            class="btn-admin-primary"
            @click="isQuickTopicOpen = !isQuickTopicOpen"
          >
            <Icon icon="mdi:square-edit-outline" /> Створити тему
          </button>
        </div>
      </div>

      <div v-if="isForumLoading" class="empty-state">
        Завантаження структури форуму...
      </div>

      <!-- ========================================================= -->
      <!-- РЕЖИМ 3: СТОРІНКА ВІДКРИТОЇ ТЕМИ З АВАТАРАМИ ТА ПІДПИСАМИ -->
      <!-- ========================================================= -->
      <div v-else-if="activeTopic" class="thread-view">
        <div class="thread-header-block">
          <div class="thread-title-line">
            <span
              v-if="activeTopic.prefix"
              class="topic-prefix large-prefix"
              :class="getPrefixClass(activeTopic.prefix)"
            >
              {{ activeTopic.prefix }}
            </span>
            <h1 class="thread-main-title">{{ activeTopic.title }}</h1>
          </div>

          <div class="thread-submeta">
            <span><Icon icon="mdi:account" /> {{ activeTopic.author }}</span>
            <span>•</span>
            <span><Icon icon="mdi:clock-outline" /> {{ activeTopic.dateText }}</span>
            <button
              v-if="isAdmin"
              class="btn-delete-small"
              @click="handleDeleteTopic(activeTopic.id)"
            >
              Видалити тему
            </button>
          </div>

          <div v-if="activeTopic.isLocked" class="locked-banner">
            <Icon icon="mdi:lock-outline" /> В цій темі не можна розміщувати нові відповіді.
          </div>
        </div>

        <!-- ГОЛОВНИЙ ДОПИС -->
        <div class="post-card">
          <aside class="post-author-sidebar">
            <div class="author-avatar">
              <img
                v-if="getUserAvatar(activeTopic.author, activeTopic.authorAvatar)"
                :src="getUserAvatar(activeTopic.author, activeTopic.authorAvatar)"
                alt="Avatar"
              />
              <span v-else>{{ activeTopic.author.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="author-name">{{ activeTopic.author }}</div>
            <div class="author-custom-title">
              {{ getUserTitle(activeTopic.author) }}
            </div>
            <div
              class="author-role-badge"
              :class="activeTopic.authorBadge === 'Адміністратор' ? 'badge-admin' : 'badge-player'"
            >
              {{ activeTopic.authorBadge || 'Адміністратор' }}
            </div>
          </aside>

          <div class="post-body">
            <div class="post-top-meta">
              <span>{{ activeTopic.dateText }}</span>
              <span class="post-number">#1</span>
            </div>

            <div
              class="post-content formatted-content"
              v-html="formatPostHtml(activeTopic.content)"
            ></div>

            <!-- Підпис автора під повідомленням -->
            <div v-if="getUserSignature(activeTopic.author)" class="post-signature">
              {{ getUserSignature(activeTopic.author) }}
            </div>
          </div>
        </div>

        <!-- ВІДПОВІДІ У ТЕМІ -->
        <div
          v-for="(reply, index) in currentTopicReplies"
          :key="reply.id"
          class="post-card"
        >
          <aside class="post-author-sidebar">
            <div class="author-avatar secondary-avatar">
              <img
                v-if="getUserAvatar(reply.author, reply.authorAvatar)"
                :src="getUserAvatar(reply.author, reply.authorAvatar)"
                alt="Avatar"
              />
              <span v-else>{{ reply.author.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="author-name">{{ reply.author }}</div>
            <div class="author-custom-title">
              {{ getUserTitle(reply.author) }}
            </div>
            <div
              class="author-role-badge"
              :class="reply.authorBadge === 'Адміністратор' ? 'badge-admin' : 'badge-player'"
            >
              {{ reply.authorBadge || 'Гравець' }}
            </div>
          </aside>

          <div class="post-body">
            <div class="post-top-meta">
              <span>{{ reply.dateText }}</span>
              <div class="post-right-actions">
                <button
                  v-if="isAdmin"
                  class="btn-delete-tiny"
                  @click="deleteReply(reply.id)"
                >
                  Видалити
                </button>
                <span class="post-number">#{{ index + 2 }}</span>
              </div>
            </div>

            <div
              class="post-content formatted-content"
              v-html="formatPostHtml(reply.content)"
            ></div>

            <div v-if="getUserSignature(reply.author)" class="post-signature">
              {{ getUserSignature(reply.author) }}
            </div>
          </div>
        </div>

        <!-- ФОРМА ВІДПОВІДІ З АВАТАРОМ ПОТОЧНОГО КОРИСТУВАЧА -->
        <div v-if="currentUser && (!activeTopic.isLocked || isAdmin)" class="reply-box">
          <div class="reply-avatar">
            <img v-if="currentUser.avatarUrl" :src="currentUser.avatarUrl" alt="Avatar" />
            <span v-else>{{ currentUser.nickname.charAt(0).toUpperCase() }}</span>
          </div>
          <form @submit.prevent="handleSendReply" class="reply-form">
            <textarea
              v-model="replyText"
              rows="4"
              placeholder="Напишіть вашу відповідь у темі..."
              required
            ></textarea>
            <div class="reply-actions">
              <button type="submit" class="btn-admin-primary">
                <Icon icon="mdi:reply" /> Відповісти
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- РЕЖИМ 1 ТА 2: РОЗДІЛИ, ПІДРОЗДІЛИ ТА ВБУДОВАНИЙ РЕДАКТОР    -->
      <!-- ========================================================= -->
      <template v-else>
        <!-- СПИСОК ПІДРОЗДІЛІВ -->
        <div v-if="childNodes.length > 0" class="sections-list">
          <div
            v-for="node in childNodes"
            :key="node.id"
            class="section-card"
          >
            <div class="section-main">
              <div class="section-icon" @click="openNode(node)">
                <Icon icon="mynaui:chat-messages-solid" />
              </div>

              <div class="section-info">
                <h3 class="section-name" @click="openNode(node)">
                  {{ node.title }}
                </h3>
                <p v-if="node.description" class="section-desc">
                  {{ node.description }}
                </p>

                <div v-if="getDirectChildren(node.id).length > 0" class="subforums-grid">
                  <button
                    v-for="sub in getDirectChildren(node.id)"
                    :key="sub.id"
                    type="button"
                    class="subforum-link-btn"
                    @click.stop="openNode(sub)"
                  >
                    <Icon icon="mdi:message-text-outline" class="sub-icon" />
                    {{ sub.title }}
                  </button>
                </div>
              </div>
            </div>

            <div class="section-stats">
              <div class="stat-box">
                <span class="stat-label">ТЕМИ</span>
                <span class="stat-val">{{ getTotalTopicsCount(node.id) }}</span>
              </div>

              <div class="stat-box">
                <span class="stat-label">ДОПИСИ</span>
                <span class="stat-val">{{ getTotalPostsCount(node.id) }}</span>
              </div>

              <div class="last-post-box">
                <template v-if="getLatestNodeTopic(node.id)">
                  <div
                    class="last-post-title clickable"
                    @click="openTopic(getLatestNodeTopic(node.id))"
                  >
                    <span
                      v-if="getLatestNodeTopic(node.id).prefix"
                      class="topic-prefix"
                      :class="getPrefixClass(getLatestNodeTopic(node.id).prefix)"
                    >
                      {{ getLatestNodeTopic(node.id).prefix }}
                    </span>
                    {{ getLatestNodeTopic(node.id).title }}
                  </div>
                  <div class="last-post-meta">
                    {{ getLatestNodeTopic(node.id).dateText }} •
                    <span class="author-nick">{{ getLatestNodeTopic(node.id).author }}</span>
                  </div>
                </template>
                <span v-else class="no-posts">Немає дописів</span>
              </div>

              <button
                v-if="isAdmin"
                class="btn-delete-icon"
                title="Видалити розділ"
                @click.stop="handleDeleteNode(node.id)"
              >
                <Icon icon="mdi:trash-can-outline" />
              </button>
            </div>
          </div>
        </div>

        <!-- ВБУДОВАНА ФОРМА ШВИДКОГО СТВОРЕННЯ ТЕМИ (ЯК НА СКРІНШОТІ XENFORO) -->
        <div v-if="activeNode && isAdmin" class="quick-thread-box">
          <div class="qt-avatar">
            <img v-if="currentUser?.avatarUrl" :src="currentUser.avatarUrl" alt="Avatar" />
            <span v-else>{{ currentUser?.nickname?.charAt(0).toUpperCase() }}</span>
          </div>

          <form @submit.prevent="handleCreateTopic" class="qt-form">
            <!-- Рядок вибору префікса + Заголовок теми -->
            <div class="qt-title-row">
              <select v-model="newTopicPrefix" class="qt-prefix-select">
                <option value="">Без префікса</option>
                <option value="В очікуванні">В очікуванні</option>
                <option value="На розгляд">На розгляд</option>
                <option value="Важливо">Важливо</option>
                <option value="Розглянуто">Розглянуто</option>
                <option value="База знань">База знань</option>
                <option value="Інформація">Інформація</option>
              </select>

              <input
                v-model="newTopicTitle"
                type="text"
                class="qt-title-input"
                placeholder="Заголовок теми"
                @focus="isQuickTopicOpen = true"
                required
              />
            </div>

            <!-- Розгорнутий редактор (відкривається при кліку на заголовок або кнопку) -->
            <div v-if="isQuickTopicOpen || newTopicTitle.length > 0" class="qt-editor-body">
              <div class="qt-toolbar">
                <div class="qt-tools-left">
                  <button type="button" title="Жирний" @click="insertFormat('**', '**')"><b>B</b></button>
                  <button type="button" title="Курсив" @click="insertFormat('*', '*')"><i>I</i></button>
                  <button type="button" title="Підкреслений" @click="insertFormat('<u>', '</u>')"><u>U</u></button>
                  <button type="button" title="Закреслений" @click="insertFormat('<s>', '</s>')"><s>S</s></button>
                  <span class="toolbar-sep"></span>
                  <button type="button" title="Заголовок" @click="insertFormat('### ', '')">H</button>
                  <button type="button" title="Центрування" @click="insertFormat('<center>', '</center>')">
                    <Icon icon="mdi:format-align-center" />
                  </button>
                  <button type="button" title="Горизонтальна лінія" @click="insertFormat('\n---\n', '')">—</button>
                  <button type="button" title="Вставити таблицю" @click="insertTableTemplate">
                    <Icon icon="mdi:table-plus" /> Таблиця
                  </button>
                </div>

                <button
                  type="button"
                  class="btn-preview-toggle"
                  :class="{ active: isPreviewMode }"
                  @click="isPreviewMode = !isPreviewMode"
                >
                  <Icon icon="mdi:eye-outline" /> Передогляд
                </button>
              </div>

              <!-- Попередній перегляд або текстове поле -->
              <div
                v-if="isPreviewMode"
                class="qt-preview-area formatted-content"
                v-html="formatPostHtml(newTopicContent || 'Порожнє повідомлення...')"
              ></div>

              <textarea
                v-else
                ref="topicTextarea"
                v-model="newTopicContent"
                rows="6"
                class="qt-textarea"
                placeholder="Повідомлення..."
                required
              ></textarea>

              <!-- Нижня панель дій -->
              <div class="qt-footer">
                <label class="qt-lock-check">
                  <input type="checkbox" v-model="newTopicLocked" />
                  <span>Закрити тему для відповідей</span>
                </label>

                <div class="qt-submit-group">
                  <button
                    type="button"
                    class="btn-qt-cancel"
                    @click="isQuickTopicOpen = false"
                  >
                    Згорнути
                  </button>
                  <button type="submit" class="btn-qt-submit">
                    <Icon icon="mdi:square-edit-outline" /> Створити тему
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- СПИСОК ТЕМ У РОЗДІЛІ З АВАТАРАМИ АВТОРІВ -->
        <div v-if="activeNode" class="threads-table-wrapper">
          <div v-if="currentNodeTopics.length === 0 && childNodes.length === 0" class="empty-state">
            У цьому розділі ще немає тем.
          </div>

          <div v-if="currentNodeTopics.length > 0" class="threads-container">
            <div
              v-for="topic in currentNodeTopics"
              :key="topic.id"
              class="thread-row"
              @click="openTopic(topic)"
            >
              <div class="thread-row-left">
                <!-- Аватарка автора теми у списку -->
                <div class="thread-avatar">
                  <img
                    v-if="getUserAvatar(topic.author, topic.authorAvatar)"
                    :src="getUserAvatar(topic.author, topic.authorAvatar)"
                    alt="Avatar"
                  />
                  <span v-else>{{ topic.author.charAt(0).toUpperCase() }}</span>
                </div>

                <div class="thread-row-info">
                  <div class="thread-row-title">
                    <span
                      v-if="topic.prefix"
                      class="topic-prefix"
                      :class="getPrefixClass(topic.prefix)"
                    >
                      {{ topic.prefix }}
                    </span>
                    <span class="thread-link-text">{{ topic.title }}</span>
                    <Icon v-if="topic.isLocked" icon="mdi:lock" class="lock-icon" />
                  </div>
                  <div class="thread-row-meta">
                    <span class="author-nick">{{ topic.author }}</span> • {{ topic.dateText }}
                  </div>
                </div>
              </div>

              <div class="thread-row-right">
                <div class="thread-counters">
                  <div>Відповіді: <strong>{{ getTopicRepliesCount(topic.id) }}</strong></div>
                  <div class="views-text">Перегляди: {{ topic.views || 1 }}</div>
                </div>

                <button
                  v-if="isAdmin"
                  class="btn-delete-icon"
                  title="Видалити тему"
                  @click.stop="handleDeleteTopic(topic.id)"
                >
                  <Icon icon="mdi:trash-can-outline" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="childNodes.length === 0" class="empty-state">
          Розділів поки що немає.
          <span v-if="isAdmin">Натисніть «+ Створити розділ», щоб почати.</span>
        </div>
      </template>
    </div>

    <!-- МОДАЛКА СТВОРЕННЯ РОЗДІЛУ АБО ПІДРОЗДІЛУ -->
    <div v-if="isNodeModalOpen" class="modal-overlay" @click.self="isNodeModalOpen = false">
      <div class="modal-card">
        <h3>
          {{ activeNode ? `Новий підрозділ у «${activeNode.title}»` : 'Новий головний розділ' }}
        </h3>

        <form @submit.prevent="handleCreateNode" class="admin-form">
          <label>Назва *</label>
          <input
            v-model="newNodeTitle"
            type="text"
            :placeholder="activeNode ? 'Наприклад: Служба Безпеки України' : 'Наприклад: Державні організації'"
            required
          />

          <label>Короткий опис (необов'язково)</label>
          <input
            v-model="newNodeDesc"
            type="text"
            placeholder="Наприклад: Форма подачі заявки"
          />

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="isNodeModalOpen = false">Скасувати</button>
            <button type="submit" class="btn-save">Створити</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { currentUser } from '../authStore.js'
import {
  forumNodes,
  forumTopics,
  forumReplies,
  usersByNick,
  isForumLoading,
  initForumListeners,
  createNode,
  deleteNode,
  createTopic,
  incrementTopicViews,
  deleteTopic,
  createReply,
  deleteReply
} from '../forumStore.js'

const isAdmin = computed(() => currentUser.value?.role === 'admin')

const activeNodeId = ref(null)
const activeTopicId = ref(null)

onMounted(() => {
  initForumListeners()
})

// Отримання актуальної аватарки, звання і підпису автора з бази користувачів
const getUserAvatar = (nickname, fallbackAvatar = '') => {
  if (!nickname) return fallbackAvatar
  const profile = usersByNick.value[nickname.toLowerCase()]
  return profile?.avatarUrl || fallbackAvatar || ''
}

const getUserTitle = (nickname) => {
  if (!nickname) return ''
  const profile = usersByNick.value[nickname.toLowerCase()]
  return profile?.title || ''
}

const getUserSignature = (nickname) => {
  if (!nickname) return ''
  const profile = usersByNick.value[nickname.toLowerCase()]
  return profile?.signature || ''
}

const activeNode = computed(() =>
  forumNodes.value.find((n) => n.id === activeNodeId.value) || null
)

const activeTopic = computed(() =>
  forumTopics.value.find((t) => t.id === activeTopicId.value) || null
)

const breadcrumbNodes = computed(() => {
  const path = []
  let curr = activeNode.value
  while (curr) {
    path.unshift(curr)
    curr = forumNodes.value.find((n) => n.id === curr.parentId) || null
  }
  return path
})

const childNodes = computed(() => {
  const parentId = activeNodeId.value || null
  return forumNodes.value.filter((n) => (n.parentId || null) === parentId)
})

const getDirectChildren = (nodeId) => {
  return forumNodes.value.filter((n) => n.parentId === nodeId)
}

const currentNodeTopics = computed(() => {
  if (!activeNodeId.value) return []
  return forumTopics.value.filter((t) => t.nodeId === activeNodeId.value)
})

const currentTopicReplies = computed(() => {
  if (!activeTopicId.value) return []
  return forumReplies.value.filter((r) => r.topicId === activeTopicId.value)
})

const getAllDescendantNodeIds = (nodeId) => {
  let ids = [nodeId]
  const children = getDirectChildren(nodeId)
  for (const child of children) {
    ids = ids.concat(getAllDescendantNodeIds(child.id))
  }
  return ids
}

const getTotalTopicsCount = (nodeId) => {
  const ids = getAllDescendantNodeIds(nodeId)
  return forumTopics.value.filter((t) => ids.includes(t.nodeId)).length
}

const getTotalPostsCount = (nodeId) => {
  const ids = getAllDescendantNodeIds(nodeId)
  const topics = forumTopics.value.filter((t) => ids.includes(t.nodeId))
  const topicIds = topics.map((t) => t.id)
  const replies = forumReplies.value.filter((r) => topicIds.includes(r.topicId))
  return topics.length + replies.length
}

const getLatestNodeTopic = (nodeId) => {
  const ids = getAllDescendantNodeIds(nodeId)
  const topics = forumTopics.value.filter((t) => ids.includes(t.nodeId))
  return topics.length > 0 ? topics[0] : null
}

const getTopicRepliesCount = (topicId) => {
  return forumReplies.value.filter((r) => r.topicId === topicId).length
}

const goHome = () => {
  activeNodeId.value = null
  activeTopicId.value = null
}

const openNode = (node) => {
  activeTopicId.value = null
  activeNodeId.value = node.id
  isQuickTopicOpen.value = false
}

const openTopic = (topic) => {
  activeNodeId.value = topic.nodeId
  activeTopicId.value = topic.id
  incrementTopicViews(topic.id)
}

// Створення розділу / підрозділу
const isNodeModalOpen = ref(false)
const newNodeTitle = ref('')
const newNodeDesc = ref('')

const openCreateNodeModal = () => {
  newNodeTitle.value = ''
  newNodeDesc.value = ''
  isNodeModalOpen.value = true
}

const handleCreateNode = async () => {
  await createNode({
    title: newNodeTitle.value,
    description: newNodeDesc.value,
    parentId: activeNodeId.value || null
  })
  isNodeModalOpen.value = false
}

const handleDeleteNode = async (id) => {
  if (confirm('Видалити цей розділ?')) {
    await deleteNode(id)
    if (activeNodeId.value === id) goHome()
  }
}

// Вбудований швидкий редактор створення теми
const isQuickTopicOpen = ref(false)
const isPreviewMode = ref(false)
const newTopicPrefix = ref('В очікуванні')
const newTopicTitle = ref('')
const newTopicContent = ref('')
const newTopicLocked = ref(false)
const topicTextarea = ref(null)

const insertFormat = (before, after) => {
  const el = topicTextarea.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = newTopicContent.value.substring(start, end)
  newTopicContent.value =
    newTopicContent.value.substring(0, start) +
    before +
    selected +
    after +
    newTopicContent.value.substring(end)
}

const insertTableTemplate = () => {
  newTopicContent.value += `\n<table>
  <thead>
    <tr><th>№</th><th>Підрозділ</th><th>Призначення</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td><b>ЦПКР</b><br>Центр підготовки кадрів</td><td>Навчальний підрозділ</td></tr>
    <tr><td>2</td><td><b>УВБ</b><br>Управління внутрішньої безпеки</td><td>Контроль законності</td></tr>
  </tbody>
</table>\n`
}

const handleCreateTopic = async () => {
  if (!activeNodeId.value) return
  await createTopic({
    nodeId: activeNodeId.value,
    title: newTopicTitle.value,
    content: newTopicContent.value,
    prefix: newTopicPrefix.value,
    authorNickname: currentUser.value.nickname,
    authorRole: currentUser.value.role,
    authorAvatar: currentUser.value.avatarUrl || '',
    isLocked: newTopicLocked.value
  })
  newTopicTitle.value = ''
  newTopicContent.value = ''
  newTopicLocked.value = false
  isPreviewMode.value = false
  isQuickTopicOpen.value = false
}

const handleDeleteTopic = async (id) => {
  if (confirm('Видалити цю тему?')) {
    await deleteTopic(id)
    activeTopicId.value = null
  }
}

// Відповіді в темі
const replyText = ref('')
const handleSendReply = async () => {
  if (!activeTopicId.value || !currentUser.value) return
  await createReply({
    topicId: activeTopicId.value,
    content: replyText.value,
    authorNickname: currentUser.value.nickname,
    authorRole: currentUser.value.role,
    authorAvatar: currentUser.value.avatarUrl || ''
  })
  replyText.value = ''
}

const formatPostHtml = (raw) => {
  if (!raw) return ''
  return raw
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gim, '<h3 class="post-h3">$1</h3>')
    .replace(/^---$/gim, '<hr class="post-hr" />')
    .replace(/\n/g, '<br />')
}

const getPrefixClass = (prefix) => {
  if (prefix === 'Важливо') return 'prefix-red'
  if (prefix === 'База знань' || prefix === 'Схвалено') return 'prefix-green'
  if (prefix === 'Розглянуто') return 'prefix-lime'
  if (prefix === 'На розгляд') return 'prefix-orange'
  if (prefix === 'В очікуванні') return 'prefix-gray'
  return 'prefix-blue'
}
</script>

<style scoped>
.forum-page {
  padding: 28px 0 80px;
  min-height: 78vh;
  color: #fff;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #8a8d98;
  margin-bottom: 18px;
}

.crumb-home-icon {
  vertical-align: -2px;
  margin-right: 4px;
}

.crumb-link {
  cursor: pointer;
}
.crumb-link:hover {
  color: #ff3b30;
}
.crumb-current {
  color: #fff;
  font-weight: 700;
}

.forum-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.forum-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}

.forum-subtitle {
  margin: 6px 0 0;
  color: #8a8d98;
  font-size: 14px;
}

.admin-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-admin-primary {
  background: linear-gradient(90deg, #ff3b30 0%, #ff6b00 100%);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.btn-admin-secondary {
  background: #1c1f2b;
  color: #fff;
  border: 1px solid #32384d;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* ВБУДОВАНА ПАНЕЛЬ ШВИДКОГО СТВОРЕННЯ ТЕМИ (QUICK THREAD) */
.quick-thread-box {
  display: flex;
  gap: 14px;
  background: #181a22;
  border: 1px solid #282d3d;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.qt-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ff3b30, #ff6b00);
  color: #fff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.qt-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qt-form {
  flex: 1;
  min-width: 0;
}

.qt-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qt-prefix-select {
  background: #252936;
  border: 1px solid #353b4d;
  color: #fff;
  padding: 9px 12px;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.qt-title-input {
  flex: 1;
  background: #111319;
  border: 1px solid #2b3040;
  color: #fff;
  padding: 10px 14px;
  border-radius: 5px;
  font-size: 15px;
  outline: none;
}

.qt-title-input:focus {
  border-color: #ff6b00;
}

.qt-editor-body {
  margin-top: 12px;
  border: 1px solid #2b3040;
  border-radius: 6px;
  background: #111319;
  overflow: hidden;
}

.qt-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1d202b;
  border-bottom: 1px solid #2b3040;
  padding: 6px 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.qt-tools-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qt-tools-left button {
  background: none;
  border: none;
  color: #c5c8d4;
  padding: 5px 9px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.qt-tools-left button:hover {
  background: #2b3040;
  color: #fff;
}

.toolbar-sep {
  width: 1px;
  height: 18px;
  background: #32384d;
  margin: 0 4px;
}

.btn-preview-toggle {
  background: none;
  border: 1px solid transparent;
  color: #9ca3af;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.btn-preview-toggle.active,
.btn-preview-toggle:hover {
  background: #282d3d;
  color: #fff;
}

.qt-textarea {
  width: 100%;
  background: #111319;
  border: none;
  padding: 14px;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  outline: none;
}

.qt-preview-area {
  min-height: 140px;
  padding: 14px;
  background: #14161e;
  font-size: 14px;
  line-height: 1.6;
}

.qt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #181a22;
  border-top: 1px solid #2b3040;
  flex-wrap: wrap;
  gap: 10px;
}

.qt-lock-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #9ca3af;
  cursor: pointer;
}

.qt-submit-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-qt-cancel {
  background: #252936;
  border: none;
  color: #c5c8d4;
  padding: 9px 14px;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
}

.btn-qt-submit {
  background: linear-gradient(90deg, #ff3b30, #ff6b00);
  border: none;
  color: #fff;
  padding: 9px 18px;
  border-radius: 5px;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* РОЗДІЛИ ТА ПІДРОЗДІЛИ */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.section-card {
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 8px;
  padding: 18px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.section-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.section-icon {
  font-size: 26px;
  color: #8a8d98;
  background: #1c1f2b;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  cursor: pointer;
}

.section-name {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #fff;
  cursor: pointer;
}

.section-name:hover {
  color: #ff3b30;
}

.section-desc {
  font-size: 13px;
  color: #8a8d98;
  margin: 0 0 8px;
}

.subforums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 8px 16px;
  margin-top: 8px;
}

.subforum-link-btn {
  background: none;
  border: none;
  padding: 2px 0;
  color: #d0d3df;
  font-size: 13px;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  text-align: left;
}

.subforum-link-btn:hover {
  color: #ff6b00;
  text-decoration: underline;
}

.section-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 55px;
}

.stat-label {
  font-size: 10px;
  color: #6c7284;
  font-weight: 700;
}

.stat-val {
  font-size: 15px;
  font-weight: 700;
}

.last-post-box {
  width: 240px;
  font-size: 13px;
}

.last-post-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  margin-bottom: 3px;
}

.last-post-title.clickable {
  cursor: pointer;
}

.last-post-meta, .no-posts {
  font-size: 12px;
  color: #6c7284;
}

.author-nick {
  color: #ff6b00;
  font-weight: 600;
}

/* ПРЕФІКСИ */
.topic-prefix {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-right: 6px;
}
.large-prefix {
  font-size: 13px;
  padding: 4px 10px;
}
.prefix-red { background: #d92d20; color: #fff; }
.prefix-green { background: #0e9f6e; color: #fff; }
.prefix-lime { background: #16a34a; color: #fff; }
.prefix-orange { background: #f79009; color: #fff; }
.prefix-gray { background: #e5e7eb; color: #111827; }
.prefix-blue { background: #2e90fa; color: #fff; }

/* СПИСОК ТЕМ У РОЗДІЛІ */
.threads-container {
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 8px;
  overflow: hidden;
}

.thread-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 18px;
  border-bottom: 1px solid #1e222d;
  cursor: pointer;
}

.thread-row:last-child {
  border-bottom: none;
}

.thread-row:hover {
  background: #191c26;
}

.thread-row-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.thread-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #252a3a;
  color: #ff6b00;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.thread-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thread-row-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.thread-row:hover .thread-link-text {
  color: #ff6b00;
}

.lock-icon {
  margin-left: 8px;
  color: #8a8d98;
  font-size: 14px;
}

.thread-row-meta {
  font-size: 12px;
  color: #8a8d98;
}

.thread-row-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.thread-counters {
  text-align: right;
  font-size: 12px;
  color: #c5c8d4;
}

.views-text {
  color: #6c7284;
  margin-top: 2px;
}

/* ВІДКРИТА ТЕМА */
.thread-header-block {
  margin-bottom: 20px;
}

.thread-title-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.thread-main-title {
  font-size: 24px;
  margin: 0;
}

.thread-submeta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #8a8d98;
}

.locked-banner {
  margin-top: 14px;
  background: #14161e;
  border: 1px solid #2b3040;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-card {
  display: flex;
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.post-author-sidebar {
  width: 195px;
  background: #11131a;
  border-right: 1px solid #232733;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-shrink: 0;
}

.author-avatar {
  width: 84px;
  height: 84px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff3b30, #ff6b00);
  color: #fff;
  font-size: 32px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.secondary-avatar {
  background: #252a3a;
}

.author-name {
  font-weight: 700;
  font-size: 15px;
  color: #5ea5ff;
  margin-bottom: 4px;
}

.author-custom-title {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.author-role-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 4px;
}

.badge-admin {
  background: #ff3b30;
  color: #fff;
}

.badge-player {
  background: #232733;
  color: #9ca3af;
}

.post-body {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
}

.post-top-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c7284;
  border-bottom: 1px solid #1e222d;
  padding-bottom: 10px;
  margin-bottom: 16px;
}

.post-content {
  font-size: 15px;
  line-height: 1.65;
  color: #e5e7eb;
  flex: 1;
}

.post-signature {
  margin-top: 24px;
  padding-top: 12px;
  border-top: 1px solid #232733;
  font-size: 12px;
  color: #8a8d98;
  font-style: italic;
}

.formatted-content :deep(.post-h3) {
  color: #f59e0b;
  text-align: center;
  margin: 16px 0 8px;
  font-size: 18px;
}

.formatted-content :deep(.post-hr) {
  border: none;
  border-top: 1px solid #f59e0b;
  margin: 12px 0;
}

.formatted-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0;
  background: #1a1d28;
}

.formatted-content :deep(th),
.formatted-content :deep(td) {
  border: 1px solid #2e3446;
  padding: 10px 14px;
  text-align: left;
}

.formatted-content :deep(th) {
  background: #11131a;
  color: #f59e0b;
}

.reply-box {
  display: flex;
  gap: 16px;
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}

.reply-avatar {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #ff3b30;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  overflow: hidden;
  flex-shrink: 0;
}

.reply-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reply-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-form textarea {
  background: #0b0c10;
  border: 1px solid #232733;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-delete-icon {
  background: none;
  border: 1px solid #3a2328;
  color: #ff4d4d;
  padding: 7px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-delete-small {
  background: rgba(255, 77, 77, 0.15);
  border: 1px solid #ff4d4d;
  color: #ff4d4d;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-delete-tiny {
  background: none;
  border: none;
  color: #ff4d4d;
  cursor: pointer;
  margin-right: 10px;
  font-size: 12px;
}

.empty-state {
  background: #14161e;
  border: 1px dashed #2b3040;
  border-radius: 8px;
  padding: 36px;
  text-align: center;
  color: #8a8d98;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 16px;
}

.modal-card {
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 10px;
  padding: 26px;
  width: 100%;
  max-width: 460px;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-form label {
  font-size: 13px;
  color: #8a8d98;
}

.admin-form input {
  background: #0b0c10;
  border: 1px solid #232733;
  border-radius: 6px;
  padding: 11px 14px;
  color: #fff;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn-cancel {
  background: #232733;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save {
  background: #ff3b30;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 768px) {
  .post-card {
    flex-direction: column;
  }
  .post-author-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #232733;
    flex-direction: row;
    gap: 14px;
    padding: 14px;
  }
  .author-avatar {
    width: 48px;
    height: 48px;
    font-size: 18px;
    margin-bottom: 0;
  }
  .section-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .qt-title-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>