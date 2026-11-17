<template>
  <section class="forum-page">
    <div class="container">
      <!-- ХЛІБНІ КРИХТИ (ПОВНИЙ ШЛЯХ ВЛАДЕНОСТІ) -->
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

      <!-- ЗАГОЛОВОК ТА КНОПКИ АДМІНІСТРАТОРА -->
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

          <button v-if="activeNode" class="btn-admin-primary" @click="isTopicModalOpen = true">
            <Icon icon="mdi:pencil-plus" /> + Створити тему
          </button>
        </div>
      </div>

      <!-- СТАН ЗАВАНТАЖЕННЯ -->
      <div v-if="isForumLoading" class="empty-state">
        Завантаження структури форуму...
      </div>

      <!-- ========================================================= -->
      <!-- РЕЖИМ 3: ПЕРЕГЛЯД КОНКРЕТНОЇ ТЕМИ (ЯК НА 3-МУ СКРІНШОТІ)  -->
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

        <!-- ГОЛОВНИЙ ДОПИС АВТОРА -->
        <div class="post-card">
          <aside class="post-author-sidebar">
            <div class="author-avatar">
              {{ activeTopic.author.charAt(0).toUpperCase() }}
            </div>
            <div class="author-name">{{ activeTopic.author }}</div>
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
            <div class="post-content formatted-content" v-html="formatPostHtml(activeTopic.content)"></div>
          </div>
        </div>

        <!-- СПИСОК ВІДПОВІДЕЙ У ТЕМІ -->
        <div
          v-for="(reply, index) in currentTopicReplies"
          :key="reply.id"
          class="post-card"
        >
          <aside class="post-author-sidebar">
            <div class="author-avatar secondary-avatar">
              {{ reply.author.charAt(0).toUpperCase() }}
            </div>
            <div class="author-name">{{ reply.author }}</div>
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
            <div class="post-content formatted-content" v-html="formatPostHtml(reply.content)"></div>
          </div>
        </div>

        <!-- ФОРМА ВІДПОВІДІ (ЯКЩО ТЕМА НЕ ЗАКРИТА АБО ЦЕ АДМІН) -->
        <div v-if="currentUser && (!activeTopic.isLocked || isAdmin)" class="reply-box">
          <div class="reply-avatar">
            {{ currentUser.nickname.charAt(0).toUpperCase() }}
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
      <!-- РЕЖИМ 1 ТА 2: РОЗДІЛИ, ПІДРОЗДІЛИ ТА СПИСОК ТЕМ           -->
      <!-- ========================================================= -->
      <template v-else>
        <!-- СПИСОК ДОЧІРНІХ РОЗДІЛІВ / ПІДРОЗДІЛІВ -->
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

                <!-- КЛІКАБЕЛЬНІ ПІДРОЗДІЛИ НАСТУПНОГО РІВНЯ -->
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

        <!-- СПИСОК ТЕМ ВСЕРЕДИНІ ПОТОЧНОГО РОЗДІЛУ / ПІДРОЗДІЛУ -->
        <div v-if="activeNode" class="threads-table-wrapper">
          <div v-if="currentNodeTopics.length === 0 && childNodes.length === 0" class="empty-state">
            У цьому розділі ще немає підрозділів чи тем.
            <span v-if="isAdmin">Скористайтеся кнопками зверху, щоб додати їх.</span>
          </div>

          <div v-if="currentNodeTopics.length > 0" class="threads-container">
            <div
              v-for="topic in currentNodeTopics"
              :key="topic.id"
              class="thread-row"
              @click="openTopic(topic)"
            >
              <div class="thread-row-left">
                <div class="thread-avatar">
                  {{ topic.author.charAt(0).toUpperCase() }}
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

    <!-- ========================================================= -->
    <!-- МОДАЛКА 1: СТВОРЕННЯ РОЗДІЛУ АБО ПІДРОЗДІЛУ               -->
    <!-- ========================================================= -->
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
            placeholder="Наприклад: Форма подачі заявки або інформація"
          />

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="isNodeModalOpen = false">Скасувати</button>
            <button type="submit" class="btn-save">Створити</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- МОДАЛКА 2: СТВОРЕННЯ ТЕМИ З ФОРМАТУВАННЯМ ТЕКСТУ          -->
    <!-- ========================================================= -->
    <div v-if="isTopicModalOpen" class="modal-overlay" @click.self="isTopicModalOpen = false">
      <div class="modal-card large-modal">
        <h3>Нова тема в розділі «{{ activeNode?.title }}»</h3>

        <form @submit.prevent="handleCreateTopic" class="admin-form">
          <div class="form-row-2">
            <div>
              <label>Префікс теми</label>
              <select v-model="newTopicPrefix">
                <option value="">Без префікса</option>
                <option value="Важливо">Важливо (червоний)</option>
                <option value="База знань">База знань (зелений)</option>
                <option value="Інформація">Інформація (синій)</option>
                <option value="Схвалено">Схвалено (зелений)</option>
                <option value="Розглянуто">Розглянуто (салатовий)</option>
                <option value="На розгляді">На розгляді (помаранчевий)</option>
              </select>
            </div>

            <div class="checkbox-align">
              <label class="checkbox-label">
                <input type="checkbox" v-model="newTopicLocked" />
                Закрити тему для відповідей гравців
              </label>
            </div>
          </div>

          <label>Заголовок теми *</label>
          <input
            v-model="newTopicTitle"
            type="text"
            placeholder="Наприклад: СБУ | Підрозділи"
            required
          />

          <label>Текст допису * (підтримує виділення та HTML/Markdown теги)</label>
          <div class="editor-toolbar">
            <button type="button" @click="insertFormat('**', '**')"><b>B</b></button>
            <button type="button" @click="insertFormat('### ', '')">Заголовок</button>
            <button type="button" @click="insertFormat('\n---\n', '')">Лінія</button>
            <button type="button" @click="insertTableTemplate">+ Таблиця підрозділів</button>
          </div>

          <textarea
            ref="topicTextarea"
            v-model="newTopicContent"
            rows="9"
            placeholder="Введіть текст правил, статуту або оголошення..."
            required
          ></textarea>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="isTopicModalOpen = false">Скасувати</button>
            <button type="submit" class="btn-save">Опублікувати тему</button>
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

// Поточний відкритий розділ/підрозділ
const activeNode = computed(() =>
  forumNodes.value.find((n) => n.id === activeNodeId.value) || null
)

// Поточна відкрита тема
const activeTopic = computed(() =>
  forumTopics.value.find((t) => t.id === activeTopicId.value) || null
)

// Побудова повного ланцюжка хлібних крихт від кореня до поточного підрозділу
const breadcrumbNodes = computed(() => {
  const path = []
  let curr = activeNode.value
  while (curr) {
    path.unshift(curr)
    curr = forumNodes.value.find((n) => n.id === curr.parentId) || null
  }
  return path
})

// Дочірні розділи/підрозділи для поточного рівня
const childNodes = computed(() => {
  const parentId = activeNodeId.value || null
  return forumNodes.value.filter((n) => (n.parentId || null) === parentId)
})

const getDirectChildren = (nodeId) => {
  return forumNodes.value.filter((n) => n.parentId === nodeId)
}

// Теми безпосередньо в поточному розділі
const currentNodeTopics = computed(() => {
  if (!activeNodeId.value) return []
  return forumTopics.value.filter((t) => t.nodeId === activeNodeId.value)
})

// Відповіді в поточній відкритій темі
const currentTopicReplies = computed(() => {
  if (!activeTopicId.value) return []
  return forumReplies.value.filter((r) => r.topicId === activeTopicId.value)
})

// Рекурсивний підрахунок тем у розділі та всіх його підрозділах
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

// Навігація
const goHome = () => {
  activeNodeId.value = null
  activeTopicId.value = null
}

const openNode = (node) => {
  activeTopicId.value = null
  activeNodeId.value = node.id
}

const openTopic = (topic) => {
  activeNodeId.value = topic.nodeId
  activeTopicId.value = topic.id
  incrementTopicViews(topic.id)
}

// Модалка створення розділу/підрозділу
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

// Модалка створення теми
const isTopicModalOpen = ref(false)
const newTopicPrefix = ref('Важливо')
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
    isLocked: newTopicLocked.value
  })
  newTopicTitle.value = ''
  newTopicContent.value = ''
  newTopicLocked.value = false
  isTopicModalOpen.value = false
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
    authorRole: currentUser.value.role
  })
  replyText.value = ''
}

// Просте форматування тексту (жирний шрифт, заголовки, таблиці)
const formatPostHtml = (raw) => {
  if (!raw) return ''
  return raw
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gim, '<h3 class="post-h3">$1</h3>')
    .replace(/^---$/gim, '<hr class="post-hr" />')
    .replace(/\n/g, '<br />')
}

const getPrefixClass = (prefix) => {
  if (prefix === 'Важливо') return 'prefix-red'
  if (prefix === 'База знань' || prefix === 'Схвалено') return 'prefix-green'
  if (prefix === 'Розглянуто') return 'prefix-lime'
  if (prefix === 'На розгляді') return 'prefix-orange'
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
  transition: color 0.15s;
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
  padding: 11px 18px;
  border-radius: 8px;
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
  padding: 11px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.btn-admin-secondary:hover {
  border-color: #ff6b00;
}

/* РОЗДІЛИ ТА ПІДРОЗДІЛИ */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.section-card {
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 10px;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.section-card:hover {
  border-color: #34394c;
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
  display: inline-block;
}

.section-name:hover {
  color: #ff3b30;
}

.section-desc {
  font-size: 13px;
  color: #8a8d98;
  margin: 0 0 8px;
}

/* Клікабельні підрозділи */
.subforums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 8px 16px;
  margin-top: 10px;
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
  transition: color 0.15s;
}

.subforum-link-btn:hover {
  color: #ff6b00;
  text-decoration: underline;
}

.sub-icon {
  color: #6c7284;
  flex-shrink: 0;
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
.last-post-title.clickable:hover {
  color: #ff6b00;
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
.prefix-blue { background: #2e90fa; color: #fff; }

/* ТАБЛИЦЯ ТЕМ ВСЕРЕДИНІ РОЗДІЛУ */
.threads-container {
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 10px;
  overflow: hidden;
}

.thread-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #1e222d;
  cursor: pointer;
  transition: background 0.15s;
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
  flex-shrink: 0;
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

/* СТОРІНКА ВІДКРИТОЇ ТЕМИ (3-Й СКРІНШОТ) */
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
  border-radius: 10px;
  margin-bottom: 16px;
  overflow: hidden;
}

.post-author-sidebar {
  width: 190px;
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
  width: 72px;
  height: 72px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff3b30, #ff6b00);
  color: #fff;
  font-size: 28px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.secondary-avatar {
  background: #252a3a;
  color: #fff;
}

.author-name {
  font-weight: 700;
  font-size: 15px;
  color: #5ea5ff;
  margin-bottom: 6px;
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
}

/* Стилізація таблиць та заголовків всередині допису */
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

/* Форма відповіді */
.reply-box {
  display: flex;
  gap: 16px;
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 10px;
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
  flex-shrink: 0;
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

/* Кнопки видалення та модалки */
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
  border-radius: 10px;
  padding: 40px;
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
  border-radius: 12px;
  padding: 28px;
  width: 100%;
  max-width: 480px;
}

.large-modal {
  max-width: 680px;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.checkbox-align {
  display: flex;
  align-items: flex-end;
  padding-bottom: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #fff !important;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.editor-toolbar button {
  background: #1c1f2b;
  border: 1px solid #2e3446;
  color: #fff;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.admin-form label {
  font-size: 13px;
  color: #8a8d98;
}

.admin-form input,
.admin-form select,
.admin-form textarea {
  width: 100%;
  background: #0b0c10;
  border: 1px solid #232733;
  border-radius: 8px;
  padding: 11px 14px;
  color: #fff;
  font-family: inherit;
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
  border-radius: 8px;
  cursor: pointer;
}

.btn-save {
  background: #ff3b30;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
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
    width: 44px;
    height: 44px;
    font-size: 18px;
    margin-bottom: 0;
  }
  .section-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>