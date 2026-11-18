<template>
    <div class="xf-profile-page">
      <!-- Кнопка повернення -->
      <div class="profile-nav-bar">
        <button type="button" class="btn-back-forum" @click="$emit('close')">
          <Icon icon="mdi:arrow-left" /> Назад до форуму
        </button>
      </div>
  
      <!-- ШАПКА ПРОФІЛЮ З БАНЕРОМ (ЯК НА ВІДЕО) -->
      <div class="xf-profile-hero">
        <div
          class="xf-profile-banner"
          :style="bannerStyle"
        >
          <div class="banner-gradient-mask"></div>
  
          <button
            v-if="canEditBanner"
            type="button"
            class="btn-edit-banner"
            @click="isBannerModalOpen = true"
          >
            <Icon icon="mdi:image-edit-outline" /> Редагувати банер профілю
          </button>
        </div>
  
        <div class="xf-profile-header-content">
          <div class="xf-profile-avatar-large">
            <img v-if="targetUser.avatarUrl" :src="targetUser.avatarUrl" alt="Avatar" />
            <span v-else>{{ targetUser.nickname.charAt(0).toUpperCase() }}</span>
          </div>
  
          <div class="xf-profile-identity">
            <div class="xf-profile-name-row">
              <h1 class="xf-profile-nick">{{ targetUser.nickname }}</h1>
            </div>
  
            <div v-if="targetUser.title" class="xf-profile-custom-title">
              {{ targetUser.title }}
            </div>
  
            <!-- Основна роль та додаткові статусні ролі -->
            <div class="xf-profile-roles-row">
              <span class="ugta-role-banner" :class="roleInfo.cssClass">
                {{ roleInfo.label }}
              </span>
  
              <span
                v-for="badge in extraBadges"
                :key="badge.id"
                class="ugta-extra-badge inline-badge"
                :class="badge.cssClass"
              >
                {{ badge.label }}
              </span>
            </div>
  
            <div class="xf-profile-meta-line">
              <span>Реєстрація: <strong>{{ targetUser.createdAt || 'Нещодавно' }}</strong></span>
              <span>•</span>
              <span>Активність: <strong>Переглядає профіль {{ targetUser.nickname }}</strong></span>
            </div>
  
            <!-- КЛІКАБЕЛЬНА СТАТИСТИКА (ДОПИСИ, РЕАКЦІЇ, БАЛИ) -->
            <div class="xf-profile-counters">
              <button
                type="button"
                class="counter-block clickable-counter"
                title="Натисніть, щоб переглянути всі дописи гравця"
                @click="activeTab = 'posts'"
              >
                <span class="counter-label">Дописи</span>
                <span class="counter-value">{{ allUserPosts.length }}</span>
              </button>
  
              <div class="counter-block">
                <span class="counter-label">Реакції</span>
                <span class="counter-value">{{ targetUser.reactions || 0 }}</span>
              </div>
  
              <div class="counter-block">
                <span class="counter-label">Бали</span>
                <span class="counter-value">{{ targetUser.points || 10 }}</span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- ВКЛАДКИ ПРОФІЛЮ -->
        <div class="xf-profile-tabs">
          <button
            type="button"
            class="p-tab"
            :class="{ active: activeTab === 'wall' }"
            @click="activeTab = 'wall'"
          >
            Записи профілю
          </button>
          <button
            type="button"
            class="p-tab"
            :class="{ active: activeTab === 'activity' }"
            @click="activeTab = 'activity'"
          >
            Остання активність
          </button>
          <button
            type="button"
            class="p-tab"
            :class="{ active: activeTab === 'posts' }"
            @click="activeTab = 'posts'"
          >
            Публікації ({{ allUserPosts.length }})
          </button>
          <button
            type="button"
            class="p-tab"
            :class="{ active: activeTab === 'about' }"
            @click="activeTab = 'about'"
          >
            Інформація
          </button>
        </div>
      </div>
  
      <!-- ========================================================= -->
      <!-- ВКЛАДКА 1: ЗАПИСИ ПРОФІЛЮ (СТІНА ЯК ОКРЕМА ТЕМА)          -->
      <!-- ========================================================= -->
      <div v-if="activeTab === 'wall'" class="xf-wall-section">
        <!-- Форма написання на стіні профілю -->
        <div v-if="currentUser && !isCurrentUserMuted" class="wall-composer-card">
          <div class="wall-composer-avatar">
            <img v-if="currentUser.avatarUrl" :src="currentUser.avatarUrl" alt="Avatar" />
            <span v-else>{{ currentUser.nickname.charAt(0).toUpperCase() }}</span>
          </div>
  
          <form @submit.prevent="handlePublishWallPost" class="wall-composer-form">
            <RichTextEditor
              v-model="wallPostText"
              :rows="4"
              :placeholder="isOwnProfile ? 'Оновити свій статус або залишити запис...' : `Напишіть що-небудь на стіні ${targetUser.nickname}...`"
            />
            <div class="wall-composer-actions">
              <button type="submit" class="btn-wall-submit">
                <Icon icon="mdi:send" /> Опублікувати
              </button>
            </div>
          </form>
        </div>
  
        <!-- Список записів на стіні -->
        <div v-if="userWallPosts.length === 0" class="empty-wall-box">
          На стіні профілю {{ targetUser.nickname }} ще немає жодного запису.
        </div>
  
        <div
          v-for="post in userWallPosts"
          :key="post.id"
          class="wall-post-card"
        >
          <div class="wall-post-avatar" @click="$emit('open-profile', post.author)">
            <img
              v-if="getLiveAvatar(post.author, post.authorAvatar)"
              :src="getLiveAvatar(post.author, post.authorAvatar)"
              alt="Avatar"
            />
            <span v-else>{{ post.author.charAt(0).toUpperCase() }}</span>
          </div>
  
          <div class="wall-post-main">
            <div class="wall-post-head">
              <div class="wall-post-author-line">
                <span class="wall-author-link" @click="$emit('open-profile', post.author)">
                  {{ post.author }}
                </span>
                <span class="wall-post-date">{{ post.dateText }}</span>
              </div>
  
              <button
                v-if="canDeleteWallPost(post)"
                type="button"
                class="btn-wall-delete"
                title="Видалити запис"
                @click="deleteProfilePost(post.id)"
              >
                Видалити
              </button>
            </div>
  
            <!-- Контент запису з підтримкою BB-кодів (картинки, кольори, шрифти) -->
            <div
              class="wall-post-body formatted-content"
              v-html="renderBbCodeHtml(post.content)"
            ></div>
  
            <!-- Коментарі під записом на стіні -->
            <div v-if="post.comments?.length" class="wall-comments-list">
              <div v-for="c in post.comments" :key="c.id" class="wall-comment-item">
                <strong class="wall-author-link" @click="$emit('open-profile', c.author)">
                  {{ c.author }}:
                </strong>
                <span>{{ c.text }}</span>
                <span class="comment-date">{{ c.dateText }}</span>
              </div>
            </div>
  
            <!-- Поле для швидкого коментаря -->
            <form
              v-if="currentUser && !isCurrentUserMuted"
              @submit.prevent="handleSendComment(post.id)"
              class="wall-comment-form"
            >
              <input
                v-model="commentInputs[post.id]"
                type="text"
                placeholder="Написати коментар..."
              />
              <button type="submit">Коментувати</button>
            </form>
          </div>
        </div>
      </div>
  
      <!-- ========================================================= -->
      <!-- ВКЛАДКА 2: УСІ ДОПИСИ ГРАВЦЯ (ЯК РЕЗУЛЬТАТИ ПОШУКУ)        -->
      <!-- ========================================================= -->
      <div v-else-if="activeTab === 'posts'" class="xf-user-posts-section">
        <div class="posts-results-header">
          <h3>Усі дописи гравця {{ targetUser.nickname }} ({{ allUserPosts.length }})</h3>
        </div>
  
        <div v-if="allUserPosts.length === 0" class="empty-wall-box">
          Цей гравець ще не залишав дописів на форумі.
        </div>
  
        <div
          v-for="item in allUserPosts"
          :key="item.uid"
          class="search-result-card"
          @click="$emit('go-to-topic', item.topicId)"
        >
          <div class="sr-avatar">
            <img v-if="targetUser.avatarUrl" :src="targetUser.avatarUrl" alt="Avatar" />
            <span v-else>{{ targetUser.nickname.charAt(0).toUpperCase() }}</span>
          </div>
  
          <div class="sr-body">
            <div class="sr-title-row">
              <span v-if="item.prefix" class="sr-prefix" :class="getPrefixClass(item.prefix)">
                {{ item.prefix }}
              </span>
              <span class="sr-topic-title">{{ item.topicTitle }}</span>
            </div>
  
            <p class="sr-snippet">{{ stripBbCodes(item.content) }}</p>
  
            <div class="sr-meta">
              <span class="sr-nick">{{ targetUser.nickname }}</span>
              <span>•</span>
              <span>{{ item.type === 'topic' ? 'Тема' : 'Відповідь у темі' }}</span>
              <span>•</span>
              <span>{{ item.dateText }}</span>
              <span>•</span>
              <span>Форум: {{ item.nodeTitle }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- ========================================================= -->
      <!-- ВКЛАДКА 3: ОСТАННЯ АКТИВНІСТЬ                             -->
      <!-- ========================================================= -->
      <div v-else-if="activeTab === 'activity'" class="xf-user-posts-section">
        <div v-if="allUserPosts.length === 0" class="empty-wall-box">
          Немає нещодавньої активності.
        </div>
  
        <div
          v-for="item in allUserPosts.slice(0, 15)"
          :key="'act-' + item.uid"
          class="search-result-card"
          @click="$emit('go-to-topic', item.topicId)"
        >
          <div class="sr-body">
            <div class="sr-title-row">
              <span class="sr-nick">{{ targetUser.nickname }}</span>
              <span class="act-verb">
                {{ item.type === 'topic' ? 'створив(ла) тему' : 'відповів(ла) у темі' }}
              </span>
              <span class="sr-topic-title">{{ item.topicTitle }}</span>
            </div>
            <p class="sr-snippet">{{ stripBbCodes(item.content) }}</p>
            <div class="sr-meta">{{ item.dateText }}</div>
          </div>
        </div>
      </div>
  
      <!-- ========================================================= -->
      <!-- ВКЛАДКА 4: ІНФОРМАЦІЯ                                     -->
      <!-- ========================================================= -->
      <div v-else-if="activeTab === 'about'" class="xf-about-card">
        <div class="about-row">
          <span>Нікнейм:</span>
          <strong>{{ targetUser.nickname }}</strong>
        </div>
        <div class="about-row">
          <span>Посада / роль:</span>
          <strong>{{ roleInfo.label }}</strong>
        </div>
        <div v-if="targetUser.title" class="about-row">
          <span>Статус під ніком:</span>
          <strong>{{ targetUser.title }}</strong>
        </div>
        <div v-if="targetUser.about" class="about-row">
          <span>Про себе:</span>
          <p>{{ targetUser.about }}</p>
        </div>
        <div v-if="targetUser.signature" class="about-row">
          <span>Підпис на форумі:</span>
          <p class="sig-preview">{{ targetUser.signature }}</p>
        </div>
      </div>
  
      <!-- МОДАЛКА РЕДАГУВАННЯ БАНЕРА ПРОФІЛЮ -->
      <div v-if="isBannerModalOpen" class="modal-overlay" @click.self="isBannerModalOpen = false">
        <div class="banner-modal-box">
          <h3>Редагувати банер профілю</h3>
          <p>Вставте пряме посилання (URL) на зображення для шапки профілю:</p>
          <input
            v-model="bannerInput"
            type="url"
            placeholder="https://i.imgur.com/ваш-банер.jpg"
          />
          <div class="banner-modal-actions">
            <button type="button" class="btn-cancel" @click="isBannerModalOpen = false">
              Скасувати
            </button>
            <button type="button" class="btn-save" @click="saveProfileBanner">
              Зберегти банер
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch } from 'vue'
  import { Icon } from '@iconify/vue'
  import { currentUser } from '../authStore.js'
  import { getRoleInfo, getRoleLevel, getExtraBadgeInfo } from '../rolesConfig.js'
  import { renderBbCodeHtml } from '../bbcodeParser.js'
  import RichTextEditor from './RichTextEditor.vue'
  import {
    forumNodes,
    forumTopics,
    forumReplies,
    profilePosts,
    usersByNick,
    createProfilePost,
    addProfilePostComment,
    deleteProfilePost,
    updateUserBanner
  } from '../forumStore.js'
  
  const props = defineProps({
    nickname: { type: String, required: true },
    initialTab: { type: String, default: 'wall' } // 'wall' або 'posts'
  })
  
  const emit = defineEmits(['close', 'go-to-topic', 'open-profile'])
  
  const activeTab = ref(props.initialTab)
  
  watch(
    () => [props.nickname, props.initialTab],
    ([, newTab]) => {
      activeTab.value = newTab || 'wall'
    }
  )
  
  // Дані користувача, чий профіль відкрито
  const targetUser = computed(() => {
    const key = props.nickname.toLowerCase()
    return (
      usersByNick.value[key] || {
        id: '',
        nickname: props.nickname,
        role: 'player',
        extraBadges: [],
        title: '',
        avatarUrl: '',
        bannerUrl: '',
        about: '',
        signature: '',
        reactions: 0,
        points: 10
      }
    )
  })
  
  const roleInfo = computed(() => getRoleInfo(targetUser.value.role))
  const extraBadges = computed(() =>
    (targetUser.value.extraBadges || []).map((id) => getExtraBadgeInfo(id)).filter(Boolean)
  )
  
  const myLevel = computed(() => getRoleLevel(currentUser.value?.role))
  const isOwnProfile = computed(
    () => currentUser.value?.nickname?.toLowerCase() === targetUser.value.nickname?.toLowerCase()
  )
  const isCurrentUserMuted = computed(() =>
    Boolean(currentUser.value?.muteUntil && currentUser.value.muteUntil > Date.now())
  )
  
  const canEditBanner = computed(() => Boolean(targetUser.value.id && (isOwnProfile.value || myLevel.value >= 8)))
  
  const bannerStyle = computed(() => {
    if (targetUser.value.bannerUrl) {
      return {
        backgroundImage: `url(${targetUser.value.bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return {
      background: 'linear-gradient(120deg, #1b2234 0%, #3b1922 55%, #161924 100%)'
    }
  })
  
  // Редагування банера
  const isBannerModalOpen = ref(false)
  const bannerInput = ref('')
  watch(isBannerModalOpen, (opened) => {
    if (opened) bannerInput.value = targetUser.value.bannerUrl || ''
  })
  
  const saveProfileBanner = async () => {
    if (!targetUser.value.id) return
    await updateUserBanner(targetUser.value.id, bannerInput.value)
    isBannerModalOpen.value = false
  }
  
  // Записи на стіні цього профілю
  const userWallPosts = computed(() => {
    const key = targetUser.value.nickname.toLowerCase()
    return profilePosts.value.filter((p) => p.targetNickLower === key)
  })
  
  const wallPostText = ref('')
  const handlePublishWallPost = async () => {
    if (!currentUser.value || isCurrentUserMuted.value || !wallPostText.value.trim()) return
    await createProfilePost({
      targetNickLower: targetUser.value.nickname.toLowerCase(),
      authorNickname: currentUser.value.nickname,
      authorAvatar: currentUser.value.avatarUrl || '',
      authorRole: currentUser.value.role || 'player',
      content: wallPostText.value
    })
    wallPostText.value = ''
  }
  
  const canDeleteWallPost = (post) => {
    if (!currentUser.value) return false
    if (myLevel.value >= 2 || isOwnProfile.value) return true
    return post.author?.toLowerCase() === currentUser.value.nickname?.toLowerCase()
  }
  
  const commentInputs = reactive({})
  const handleSendComment = async (postId) => {
    const text = commentInputs[postId]
    if (!text || !text.trim() || !currentUser.value) return
    await addProfilePostComment(postId, {
      authorNickname: currentUser.value.nickname,
      authorAvatar: currentUser.value.avatarUrl || '',
      text
    })
    commentInputs[postId] = ''
  }
  
  // УСІ ДОПИСИ ГРАВЦЯ НА ФОРУМІ (ТЕМИ + ВІДПОВІДІ)
  const allUserPosts = computed(() => {
    const nickLower = targetUser.value.nickname.toLowerCase()
    const list = []
  
    for (const t of forumTopics.value) {
      if (t.author?.toLowerCase() === nickLower) {
        const node = forumNodes.value.find((n) => n.id === t.nodeId)
        list.push({
          uid: 'topic-' + t.id,
          type: 'topic',
          topicId: t.id,
          topicTitle: t.title,
          prefix: t.prefix || '',
          content: t.content,
          dateText: t.dateText,
          nodeTitle: node?.title || 'Форум'
        })
      }
    }
  
    for (const r of forumReplies.value) {
      if (r.author?.toLowerCase() === nickLower) {
        const parentTopic = forumTopics.value.find((t) => t.id === r.topicId)
        if (parentTopic) {
          const node = forumNodes.value.find((n) => n.id === parentTopic.nodeId)
          list.push({
            uid: 'reply-' + r.id,
            type: 'reply',
            topicId: parentTopic.id,
            topicTitle: parentTopic.title,
            prefix: parentTopic.prefix || '',
            content: r.content,
            dateText: r.dateText,
            nodeTitle: node?.title || 'Форум'
          })
        }
      }
    }
  
    return list
  })
  
  const getLiveAvatar = (nick, fallback = '') => {
    if (!nick) return fallback
    return usersByNick.value[nick.toLowerCase()]?.avatarUrl || fallback
  }
  
  const stripBbCodes = (str) => {
    if (!str) return ''
    return str.replace(/\[\/?[A-Z0-9=#'"\s-]+\]/gi, '').slice(0, 220)
  }
  
  const getPrefixClass = (prefix) => {
    if (prefix === 'Важливо' || prefix === 'Відмовлено') return 'prefix-red'
    if (prefix === 'База знань' || prefix === 'Схвалено') return 'prefix-green'
    if (prefix === 'Розглянуто') return 'prefix-lime'
    if (prefix === 'На розгляд') return 'prefix-orange'
    if (prefix === 'В очікуванні') return 'prefix-gray'
    return 'prefix-blue'
  }
  </script>
  
  <style scoped>
  .xf-profile-page {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  
  .profile-nav-bar {
    display: flex;
    align-items: center;
  }
  
  .btn-back-forum {
    background: #1c1f2b;
    border: 1px solid #2e3446;
    color: #e5e7eb;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  
  .btn-back-forum:hover {
    border-color: #ff6b00;
    color: #fff;
  }
  
  /* ШАПКА ПРОФІЛЮ */
  .xf-profile-hero {
    background: #14161e;
    border: 1px solid #232733;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .xf-profile-banner {
    height: 195px;
    position: relative;
  }
  
  .banner-gradient-mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(15, 15, 22, 0.15) 0%, rgba(20, 22, 30, 0.96) 100%);
  }
  
  .btn-edit-banner {
    position: absolute;
    top: 14px;
    right: 16px;
    z-index: 2;
    background: rgba(15, 17, 23, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #fff;
    padding: 7px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  
  .btn-edit-banner:hover {
    border-color: #ff6b00;
    background: #1c1f2b;
  }
  
  .xf-profile-header-content {
    display: flex;
    align-items: flex-end;
    gap: 22px;
    padding: 0 24px 20px;
    margin-top: -75px;
    position: relative;
    z-index: 2;
  }
  
  .xf-profile-avatar-large {
    width: 132px;
    height: 132px;
    border-radius: 10px;
    background: linear-gradient(135deg, #ff3b30, #ff6b00);
    border: 4px solid #14161e;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: 900;
    color: #fff;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .xf-profile-avatar-large img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .xf-profile-identity {
    flex: 1;
    min-width: 0;
  }
  
  .xf-profile-nick {
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 4px;
    color: #fff;
  }
  
  .xf-profile-custom-title {
    font-size: 13px;
    color: #cbd5e1;
    margin-bottom: 8px;
  }
  
  .xf-profile-roles-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
  }
  
  .inline-badge {
    width: auto !important;
    padding: 4px 12px !important;
  }
  
  .xf-profile-meta-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    color: #8a8d98;
    margin-bottom: 14px;
  }
  
  .xf-profile-meta-line strong {
    color: #d1d5db;
  }
  
  .xf-profile-counters {
    display: flex;
    align-items: center;
    gap: 28px;
    padding-top: 10px;
    border-top: 1px solid #232733;
  }
  
  .counter-block {
    background: none;
    border: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: inherit;
    font-family: inherit;
  }
  
  .clickable-counter {
    cursor: pointer;
  }
  
  .clickable-counter:hover .counter-label,
  .clickable-counter:hover .counter-value {
    color: #ff6b00;
  }
  
  .counter-label {
    font-size: 12px;
    color: #8a8d98;
  }
  
  .counter-value {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
  }
  
  /* ВКЛАДКИ */
  .xf-profile-tabs {
    display: flex;
    background: #101219;
    border-top: 1px solid #232733;
    padding: 0 16px;
    overflow-x: auto;
  }
  
  .p-tab {
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: #8a8d98;
    padding: 13px 18px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
  }
  
  .p-tab:hover {
    color: #fff;
  }
  
  .p-tab.active {
    color: #fff;
    border-bottom-color: #ff6b00;
  }
  
  /* СТІНА ПРОФІЛЮ */
  .xf-wall-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  
  .wall-composer-card {
    display: flex;
    gap: 14px;
    background: #14161e;
    border: 1px solid #232733;
    border-radius: 8px;
    padding: 16px;
  }
  
  .wall-composer-avatar,
  .wall-post-avatar {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: linear-gradient(135deg, #ff3b30, #ff6b00);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    color: #fff;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .wall-post-avatar {
    cursor: pointer;
  }
  
  .wall-composer-avatar img,
  .wall-post-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .wall-composer-form {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .wall-composer-actions {
    display: flex;
    justify-content: flex-end;
  }
  
  .btn-wall-submit {
    background: linear-gradient(90deg, #ff3b30, #ff6b00);
    color: #fff;
    border: none;
    padding: 9px 18px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  
  .wall-post-card {
    display: flex;
    gap: 14px;
    background: #14161e;
    border: 1px solid #232733;
    border-radius: 8px;
    padding: 16px;
  }
  
  .wall-post-main {
    flex: 1;
    min-width: 0;
  }
  
  .wall-post-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .wall-post-author-line {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .wall-author-link {
    color: #5ea5ff;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
  }
  
  .wall-author-link:hover {
    text-decoration: underline;
  }
  
  .wall-post-date {
    font-size: 12px;
    color: #6c7284;
  }
  
  .btn-wall-delete {
    background: none;
    border: none;
    color: #ff4d4d;
    font-size: 12px;
    cursor: pointer;
  }
  
  .wall-post-body {
    font-size: 14px;
    line-height: 1.6;
    color: #e5e7eb;
    word-break: break-word;
  }
  
  .wall-comments-list {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid #222634;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .wall-comment-item {
    background: #101219;
    padding: 7px 11px;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .comment-date {
    margin-left: auto;
    font-size: 11px;
    color: #6c7284;
  }
  
  .wall-comment-form {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  
  .wall-comment-form input {
    flex: 1;
    background: #0f1117;
    border: 1px solid #282d3d;
    border-radius: 6px;
    padding: 8px 12px;
    color: #fff;
    font-size: 13px;
  }
  
  .wall-comment-form button {
    background: #232735;
    border: 1px solid #353b4f;
    color: #fff;
    padding: 0 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  
  /* СПИСОК УСІХ ДОПИСІВ ГРАВЦЯ (ЯК РЕЗУЛЬТАТИ ПОШУКУ НА ВІДЕО) */
  .xf-user-posts-section {
    background: #14161e;
    border: 1px solid #232733;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .posts-results-header {
    padding: 14px 18px;
    background: #101219;
    border-bottom: 1px solid #232733;
  }
  
  .posts-results-header h3 {
    margin: 0;
    font-size: 16px;
  }
  
  .search-result-card {
    display: flex;
    gap: 14px;
    padding: 15px 18px;
    border-bottom: 1px solid #1e222e;
    cursor: pointer;
    transition: background 0.15s;
  }
  
  .search-result-card:last-child {
    border-bottom: none;
  }
  
  .search-result-card:hover {
    background: #191c27;
  }
  
  .sr-avatar {
    width: 42px;
    height: 42px;
    border-radius: 6px;
    background: #252a3a;
    color: #ff6b00;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .sr-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .sr-body {
    flex: 1;
    min-width: 0;
  }
  
  .sr-title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 5px;
  }
  
  .sr-prefix {
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 800;
  }
  
  .prefix-red { background: #dc2626; color: #fff; }
  .prefix-green { background: #059669; color: #fff; }
  .prefix-lime { background: #16a34a; color: #fff; }
  .prefix-orange { background: #f59e0b; color: #111827; }
  .prefix-gray { background: #e5e7eb; color: #111827; }
  .prefix-blue { background: #2563eb; color: #fff; }
  
  .sr-topic-title {
    color: #5ea5ff;
    font-weight: 700;
    font-size: 15px;
  }
  
  .search-result-card:hover .sr-topic-title {
    color: #ff6b00;
  }
  
  .sr-snippet {
    margin: 0 0 6px;
    font-size: 13px;
    color: #cbd5e1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .sr-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    font-size: 12px;
    color: #6c7284;
  }
  
  .sr-nick {
    color: #9ca3af;
    font-weight: 600;
  }
  
  .act-verb {
    color: #8a8d98;
    font-size: 13px;
  }
  
  /* ІНФОРМАЦІЯ */
  .xf-about-card {
    background: #14161e;
    border: 1px solid #232733;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .about-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    border-bottom: 1px solid #1e222e;
    padding-bottom: 10px;
  }
  
  .about-row span {
    font-size: 12px;
    color: #8a8d98;
  }
  
  .sig-preview {
    color: #9ca3af;
    font-style: italic;
  }
  
  .empty-wall-box {
    background: #14161e;
    border: 1px dashed #2b3040;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    color: #8a8d98;
    font-size: 14px;
  }
  
  /* МОДАЛКА БАНЕРА */
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
  
  .banner-modal-box {
    background: #14161e;
    border: 1px solid #282d3d;
    border-radius: 10px;
    padding: 24px;
    width: 100%;
    max-width: 460px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .banner-modal-box h3 {
    margin: 0;
  }
  
  .banner-modal-box p {
    margin: 0;
    font-size: 13px;
    color: #8a8d98;
  }
  
  .banner-modal-box input {
    background: #0b0c10;
    border: 1px solid #282d3d;
    border-radius: 6px;
    padding: 10px 12px;
    color: #fff;
    font-size: 14px;
  }
  
  .banner-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .btn-cancel {
    background: #232733;
    color: #fff;
    border: none;
    padding: 9px 16px;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .btn-save {
    background: #ff6b00;
    color: #fff;
    border: none;
    padding: 9px 16px;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .xf-profile-header-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .xf-profile-roles-row,
    .xf-profile-meta-line,
    .xf-profile-counters {
      justify-content: center;
    }
    .wall-composer-card,
    .wall-post-card {
      flex-direction: column;
    }
  }
  </style>