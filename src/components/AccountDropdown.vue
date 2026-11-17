<template>
    <div class="account-wrapper" ref="dropdownRef">
      <!-- Кнопка у хедері -->
      <button class="btn-cabinet" type="button" @click="toggleDropdown">
        <img
          v-if="currentUser.avatarUrl"
          :src="currentUser.avatarUrl"
          alt="Avatar"
          class="header-avatar-img"
        />
        <span v-else class="header-avatar-letter">
          {{ currentUser.nickname.charAt(0).toUpperCase() }}
        </span>
        <span class="btn-text">{{ currentUser.nickname }}</span>
        <Icon icon="mdi:chevron-down" class="chevron-icon" />
      </button>
  
      <!-- ВИПАДАЮЧЕ МЕНЮ ЯК НА СКРІНШОТІ XENFORO -->
      <div v-if="isOpen" class="xen-dropdown">
        <!-- Вкладки зверху -->
        <div class="xen-tabs">
          <button
            type="button"
            class="xen-tab"
            :class="{ active: activeTab === 'account' }"
            @click="activeTab = 'account'"
          >
            Ваш обліковий запис
          </button>
          <button
            type="button"
            class="xen-tab"
            :class="{ active: activeTab === 'bookmarks' }"
            @click="activeTab = 'bookmarks'"
          >
            Закладки
          </button>
        </div>
  
        <!-- ВКЛАДКА 1: ВАШ ОБЛІКОВИЙ ЗАПИС -->
        <div v-if="activeTab === 'account'">
          <!-- Шапка профілю з аватаром та статистикою -->
          <div class="xen-profile-header">
            <div class="xen-avatar-box" @click="openSettingsModal('info')" title="Змінити аватар">
              <img v-if="currentUser.avatarUrl" :src="currentUser.avatarUrl" alt="Avatar" />
              <span v-else>{{ currentUser.nickname.charAt(0).toUpperCase() }}</span>
              <div class="avatar-edit-overlay">Змінити</div>
            </div>
  
            <div class="xen-user-meta">
              <div class="xen-username">{{ currentUser.nickname }}</div>
              <div class="xen-usertitle">
                {{ currentUser.role === 'admin' ? 'Адміністратор UKRAINE GTA' : currentUser.title }}
              </div>
              <div v-if="currentUser.status" class="xen-current-status">
                «{{ currentUser.status }}»
              </div>
  
              <div class="xen-stats-table">
                <div class="xen-stat-row">
                  <span>Дописи:</span>
                  <strong>{{ userPostsCount }}</strong>
                </div>
                <div class="xen-stat-row">
                  <span>Реакції:</span>
                  <strong>{{ currentUser.reactions || 0 }}</strong>
                </div>
                <div class="xen-stat-row">
                  <span>Бали:</span>
                  <strong>{{ currentUser.points || 10 }}</strong>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Сітка пунктів керування у 2 колонки -->
          <div class="xen-links-grid">
            <button type="button" @click="openSettingsModal('posts')">
              <Icon icon="mdi:newspaper-variant-outline" /> Ваші публікації
            </button>
            <button type="button" @click="openSettingsModal('signature')">
              <Icon icon="mdi:pen" /> Підпис
            </button>
            <button type="button" @click="openSettingsModal('info')">
              <Icon icon="mdi:account-details-outline" /> Інформація
            </button>
            <button type="button" @click="openSettingsModal('security')">
              <Icon icon="mdi:shield-lock-outline" /> Безпека
            </button>
            <button type="button" @click="openSettingsModal('info')">
              <Icon icon="mdi:cog-outline" /> Налаштування
            </button>
            <button type="button" class="logout-link" @click="handleLogout">
              <Icon icon="mdi:logout" /> Вихід
            </button>
          </div>
  
          <!-- Поле швидкого оновлення статусу -->
          <form @submit.prevent="handleQuickStatus" class="xen-status-box">
            <input
              v-model="quickStatus"
              type="text"
              placeholder="Оновити свій статус..."
              maxlength="80"
            />
            <button v-if="quickStatus.trim()" type="submit" class="btn-status-ok">OK</button>
          </form>
        </div>
  
        <!-- ВКЛАДКА 2: ЗАКЛАДКИ -->
        <div v-else class="xen-bookmarks-empty">
          <Icon icon="mdi:bookmark-outline" class="bm-icon" />
          <p>У вас поки що немає збережених закладок.</p>
        </div>
      </div>
  
      <!-- МОДАЛЬНЕ ВІКНО ПОВНОГО КЕРУВАННЯ ОБЛІКОВИМ ЗАПИСОМ -->
      <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
        <div class="settings-modal">
          <div class="settings-sidebar">
            <div class="settings-sidebar-title">Ваш обліковий запис</div>
            <button
              type="button"
              :class="{ active: modalSection === 'info' }"
              @click="modalSection = 'info'"
            >
              <Icon icon="mdi:account-edit" /> Інформація та аватар
            </button>
            <button
              type="button"
              :class="{ active: modalSection === 'signature' }"
              @click="modalSection = 'signature'"
            >
              <Icon icon="mdi:fountain-pen-tip" /> Підпис на форумі
            </button>
            <button
              type="button"
              :class="{ active: modalSection === 'security' }"
              @click="modalSection = 'security'"
            >
              <Icon icon="mdi:lock-reset" /> Безпека та пароль
            </button>
            <button
              type="button"
              :class="{ active: modalSection === 'posts' }"
              @click="modalSection = 'posts'"
            >
              <Icon icon="mdi:format-list-bulleted" /> Ваші публікації ({{ userPostsCount }})
            </button>
          </div>
  
          <div class="settings-content">
            <button class="close-modal-btn" @click="isModalOpen = false">✕</button>
  
            <!-- РОЗДІЛ 1: ІНФОРМАЦІЯ ТА АВАТАР -->
            <form v-if="modalSection === 'info'" @submit.prevent="saveProfileInfo" class="settings-form">
              <h3>Інформація облікового запису</h3>
  
              <label>Посилання на аватар (URL картинки)</label>
              <input
                v-model="formAvatar"
                type="url"
                placeholder="https://i.imgur.com/ваш-аватар.png"
              />
              <span class="hint">Вставте пряме посилання на зображення (Imgur, Postimages тощо)</span>
  
              <label>Нестандартне звання (статус під ніком)</label>
              <input
                v-model="formTitle"
                type="text"
                placeholder="Наприклад: Старожила UKRAINE GTA"
              />
  
              <label>Про себе</label>
              <textarea
                v-model="formAbout"
                rows="3"
                placeholder="Розкажіть коротко про вашого персонажа або сервер..."
              ></textarea>
  
              <p v-if="feedbackMsg" class="success-msg">{{ feedbackMsg }}</p>
  
              <button type="submit" class="btn-save-settings" :disabled="saving">
                {{ saving ? 'Збереження...' : 'Зберегти зміни' }}
              </button>
            </form>
  
            <!-- РОЗДІЛ 2: ПІДПИС -->
            <form v-else-if="modalSection === 'signature'" @submit.prevent="saveSignature" class="settings-form">
              <h3>Підпис під повідомленнями</h3>
              <p class="hint">Цей текст автоматично відображатиметься під кожним вашим дописом на форумі.</p>
  
              <textarea
                v-model="formSignature"
                rows="4"
                placeholder="Наприклад: Генерал СБУ | Сервер №2 Західна Україна"
              ></textarea>
  
              <p v-if="feedbackMsg" class="success-msg">{{ feedbackMsg }}</p>
  
              <button type="submit" class="btn-save-settings" :disabled="saving">
                Зберегти підпис
              </button>
            </form>
  
            <!-- РОЗДІЛ 3: БЕЗПЕКА (ЗМІНА ПАРОЛЯ) -->
            <form v-else-if="modalSection === 'security'" @submit.prevent="saveNewPassword" class="settings-form">
              <h3>Безпека та зміна пароля</h3>
  
              <label>Ваш поточний пароль</label>
              <input v-model="oldPass" type="password" required placeholder="••••••••" />
  
              <label>Новий пароль (мінімум 6 символів)</label>
              <input v-model="newPass" type="password" required minlength="6" placeholder="••••••••" />
  
              <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
              <p v-if="feedbackMsg" class="success-msg">{{ feedbackMsg }}</p>
  
              <button type="submit" class="btn-save-settings" :disabled="saving">
                Оновити пароль
              </button>
            </form>
  
            <!-- РОЗДІЛ 4: ВАШІ ПУБЛІКАЦІЇ -->
            <div v-else-if="modalSection === 'posts'" class="user-posts-list">
              <h3>Ваші створені теми ({{ myTopics.length }})</h3>
              <div v-if="myTopics.length === 0" class="hint">
                Ви ще не створили жодної теми на форумі.
              </div>
              <div v-for="t in myTopics" :key="t.id" class="mini-post-item">
                <div class="mini-post-title">{{ t.title }}</div>
                <div class="mini-post-date">{{ t.dateText }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { Icon } from '@iconify/vue'
  import { currentUser, updateUserProfile, changeUserPassword, logoutUser } from '../authStore.js'
  import { forumTopics, forumReplies } from '../forumStore.js'
  
  const isOpen = ref(false)
  const activeTab = ref('account')
  const dropdownRef = ref(null)
  const quickStatus = ref('')
  
  // Підрахунок дописів поточного гравця
  const myTopics = computed(() =>
    forumTopics.value.filter((t) => t.author === currentUser.value?.nickname)
  )
  const myReplies = computed(() =>
    forumReplies.value.filter((r) => r.author === currentUser.value?.nickname)
  )
  const userPostsCount = computed(() => myTopics.value.length + myReplies.value.length)
  
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
  }
  
  // Закриття меню при кліку поза ним
  const handleClickOutside = (e) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
      isOpen.value = false
    }
  }
  
  onMounted(() => document.addEventListener('click', handleClickOutside))
  onUnmounted(() => document.removeEventListener('click', handleClickOutside))
  
  // Швидке оновлення статусу прямо з випадаючого меню
  const handleQuickStatus = async () => {
    if (!quickStatus.value.trim()) return
    await updateUserProfile({ status: quickStatus.value.trim() })
    quickStatus.value = ''
  }
  
  // Модальне вікно повних налаштувань
  const isModalOpen = ref(false)
  const modalSection = ref('info')
  const saving = ref(false)
  const feedbackMsg = ref('')
  const errorMsg = ref('')
  
  const formAvatar = ref('')
  const formTitle = ref('')
  const formAbout = ref('')
  const formSignature = ref('')
  const oldPass = ref('')
  const newPass = ref('')
  
  const openSettingsModal = (section) => {
    feedbackMsg.value = ''
    errorMsg.value = ''
    formAvatar.value = currentUser.value?.avatarUrl || ''
    formTitle.value = currentUser.value?.title || ''
    formAbout.value = currentUser.value?.about || ''
    formSignature.value = currentUser.value?.signature || ''
    modalSection.value = section
    isOpen.value = false
    isModalOpen.value = true
  }
  
  const saveProfileInfo = async () => {
    saving.value = true
    feedbackMsg.value = ''
    await updateUserProfile({
      avatarUrl: formAvatar.value.trim(),
      title: formTitle.value.trim() || 'Гравець UKRAINE GTA',
      about: formAbout.value.trim()
    })
    saving.value = false
    feedbackMsg.value = 'Налаштування профілю успішно збережено!'
  }
  
  const saveSignature = async () => {
    saving.value = true
    feedbackMsg.value = ''
    await updateUserProfile({
      signature: formSignature.value.trim()
    })
    saving.value = false
    feedbackMsg.value = 'Підпис оновлено!'
  }
  
  const saveNewPassword = async () => {
    saving.value = true
    errorMsg.value = ''
    feedbackMsg.value = ''
    try {
      await changeUserPassword(oldPass.value, newPass.value)
      oldPass.value = ''
      newPass.value = ''
      feedbackMsg.value = 'Пароль успішно змінено!'
    } catch (err) {
      errorMsg.value = err.message
    } finally {
      saving.value = false
    }
  }
  
  const handleLogout = () => {
    isOpen.value = false
    logoutUser()
  }
  </script>
  
  <style scoped>
  .account-wrapper {
    position: relative;
  }
  
  .header-avatar-img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .header-avatar-letter {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
  }
  
  .chevron-icon {
    font-size: 16px;
    margin-left: 2px;
  }
  
  /* ФІРМОВЕ ВИПАДАЮЧЕ МЕНЮ XENFORO */
  .xen-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 360px;
    background: #181a22;
    border: 1px solid #2b3040;
    border-top: 3px solid #ff6b00;
    border-radius: 8px;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.75);
    z-index: 2500;
    color: #e2e4ec;
    overflow: hidden;
  }
  
  .xen-tabs {
    display: flex;
    background: #12141b;
    border-bottom: 1px solid #252936;
  }
  
  .xen-tab {
    flex: 1;
    background: none;
    border: none;
    padding: 11px;
    color: #8a8d98;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  
  .xen-tab.active {
    color: #fff;
    border-bottom-color: #ff6b00;
    background: #181a22;
  }
  
  .xen-profile-header {
    display: flex;
    gap: 14px;
    padding: 16px;
    border-bottom: 1px solid #252936;
  }
  
  .xen-avatar-box {
    width: 76px;
    height: 76px;
    border-radius: 6px;
    background: linear-gradient(135deg, #ff3b30, #ff6b00);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 900;
    color: #fff;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    flex-shrink: 0;
  }
  
  .xen-avatar-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .avatar-edit-overlay {
    position: absolute;
    bottom: 0;
    inset-x: 0;
    background: rgba(0, 0, 0, 0.75);
    font-size: 10px;
    text-align: center;
    padding: 3px 0;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .xen-avatar-box:hover .avatar-edit-overlay {
    opacity: 1;
  }
  
  .xen-user-meta {
    flex: 1;
    min-width: 0;
  }
  
  .xen-username {
    font-size: 16px;
    font-weight: 800;
    color: #ff4d4d;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .xen-usertitle {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 4px;
  }
  
  .xen-current-status {
    font-size: 11px;
    color: #f59e0b;
    font-style: italic;
    margin-bottom: 6px;
  }
  
  .xen-stats-table {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
  }
  
  .xen-stat-row {
    display: flex;
    justify-content: space-between;
    color: #8a8d98;
  }
  
  .xen-stat-row strong {
    color: #e5e7eb;
  }
  
  .xen-links-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 12px;
    border-bottom: 1px solid #252936;
  }
  
  .xen-links-grid button {
    background: none;
    border: none;
    color: #c5c8d4;
    font-size: 13px;
    padding: 7px 8px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    text-align: left;
  }
  
  .xen-links-grid button:hover {
    background: #232735;
    color: #fff;
  }
  
  .xen-links-grid .logout-link {
    color: #ff6b6b;
  }
  
  .xen-status-box {
    padding: 12px;
    display: flex;
    gap: 6px;
    background: #14161d;
  }
  
  .xen-status-box input {
    flex: 1;
    background: #0d0e13;
    border: 1px solid #282d3d;
    border-radius: 5px;
    padding: 8px 10px;
    color: #fff;
    font-size: 12px;
    outline: none;
  }
  
  .xen-status-box input:focus {
    border-color: #ff6b00;
  }
  
  .btn-status-ok {
    background: #ff6b00;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 0 10px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
  }
  
  .xen-bookmarks-empty {
    padding: 36px 20px;
    text-align: center;
    color: #8a8d98;
    font-size: 13px;
  }
  
  .bm-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }
  
  /* МОДАЛЬНЕ ВІКНО НАЛАШТУВАНЬ АКАУНТА */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3500;
    padding: 16px;
  }
  
  .settings-modal {
    display: flex;
    background: #14161e;
    border: 1px solid #282d3d;
    border-radius: 12px;
    width: 100%;
    max-width: 740px;
    min-height: 400px;
    overflow: hidden;
    color: #fff;
  }
  
  .settings-sidebar {
    width: 220px;
    background: #101218;
    border-right: 1px solid #232733;
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .settings-sidebar-title {
    font-size: 12px;
    text-transform: uppercase;
    color: #6c7284;
    font-weight: 700;
    padding: 0 10px 10px;
  }
  
  .settings-sidebar button {
    background: none;
    border: none;
    color: #c5c8d4;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-align: left;
  }
  
  .settings-sidebar button.active,
  .settings-sidebar button:hover {
    background: #1e222e;
    color: #ff6b00;
    font-weight: 600;
  }
  
  .settings-content {
    flex: 1;
    padding: 28px;
    position: relative;
  }
  
  .close-modal-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: #8a8d98;
    font-size: 18px;
    cursor: pointer;
  }
  
  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .settings-form h3 {
    margin: 0 0 8px;
  }
  
  .settings-form label {
    font-size: 13px;
    color: #9ca3af;
  }
  
  .settings-form input,
  .settings-form textarea {
    background: #0b0c10;
    border: 1px solid #232733;
    border-radius: 8px;
    padding: 11px 14px;
    color: #fff;
    font-family: inherit;
    font-size: 14px;
  }
  
  .hint {
    font-size: 12px;
    color: #6c7284;
    margin-top: -6px;
  }
  
  .btn-save-settings {
    margin-top: 8px;
    background: linear-gradient(90deg, #ff3b30, #ff6b00);
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    align-self: flex-start;
  }
  
  .success-msg {
    color: #12b76a;
    font-size: 13px;
    margin: 0;
  }
  
  .error-msg {
    color: #ff4d4d;
    font-size: 13px;
    margin: 0;
  }
  
  .mini-post-item {
    padding: 10px 0;
    border-bottom: 1px solid #232733;
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }
  
  .mini-post-date {
    color: #6c7284;
  }
  
  @media (max-width: 650px) {
    .xen-dropdown {
      width: 310px;
      right: -10px;
    }
    .settings-modal {
      flex-direction: column;
    }
    .settings-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #232733;
    }
  }
  </style>