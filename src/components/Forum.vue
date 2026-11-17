<template>
  <section class="forum-page">
    <div class="container">
      <!-- Хлібні крихти -->
      <div class="breadcrumbs">
        <span @click="activeSection = null" class="crumb-link">Форуми</span>
        <span class="crumb-sep">›</span>
        <span @click="activeSection = null" class="crumb-link">Сервери</span>
        <template v-if="activeSection">
          <span class="crumb-sep">›</span>
          <span class="crumb-current">{{ activeSection.title }}</span>
        </template>
      </div>

      <!-- Заголовок сторінки + Панель Адміністратора -->
      <div class="forum-top-bar">
        <h1 class="forum-title">
          {{ activeSection ? activeSection.title : 'Форум проекту Ukraine GTA' }}
        </h1>

        <div v-if="isAdmin" class="admin-controls">
          <button
            v-if="!activeSection"
            class="btn-admin-action"
            @click="isSectionModalOpen = true"
          >
            <Icon icon="mdi:folder-plus" /> + Створити розділ
          </button>

          <button
            v-else
            class="btn-admin-action"
            @click="isTopicModalOpen = true"
          >
            <Icon icon="mdi:pencil-plus" /> + Створити тему / текст
          </button>
        </div>
      </div>

      <!-- Завантаження -->
      <div v-if="isForumLoading" class="loading-box">
        Завантаження розділів форуму...
      </div>

      <!-- РЕЖИМ 1: СПИСОК УСІХ РОЗДІЛІВ -->
      <div v-else-if="!activeSection" class="sections-list">
        <div v-if="forumSections.length === 0" class="empty-state">
          Розділів поки що немає.
          <span v-if="isAdmin">Натисніть «+ Створити розділ», щоб додати перший.</span>
        </div>

        <div
          v-for="section in forumSections"
          :key="section.id"
          class="section-card"
        >
          <div class="section-main" @click="activeSection = section">
            <div class="section-icon">
              <Icon icon="mynaui:chat-messages-solid" />
            </div>

            <div class="section-info">
              <h3 class="section-name">{{ section.title }}</h3>
              <p v-if="section.description" class="section-desc">
                {{ section.description }}
              </p>

              <!-- Підрозділи (як на скріншоті) -->
              <div v-if="section.subforums && section.subforums.length" class="subforums-grid">
                <span
                  v-for="(sub, idx) in section.subforums"
                  :key="idx"
                  class="subforum-item"
                >
                  <Icon icon="mdi:message-text-outline" class="sub-icon" />
                  {{ sub }}
                </span>
              </div>
            </div>
          </div>

          <div class="section-stats">
            <div class="stat-box">
              <span class="stat-label">ТЕМИ</span>
              <span class="stat-val">{{ getSectionTopics(section.id).length }}</span>
            </div>

            <div class="last-post-box">
              <template v-if="getLatestTopic(section.id)">
                <div class="last-post-title">
                  <span
                    v-if="getLatestTopic(section.id).prefix"
                    class="topic-prefix"
                    :class="getPrefixClass(getLatestTopic(section.id).prefix)"
                  >
                    {{ getLatestTopic(section.id).prefix }}
                  </span>
                  {{ getLatestTopic(section.id).title }}
                </div>
                <div class="last-post-meta">
                  {{ getLatestTopic(section.id).dateText }} •
                  <span class="author-nick">{{ getLatestTopic(section.id).author }}</span>
                </div>
              </template>
              <span v-else class="no-posts">Немає дописів</span>
            </div>

            <!-- Кнопка видалення для адміна -->
            <button
              v-if="isAdmin"
              class="btn-delete-icon"
              title="Видалити розділ"
              @click.stop="handleDeleteSection(section.id)"
            >
              <Icon icon="mdi:trash-can-outline" />
            </button>
          </div>
        </div>
      </div>

      <!-- РЕЖИМ 2: ВСЕРЕДИНІ РОЗДІЛУ (ТЕМИ ТА ТЕКСТИ) -->
      <div v-else class="topics-view">
        <button class="btn-back" @click="activeSection = null">
          ← Назад до списку розділів
        </button>

        <div v-if="getSectionTopics(activeSection.id).length === 0" class="empty-state">
          У цьому розділі ще немає жодної теми.
        </div>

        <div class="topics-list">
          <div
            v-for="topic in getSectionTopics(activeSection.id)"
            :key="topic.id"
            class="topic-card"
          >
            <div class="topic-header">
              <div class="topic-title-row">
                <span
                  v-if="topic.prefix"
                  class="topic-prefix"
                  :class="getPrefixClass(topic.prefix)"
                >
                  {{ topic.prefix }}
                </span>
                <h3 class="topic-title">{{ topic.title }}</h3>
              </div>

              <div class="topic-meta">
                Автор: <span class="author-nick">{{ topic.author }}</span> • {{ topic.dateText }}
                <button
                  v-if="isAdmin"
                  class="btn-delete-small"
                  @click="handleDeleteTopic(topic.id)"
                >
                  Видалити
                </button>
              </div>
            </div>

            <div class="topic-content">
              {{ topic.content }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- МОДАЛКА СТВОРЕННЯ РОЗДІЛУ (ДЛЯ ADMIN) -->
    <div v-if="isSectionModalOpen" class="modal-overlay" @click.self="isSectionModalOpen = false">
      <div class="modal-card">
        <h3>Новий розділ форуму</h3>
        <form @submit.prevent="handleCreateSection" class="admin-form">
          <label>Назва розділу *</label>
          <input v-model="newSecTitle" type="text" placeholder="Наприклад: Державні організації" required />

          <label>Короткий опис (необов'язково)</label>
          <input v-model="newSecDesc" type="text" placeholder="Офіційна інформація для гравців" />

          <label>Підрозділи (через кому)</label>
          <input v-model="newSecSubs" type="text" placeholder="СБУ, ЗСУ, Національна поліція, ДСНС" />

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="isSectionModalOpen = false">Скасувати</button>
            <button type="submit" class="btn-save">Опублікувати розділ</button>
          </div>
        </form>
      </div>
    </div>

    <!-- МОДАЛКА СТВОРЕННЯ ТЕМИ / ТЕКСТУ (ДЛЯ ADMIN) -->
    <div v-if="isTopicModalOpen" class="modal-overlay" @click.self="isTopicModalOpen = false">
      <div class="modal-card">
        <h3>Створити тему в розділі «{{ activeSection?.title }}»</h3>
        <form @submit.prevent="handleCreateTopic" class="admin-form">
          <label>Префікс (мітка)</label>
          <select v-model="newTopicPrefix">
            <option value="">Без префікса</option>
            <option value="Важливо">Важливо (червоний)</option>
            <option value="Інформація">Інформація (синій)</option>
            <option value="Схвалено">Схвалено (зелений)</option>
            <option value="На розгляді">На розгляді (помаранчевий)</option>
          </select>

          <label>Заголовок теми *</label>
          <input v-model="newTopicTitle" type="text" placeholder="Наприклад: Правила подачі заявки на посаду лідера" required />

          <label>Текст повідомлення *</label>
          <textarea v-model="newTopicContent" rows="6" placeholder="Введіть повний текст правил або оголошення..." required></textarea>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="isTopicModalOpen = false">Скасувати</button>
            <button type="submit" class="btn-save">Опублікувати</button>
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
  forumSections,
  forumTopics,
  isForumLoading,
  initForumListeners,
  createSection,
  deleteSection,
  createTopic,
  deleteTopic
} from '../forumStore.js'

// Перевірка прав адміністратора
const isAdmin = computed(() => currentUser.value?.role === 'admin')

const activeSection = ref(null)

// Стан модалок
const isSectionModalOpen = ref(false)
const newSecTitle = ref('')
const newSecDesc = ref('')
const newSecSubs = ref('')

const isTopicModalOpen = ref(false)
const newTopicPrefix = ref('Важливо')
const newTopicTitle = ref('')
const newTopicContent = ref('')

onMounted(() => {
  initForumListeners()
})

const getSectionTopics = (sectionId) => {
  return forumTopics.value.filter((t) => t.sectionId === sectionId)
}

const getLatestTopic = (sectionId) => {
  const list = getSectionTopics(sectionId)
  return list.length > 0 ? list[0] : null
}

const getPrefixClass = (prefix) => {
  if (prefix === 'Важливо') return 'prefix-red'
  if (prefix === 'Схвалено') return 'prefix-green'
  if (prefix === 'На розгляді') return 'prefix-orange'
  return 'prefix-blue'
}

const handleCreateSection = async () => {
  await createSection(newSecTitle.value, newSecDesc.value, newSecSubs.value)
  newSecTitle.value = ''
  newSecDesc.value = ''
  newSecSubs.value = ''
  isSectionModalOpen.value = false
}

const handleDeleteSection = async (id) => {
  if (confirm('Видалити цей розділ форуму?')) {
    await deleteSection(id)
  }
}

const handleCreateTopic = async () => {
  if (!activeSection.value) return
  await createTopic({
    sectionId: activeSection.value.id,
    title: newTopicTitle.value,
    content: newTopicContent.value,
    prefix: newTopicPrefix.value,
    authorNickname: currentUser.value.nickname
  })
  newTopicTitle.value = ''
  newTopicContent.value = ''
  isTopicModalOpen.value = false
}

const handleDeleteTopic = async (id) => {
  if (confirm('Видалити цю тему?')) {
    await deleteTopic(id)
  }
}
</script>

<style scoped>
.forum-page {
  padding: 32px 0 80px;
  min-height: 75vh;
  color: #fff;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #8a8d98;
  margin-bottom: 16px;
}

.crumb-link {
  cursor: pointer;
}
.crumb-link:hover {
  color: #ff3b30;
}
.crumb-current {
  color: #fff;
  font-weight: 600;
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

.btn-admin-action {
  background: linear-gradient(90deg, #ff3b30 0%, #ff6b00 100%);
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-card {
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  transition: border-color 0.2s;
}

.section-card:hover {
  border-color: #383e52;
}

.section-main {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  flex: 1;
  cursor: pointer;
}

.section-icon {
  font-size: 28px;
  color: #8a8d98;
  background: #1c1f2b;
  padding: 12px;
  border-radius: 8px;
  display: flex;
}

.section-name {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #fff;
}

.section-main:hover .section-name {
  color: #ff3b30;
}

.section-desc {
  font-size: 13px;
  color: #8a8d98;
  margin: 0 0 10px;
}

.subforums-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  margin-top: 8px;
}

.subforum-item {
  font-size: 13px;
  color: #c5c8d4;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-icon {
  color: #6c7284;
}

.section-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.stat-label {
  font-size: 11px;
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
  margin-bottom: 4px;
}

.last-post-meta, .no-posts {
  font-size: 12px;
  color: #6c7284;
}

.author-nick {
  color: #ff6b00;
  font-weight: 600;
}

.topic-prefix {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-right: 6px;
}
.prefix-red { background: #d92d20; color: #fff; }
.prefix-green { background: #12b76a; color: #fff; }
.prefix-orange { background: #f79009; color: #fff; }
.prefix-blue { background: #2e90fa; color: #fff; }

.btn-delete-icon {
  background: none;
  border: 1px solid #3a2328;
  color: #ff4d4d;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
}

.btn-back {
  background: #1c1f2b;
  color: #fff;
  border: 1px solid #2b3040;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: 600;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topic-card {
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 10px;
  padding: 24px;
}

.topic-header {
  border-bottom: 1px solid #232733;
  padding-bottom: 12px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.topic-title-row {
  display: flex;
  align-items: center;
}

.topic-title {
  margin: 0;
  font-size: 18px;
}

.topic-meta {
  font-size: 13px;
  color: #8a8d98;
  display: flex;
  align-items: center;
  gap: 12px;
}

.topic-content {
  font-size: 15px;
  line-height: 1.6;
  color: #e2e4ec;
  white-space: pre-wrap;
}

.btn-delete-small {
  background: rgba(255, 77, 77, 0.15);
  border: 1px solid #ff4d4d;
  color: #ff4d4d;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.empty-state, .loading-box {
  background: #14161e;
  border: 1px dashed #2b3040;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  color: #8a8d98;
}

/* Модалки адміна */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.modal-card {
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 12px;
  padding: 28px;
  width: 100%;
  max-width: 500px;
}

.modal-card h3 {
  margin: 0 0 20px;
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

.admin-form input,
.admin-form select,
.admin-form textarea {
  background: #0b0c10;
  border: 1px solid #232733;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
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

@media (max-width: 900px) {
  .section-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .section-stats {
    width: 100%;
    justify-content: space-between;
    border-top: 1px solid #232733;
    padding-top: 12px;
  }
}
</style>