<template>
    <div class="ugta-comms-bar" ref="wrapperRef">
      <!-- ===================================================== -->
      <!-- 1. ІКОНКА КОНВЕРТА (ОСОБИСТІ ПОВІДОМЛЕННЯ)            -->
      <!-- ===================================================== -->
      <div class="comm-item">
        <button
          type="button"
          class="comm-icon-btn"
          :class="{ active: openMenu === 'messages' }"
          title="Особисті повідомлення"
          @click="toggleMenu('messages')"
        >
          <Icon icon="mdi:email-outline" />
          <span v-if="unreadConversationsCount > 0" class="comm-badge">
            {{ unreadConversationsCount }}
          </span>
        </button>
  
        <div v-if="openMenu === 'messages'" class="comm-dropdown">
          <div class="comm-drop-header">
            <span>Листування</span>
            <button type="button" class="btn-new-conv-mini" @click="openNewConversationModal">
              + Нова бесіда
            </button>
          </div>
  
          <div class="comm-drop-list">
            <div v-if="myConversations.length === 0" class="comm-empty">
              У вас ще немає особистих листувань.
            </div>
  
            <div
              v-for="conv in myConversations.slice(0, 8)"
              :key="conv.id"
              class="comm-row"
              :class="{ unread: isConversationUnread(conv) }"
              @click="openConversationWindow(conv.id)"
            >
              <div class="comm-row-avatar">
                <Icon icon="mdi:forum-outline" />
              </div>
              <div class="comm-row-body">
                <div class="comm-row-title">{{ conv.title }}</div>
                <div class="comm-row-preview">
                  <strong>{{ conv.lastSender }}:</strong> {{ conv.lastMessagePreview }}
                </div>
                <div class="comm-row-meta">
                  <span>Учасники: {{ (conv.participantsNames || []).join(', ') }}</span>
                  <span>• {{ conv.dateText }}</span>
                </div>
              </div>
            </div>
          </div>
  
          <div class="comm-drop-footer">
            <button type="button" @click="openConversationWindow(myConversations[0]?.id || null)">
              Показати всі листування...
            </button>
          </div>
        </div>
      </div>
  
      <!-- ===================================================== -->
      <!-- 2. ІКОНКА ДЗВІНОЧКА (СПОВІЩЕННЯ В РЕАЛЬНОМУ ЧАСІ)     -->
      <!-- ===================================================== -->
      <div class="comm-item">
        <button
          type="button"
          class="comm-icon-btn"
          :class="{ active: openMenu === 'alerts' }"
          title="Сповіщення"
          @click="toggleMenu('alerts')"
        >
          <Icon icon="mdi:bell-outline" />
          <span v-if="unreadAlertsCount > 0" class="comm-badge">
            {{ unreadAlertsCount }}
          </span>
        </button>
  
        <div v-if="openMenu === 'alerts'" class="comm-dropdown">
          <div class="comm-drop-header">
            <span>Сповіщення</span>
            <button
              v-if="unreadAlertsCount > 0"
              type="button"
              class="btn-mark-all"
              @click="markAllNotificationsRead(currentUser.nickname)"
            >
              Позначити всі прочитаними
            </button>
          </div>
  
          <div class="comm-drop-list">
            <div v-if="myNotifications.length === 0" class="comm-empty">
              Нових сповіщень немає.
            </div>
  
            <div
              v-for="notif in myNotifications.slice(0, 15)"
              :key="notif.id"
              class="comm-row"
              :class="{ unread: !notif.isRead }"
              @click="handleNotificationClick(notif)"
            >
              <div class="comm-row-avatar alert-type-icon" :class="'type-' + notif.type">
                <Icon :icon="getNotifIcon(notif.type)" />
              </div>
              <div class="comm-row-body">
                <div class="comm-row-text">{{ notif.text }}</div>
                <div class="comm-row-meta">{{ notif.dateText }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- ===================================================== -->
      <!-- МОДАЛЬНЕ ВІКНО ОСОБИСТИХ БЕСІД (1-НА-1 ТА ГРУПОВИХ)   -->
      <!-- ===================================================== -->
      <div v-if="isInboxModalOpen" class="inbox-overlay" @click.self="isInboxModalOpen = false">
        <div class="inbox-modal">
          <!-- Ліва колонка: список бесід -->
          <aside class="inbox-sidebar">
            <div class="inbox-sidebar-head">
              <h3>Особисті бесіди</h3>
              <button type="button" class="btn-start-chat" @click="isCreatingNew = true">
                + Створити
              </button>
            </div>
  
            <div class="inbox-conv-list">
              <div v-if="myConversations.length === 0" class="comm-empty">
                Немає активних бесід
              </div>
  
              <div
                v-for="conv in myConversations"
                :key="conv.id"
                class="inbox-conv-item"
                :class="{
                  selected: !isCreatingNew && activeConvId === conv.id,
                  unread: isConversationUnread(conv)
                }"
                @click="selectConversation(conv.id)"
              >
                <div class="conv-item-title">{{ conv.title }}</div>
                <div class="conv-item-users">
                  {{ (conv.participantsNames || []).join(', ') }}
                </div>
                <div class="conv-item-date">{{ conv.dateText }}</div>
              </div>
            </div>
          </aside>
  
          <!-- Права колонка: створення нової бесіди або активний діалог -->
          <div class="inbox-main">
            <button type="button" class="inbox-close-btn" @click="isInboxModalOpen = false">
              ✕
            </button>
  
            <!-- ФОРМА СТВОРЕННЯ НОВОЇ БЕСІДИ -->
            <form v-if="isCreatingNew" @submit.prevent="handleCreateConversation" class="new-conv-form">
              <h3>Нове особисте листування</h3>
  
              <label>Отримувачі (нікнейм одного гравця або кількох через кому)</label>
              <input
                v-model="newConvForm.recipients"
                type="text"
                placeholder="Наприклад: Жорж Дюпон, Admin_Name"
                required
              />
  
              <label>Заголовок бесіди</label>
              <input
                v-model="newConvForm.title"
                type="text"
                placeholder="Наприклад: Обговорення обзвону / Апеляція"
                required
              />
  
              <label>Повідомлення</label>
              <RichTextEditor
                v-model="newConvForm.message"
                :rows="6"
                placeholder="Введіть текст повідомлення..."
              />
  
              <p v-if="convError" class="conv-error-msg">{{ convError }}</p>
  
              <div class="new-conv-actions">
                <button
                  v-if="myConversations.length > 0"
                  type="button"
                  class="btn-cancel-conv"
                  @click="isCreatingNew = false"
                >
                  Скасувати
                </button>
                <button type="submit" class="btn-send-conv">
                  <Icon icon="mdi:send" /> Розпочати бесіду
                </button>
              </div>
            </form>
  
            <!-- АКТИВНИЙ ДІАЛОГ -->
            <div v-else-if="activeConversation" class="active-conv-view">
              <div class="active-conv-header">
                <div>
                  <h3>{{ activeConversation.title }}</h3>
                  <div class="participants-bar">
                    <span>Учасники:</span>
                    <strong
                      v-for="(pName, idx) in activeConversation.participantsNames"
                      :key="pName"
                      class="participant-chip"
                    >
                      {{ pName }}<span v-if="idx < activeConversation.participantsNames.length - 1">, </span>
                    </strong>
                  </div>
                </div>
  
                <!-- Додати ще одного учасника до бесіди -->
                <form @submit.prevent="handleAddParticipant" class="add-member-form">
                  <input
                    v-model="addMemberNick"
                    type="text"
                    placeholder="Додати гравця..."
                  />
                  <button type="submit">+</button>
                </form>
              </div>
  
              <p v-if="convError" class="conv-error-msg px-16">{{ convError }}</p>
  
              <div class="conv-messages-feed">
                <div
                  v-for="msg in activeConversationMessages"
                  :key="msg.id"
                  class="conv-msg-card"
                  :class="{ 'my-msg': msg.author?.toLowerCase() === currentUser.nickname?.toLowerCase() }"
                >
                  <div class="conv-msg-head">
                    <strong>{{ msg.author }}</strong>
                    <span>{{ msg.dateText }}</span>
                  </div>
                  <div
                    class="conv-msg-body formatted-content"
                    v-html="renderBbCodeHtml(msg.content)"
                  ></div>
                </div>
              </div>
  
              <form @submit.prevent="handleReplyInConversation" class="conv-reply-box">
                <RichTextEditor
                  v-model="convReplyText"
                  :rows="3"
                  placeholder="Написати відповідь у бесіду..."
                />
                <button type="submit" class="btn-send-conv">
                  <Icon icon="mdi:reply" /> Надіслати
                </button>
              </form>
            </div>
  
            <div v-else class="inbox-empty-placeholder">
              Оберіть бесіду ліворуч або натисніть «+ Створити», щоб написати повідомлення.
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
  import { Icon } from '@iconify/vue'
  import { currentUser } from '../authStore.js'
  import { renderBbCodeHtml } from '../bbcodeParser.js'
  import RichTextEditor from './RichTextEditor.vue'
  import {
    allNotifications,
    allConversations,
    allConversationMessages,
    initForumListeners,
    markNotificationRead,
    markAllNotificationsRead,
    createConversation,
    sendConversationMessage,
    markConversationRead,
    addParticipantToConversation
  } from '../forumStore.js'
  
  const wrapperRef = ref(null)
  const openMenu = ref(null) // 'messages' | 'alerts' | null
  
  const toggleMenu = (menuName) => {
    openMenu.value = openMenu.value === menuName ? null : menuName
  }
  
  const handleOutsideClick = (e) => {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
      openMenu.value = null
    }
  }
  
  onMounted(() => {
    initForumListeners()
    document.addEventListener('click', handleOutsideClick)
  })
  onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
  
  // Сповіщення поточного гравця
  const myNotifications = computed(() => {
    const lower = currentUser.value?.nickname?.toLowerCase()
    if (!lower) return []
    return allNotifications.value.filter((n) => n.targetNickLower === lower)
  })
  
  const unreadAlertsCount = computed(
    () => myNotifications.value.filter((n) => !n.isRead).length
  )
  
  const getNotifIcon = (type) => {
    if (type === 'reply') return 'mdi:message-reply-text'
    if (type === 'status') return 'mdi:check-decagram'
    if (type === 'role') return 'mdi:shield-star'
    if (type === 'wall') return 'mdi:account-edit'
    return 'mdi:bell-ring'
  }
  
  const handleNotificationClick = async (notif) => {
    await markNotificationRead(notif.id)
    openMenu.value = null
    // Передаємо подію навігації для відкриття теми або профілю
    window.dispatchEvent(
      new CustomEvent('ugta-navigate', {
        detail: {
          topicId: notif.topicId || '',
          profileNick: notif.profileNick || ''
        }
      })
    )
  }
  
  // Бесіди поточного гравця
  const myConversations = computed(() => {
    const lower = currentUser.value?.nickname?.toLowerCase()
    if (!lower) return []
    return allConversations.value.filter(
      (c) => Array.isArray(c.participantsLower) && c.participantsLower.includes(lower)
    )
  })
  
  const isConversationUnread = (conv) => {
    const lower = currentUser.value?.nickname?.toLowerCase()
    return Boolean(lower && Array.isArray(conv.unreadBy) && conv.unreadBy.includes(lower))
  }
  
  const unreadConversationsCount = computed(
    () => myConversations.value.filter((c) => isConversationUnread(c)).length
  )
  
  // Модальне вікно листувань
  const isInboxModalOpen = ref(false)
  const isCreatingNew = ref(false)
  const activeConvId = ref(null)
  const convError = ref('')
  const addMemberNick = ref('')
  const convReplyText = ref('')
  
  const newConvForm = reactive({
    recipients: '',
    title: '',
    message: ''
  })
  
  const activeConversation = computed(
    () => myConversations.value.find((c) => c.id === activeConvId.value) || null
  )
  
  const activeConversationMessages = computed(() => {
    if (!activeConvId.value) return []
    return allConversationMessages.value.filter((m) => m.conversationId === activeConvId.value)
  })
  
  const openNewConversationModal = () => {
    openMenu.value = null
    convError.value = ''
    newConvForm.recipients = ''
    newConvForm.title = ''
    newConvForm.message = ''
    isCreatingNew.value = true
    isInboxModalOpen.value = true
  }
  
  const openConversationWindow = async (convId) => {
    openMenu.value = null
    convError.value = ''
    isInboxModalOpen.value = true
    if (convId) {
      isCreatingNew.value = false
      activeConvId.value = convId
      await markConversationRead(convId, currentUser.value?.nickname)
    } else {
      isCreatingNew.value = true
    }
  }
  
  const selectConversation = async (convId) => {
    convError.value = ''
    isCreatingNew.value = false
    activeConvId.value = convId
    await markConversationRead(convId, currentUser.value?.nickname)
  }
  
  const handleCreateConversation = async () => {
    convError.value = ''
    try {
      const nicks = newConvForm.recipients.split(',').map((s) => s.trim()).filter(Boolean)
      const createdId = await createConversation({
        title: newConvForm.title,
        creatorNickname: currentUser.value.nickname,
        creatorAvatar: currentUser.value.avatarUrl || '',
        participantNicknames: nicks,
        firstMessage: newConvForm.message
      })
      newConvForm.recipients = ''
      newConvForm.title = ''
      newConvForm.message = ''
      isCreatingNew.value = false
      activeConvId.value = createdId
    } catch (err) {
      convError.value = err.message
    }
  }
  
  const handleAddParticipant = async () => {
    if (!activeConvId.value || !addMemberNick.value.trim()) return
    convError.value = ''
    try {
      await addParticipantToConversation(activeConvId.value, addMemberNick.value)
      addMemberNick.value = ''
    } catch (err) {
      convError.value = err.message
    }
  }
  
  const handleReplyInConversation = async () => {
    if (!activeConvId.value || !convReplyText.value.trim()) return
    await sendConversationMessage({
      conversationId: activeConvId.value,
      authorNickname: currentUser.value.nickname,
      authorAvatar: currentUser.value.avatarUrl || '',
      content: convReplyText.value
    })
    convReplyText.value = ''
  }
  </script>
  
  <style scoped>
  .ugta-comms-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
  }
  
  .comm-item {
    position: relative;
  }
  
  .comm-icon-btn {
    background: #181a22;
    border: 1px solid #2b3040;
    color: #d1d5db;
    width: 38px;
    height: 38px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    position: relative;
    transition: all 0.15s;
  }
  
  .comm-icon-btn:hover,
  .comm-icon-btn.active {
    border-color: #ff6b00;
    color: #fff;
    background: #222634;
  }
  
  .comm-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #ef4444;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #0f0f16;
  }
  
  .comm-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 360px;
    max-width: 92vw;
    background: #181a22;
    border: 1px solid #2b3040;
    border-top: 3px solid #ff6b00;
    border-radius: 8px;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.78);
    z-index: 2600;
    overflow: hidden;
    color: #e5e7eb;
  }
  
  .comm-drop-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: #12141b;
    border-bottom: 1px solid #252936;
    font-size: 14px;
    font-weight: 700;
  }
  
  .btn-new-conv-mini,
  .btn-mark-all {
    background: none;
    border: none;
    color: #ff6b00;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  
  .comm-drop-list {
    max-height: 330px;
    overflow-y: auto;
  }
  
  .comm-empty {
    padding: 28px 16px;
    text-align: center;
    color: #8a8d98;
    font-size: 13px;
  }
  
  .comm-row {
    display: flex;
    gap: 11px;
    padding: 11px 14px;
    border-bottom: 1px solid #222634;
    cursor: pointer;
    transition: background 0.15s;
  }
  
  .comm-row:hover {
    background: #202432;
  }
  
  .comm-row.unread {
    background: rgba(255, 107, 0, 0.08);
    border-left: 3px solid #ff6b00;
  }
  
  .comm-row-avatar {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #252a3a;
    color: #ff6b00;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .alert-type-icon.type-status { color: #10b981; }
  .alert-type-icon.type-role { color: #facc15; }
  .alert-type-icon.type-reply { color: #5ea5ff; }
  
  .comm-row-body {
    flex: 1;
    min-width: 0;
  }
  
  .comm-row-title {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }
  
  .comm-row-preview,
  .comm-row-text {
    font-size: 12px;
    color: #cbd5e1;
    line-height: 1.4;
  }
  
  .comm-row-meta {
    font-size: 11px;
    color: #6c7284;
    margin-top: 4px;
  }
  
  .comm-drop-footer {
    padding: 10px;
    text-align: center;
    background: #12141b;
    border-top: 1px solid #252936;
  }
  
  .comm-drop-footer button {
    background: none;
    border: none;
    color: #5ea5ff;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  
  /* МОДАЛКА ОСОБИСТИХ БЕСІД */
  .inbox-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3600;
    padding: 14px;
  }
  
  .inbox-modal {
    display: flex;
    width: 100%;
    max-width: 960px;
    height: 82vh;
    max-height: 680px;
    background: #14161e;
    border: 1px solid #282d3d;
    border-radius: 12px;
    overflow: hidden;
    color: #fff;
  }
  
  .inbox-sidebar {
    width: 290px;
    background: #101218;
    border-right: 1px solid #232733;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }
  
  .inbox-sidebar-head {
    padding: 16px;
    border-bottom: 1px solid #232733;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .inbox-sidebar-head h3 {
    margin: 0;
    font-size: 15px;
  }
  
  .btn-start-chat {
    background: linear-gradient(90deg, #ff3b30, #ff6b00);
    color: #fff;
    border: none;
    padding: 6px 11px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  
  .inbox-conv-list {
    flex: 1;
    overflow-y: auto;
  }
  
  .inbox-conv-item {
    padding: 13px 15px;
    border-bottom: 1px solid #1c202b;
    cursor: pointer;
  }
  
  .inbox-conv-item:hover {
    background: #181b25;
  }
  
  .inbox-conv-item.selected {
    background: #1e2230;
    border-left: 3px solid #ff6b00;
  }
  
  .inbox-conv-item.unread .conv-item-title {
    color: #ff6b00;
  }
  
  .conv-item-title {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 3px;
  }
  
  .conv-item-users {
    font-size: 11px;
    color: #9ca3af;
  }
  
  .conv-item-date {
    font-size: 10px;
    color: #6c7284;
    margin-top: 3px;
  }
  
  .inbox-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .inbox-close-btn {
    position: absolute;
    top: 12px;
    right: 14px;
    background: #1e222e;
    border: 1px solid #2f3548;
    color: #fff;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    cursor: pointer;
    z-index: 5;
  }
  
  .new-conv-form {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
  }
  
  .new-conv-form h3 {
    margin: 0 0 6px;
  }
  
  .new-conv-form label {
    font-size: 12px;
    color: #9ca3af;
  }
  
  .new-conv-form input {
    background: #0b0c10;
    border: 1px solid #282d3d;
    border-radius: 6px;
    padding: 10px 12px;
    color: #fff;
    font-size: 14px;
  }
  
  .new-conv-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
  }
  
  .btn-cancel-conv {
    background: #232733;
    color: #fff;
    border: none;
    padding: 9px 16px;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .btn-send-conv {
    background: linear-gradient(90deg, #ff3b30, #ff6b00);
    color: #fff;
    border: none;
    padding: 9px 18px;
    border-radius: 6px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    align-self: flex-end;
  }
  
  .active-conv-view {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .active-conv-header {
    padding: 14px 48px 14px 18px;
    background: #101218;
    border-bottom: 1px solid #232733;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .active-conv-header h3 {
    margin: 0 0 4px;
    font-size: 16px;
  }
  
  .participants-bar {
    font-size: 12px;
    color: #8a8d98;
  }
  
  .participant-chip {
    color: #5ea5ff;
  }
  
  .add-member-form {
    display: flex;
    gap: 4px;
  }
  
  .add-member-form input {
    background: #181a22;
    border: 1px solid #2e3446;
    color: #fff;
    padding: 5px 9px;
    border-radius: 5px;
    font-size: 12px;
    width: 145px;
  }
  
  .add-member-form button {
    background: #252a3a;
    border: 1px solid #383f54;
    color: #fff;
    padding: 0 10px;
    border-radius: 5px;
    font-weight: 700;
    cursor: pointer;
  }
  
  .conv-messages-feed {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .conv-msg-card {
    background: #181b25;
    border: 1px solid #252a3a;
    border-radius: 8px;
    padding: 11px 14px;
    max-width: 85%;
  }
  
  .conv-msg-card.my-msg {
    align-self: flex-end;
    background: #1d2230;
    border-color: #36415c;
  }
  
  .conv-msg-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    margin-bottom: 6px;
  }
  
  .conv-msg-head strong {
    color: #ff6b00;
  }
  
  .conv-msg-head span {
    color: #6c7284;
    font-size: 11px;
  }
  
  .conv-msg-body {
    font-size: 14px;
    line-height: 1.55;
    color: #e5e7eb;
  }
  
  .conv-reply-box {
    padding: 12px 16px;
    background: #101218;
    border-top: 1px solid #232733;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .conv-error-msg {
    color: #ff4d4d;
    font-size: 12px;
    margin: 0;
  }
  
  .px-16 {
    padding: 8px 16px 0;
  }
  
  .inbox-empty-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8a8d98;
    font-size: 14px;
    padding: 24px;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    .inbox-modal {
      flex-direction: column;
      height: 90vh;
    }
    .inbox-sidebar {
      width: 100%;
      max-height: 170px;
      border-right: none;
      border-bottom: 1px solid #232733;
    }
  }
  </style>