<template>
  <section class="forum-page">
    <div class="container">
      <!-- ЕКРАН БЛОКУВАННЯ -->
      <div v-if="isCurrentUserBanned" class="banned-screen-wrapper">
        <div class="breadcrumbs">
          <span class="crumb-current">
            <Icon icon="majesticons:home" class="crumb-home-icon" /> Форуми
          </span>
        </div>

        <div class="ban-alert-top">
          Отакої! Ми стикнулися з деякими проблемами.
        </div>

        <div class="ban-main-card">
          <Icon icon="mdi:cancel" class="ban-big-icon" />
          <h1 class="ban-red-title">Доступ до форуму обмежено через блокування</h1>
          <p class="ban-details-text">
            Ви були заблоковані причини:
            <strong>{{ currentUser.banReason }}</strong>.
            Ваше блокування закінчується
            <strong>{{ formatPunishDate(currentUser.banUntil) }}</strong>.
          </p>
        </div>
      </div>

      <!-- ОСНОВНИЙ ФОРУМ -->
      <template v-else>
        <!-- СТОРІНКА ПРОФІЛЮ ГРАВЦЯ (ЯК ОКРЕМА ТЕМА ЗІ СТІНОЮ ТА ДОПИСАМИ) -->
        <UserProfileView
          v-if="viewedProfileNick"
          :nickname="viewedProfileNick"
          :initial-tab="viewedProfileTab"
          @close="viewedProfileNick = null"
          @open-profile="(nick) => openUserProfile(nick, 'wall')"
          @go-to-topic="jumpToTopicFromProfile"
        />

        <template v-else>
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

            <div class="admin-controls">
              <!-- Редагувати поточний відкритий розділ (від ЗГА 8+) -->
              <button
                v-if="activeNode && canConfigureNodes"
                class="btn-admin-secondary"
                @click="openEditNodeModal(activeNode)"
              >
                <Icon icon="mdi:cog-outline" /> Налаштування розділу
              </button>

              <!-- Створити розділ або підрозділ -->
              <button
                v-if="canCreateSubforumHere"
                class="btn-admin-secondary"
                @click="openCreateNodeModal"
              >
                <Icon icon="mdi:folder-plus-outline" />
                {{ activeNode ? '+ Створити підрозділ' : '+ Створити розділ' }}
              </button>

              <!-- Створити тему -->
              <button
                v-if="activeNode && canCreateTopicHere"
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
          <!-- СТОРІНКА ВІДКРИТОЇ ТЕМИ                                   -->
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
                <span class="clickable-profile" @click="openUserProfile(activeTopic.author)">
                  <Icon icon="mdi:account" /> {{ activeTopic.author }}
                </span>
                <span>•</span>
                <span><Icon icon="mdi:clock-outline" /> {{ activeTopic.dateText }}</span>

                <div v-if="canEditTopic(activeTopic)" class="topic-manage-bar">
                  <button
                    type="button"
                    class="btn-topic-tool"
                    @click="openEditTopicModal(activeTopic)"
                  >
                    <Icon icon="mdi:pencil-outline" /> Редагувати / Тег
                  </button>

                  <button
                    v-if="canPinTopics"
                    type="button"
                    class="btn-topic-tool"
                    :class="{ 'tool-active': activeTopic.isPinned }"
                    @click="toggleTopicPin(activeTopic)"
                  >
                    <Icon icon="mdi:pin" />
                    {{ activeTopic.isPinned ? 'Відкріпити' : 'Закріпити вгорі' }}
                  </button>

                  <button
                    v-if="canDeleteTopics"
                    type="button"
                    class="btn-delete-small"
                    @click="handleDeleteTopic(activeTopic.id)"
                  >
                    Видалити тему
                  </button>
                </div>
              </div>

              <div v-if="activeTopic.isLocked" class="locked-banner">
                <Icon icon="mdi:lock-outline" /> В цій темі не можна розміщувати нові відповіді.
              </div>
            </div>

            <!-- ГОЛОВНИЙ ДОПИС -->
            <div class="post-card">
              <aside class="post-author-sidebar">
                <div
                  class="author-avatar clickable-profile"
                  @click="openUserProfile(activeTopic.author)"
                >
                  <img
                    v-if="getUserAvatar(activeTopic.author, activeTopic.authorAvatar)"
                    :src="getUserAvatar(activeTopic.author, activeTopic.authorAvatar)"
                    alt="Avatar"
                  />
                  <span v-else>{{ activeTopic.author.charAt(0).toUpperCase() }}</span>
                </div>

                <div
                  class="author-name clickable-profile"
                  @click="openUserProfile(activeTopic.author)"
                >
                  {{ activeTopic.author }}
                </div>

                <div v-if="getUserTitle(activeTopic.author)" class="author-custom-title">
                  {{ getUserTitle(activeTopic.author) }}
                </div>

                <!-- Основна роль -->
                <span
                  class="ugta-role-banner"
                  :class="getUserRoleInfo(activeTopic.author, activeTopic.authorRole).cssClass"
                >
                  {{ getUserRoleInfo(activeTopic.author, activeTopic.authorRole).label }}
                </span>

                <!-- Незалежні статусні ролі (Блогер, Донатер) -->
                <div
                  v-if="getUserExtraBadges(activeTopic.author).length > 0"
                  class="ugta-extra-badges-list"
                >
                  <span
                    v-for="badge in getUserExtraBadges(activeTopic.author)"
                    :key="badge.id"
                    class="ugta-extra-badge"
                    :class="badge.cssClass"
                  >
                    {{ badge.label }}
                  </span>
                </div>
              </aside>

              <div class="post-body">
                <div class="post-top-meta">
                  <span>{{ activeTopic.dateText }}</span>
                  <div class="post-right-actions">
                    <button
                      v-if="canEditTopic(activeTopic)"
                      type="button"
                      class="btn-edit-inline"
                      @click="openEditTopicModal(activeTopic)"
                    >
                      <Icon icon="mdi:pencil" /> Редагувати
                    </button>
                    <span class="post-number">#1</span>
                  </div>
                </div>

                <div
                  class="post-content formatted-content"
                  v-html="renderBbCodeHtml(activeTopic.content)"
                ></div>

                <div v-if="activeTopic.editedText" class="edited-note">
                  Останнє редагування: {{ activeTopic.editedText }}
                </div>

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
                <div
                  class="author-avatar secondary-avatar clickable-profile"
                  @click="openUserProfile(reply.author)"
                >
                  <img
                    v-if="getUserAvatar(reply.author, reply.authorAvatar)"
                    :src="getUserAvatar(reply.author, reply.authorAvatar)"
                    alt="Avatar"
                  />
                  <span v-else>{{ reply.author.charAt(0).toUpperCase() }}</span>
                </div>

                <div
                  class="author-name clickable-profile"
                  @click="openUserProfile(reply.author)"
                >
                  {{ reply.author }}
                </div>

                <div v-if="getUserTitle(reply.author)" class="author-custom-title">
                  {{ getUserTitle(reply.author) }}
                </div>

                <!-- Основна роль -->
                <span
                  class="ugta-role-banner"
                  :class="getUserRoleInfo(reply.author, reply.authorRole).cssClass"
                >
                  {{ getUserRoleInfo(reply.author, reply.authorRole).label }}
                </span>

                <!-- Незалежні статусні ролі (Блогер, Донатер) -->
                <div
                  v-if="getUserExtraBadges(reply.author).length > 0"
                  class="ugta-extra-badges-list"
                >
                  <span
                    v-for="badge in getUserExtraBadges(reply.author)"
                    :key="badge.id"
                    class="ugta-extra-badge"
                    :class="badge.cssClass"
                  >
                    {{ badge.label }}
                  </span>
                </div>
              </aside>

              <div class="post-body">
                <div class="post-top-meta">
                  <span>{{ reply.dateText }}</span>
                  <div class="post-right-actions">
                    <button
                      v-if="canDeleteReplies"
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
                  v-html="renderBbCodeHtml(reply.content)"
                ></div>

                <div v-if="getUserSignature(reply.author)" class="post-signature">
                  {{ getUserSignature(reply.author) }}
                </div>
              </div>
            </div>

            <!-- ФОРМА ВІДПОВІДІ -->
            <div
              v-if="currentUser && !isCurrentUserMuted && (!activeTopic.isLocked || canPinTopics)"
              class="reply-box"
            >
              <div
                class="reply-avatar clickable-profile"
                @click="openUserProfile(currentUser.nickname)"
              >
                <img v-if="currentUser.avatarUrl" :src="currentUser.avatarUrl" alt="Avatar" />
                <span v-else>{{ currentUser.nickname.charAt(0).toUpperCase() }}</span>
              </div>
              <form @submit.prevent="handleSendReply" class="reply-form">
                <RichTextEditor
                  v-model="replyText"
                  :rows="5"
                  placeholder="Напишіть свою відповідь..."
                />
                <div class="reply-actions">
                  <button type="submit" class="btn-admin-primary">
                    <Icon icon="mdi:reply" /> Відповісти
                  </button>
                </div>
              </form>
            </div>

            <div v-else-if="currentUser && isCurrentUserMuted" class="mute-warning-banner">
              <Icon icon="mdi:volume-off" />
              <span>
                Вам видано мут (заборона писати повідомлення). Причина:
                <strong>{{ currentUser.muteReason }}</strong>. Закінчується:
                <strong>{{ formatPunishDate(currentUser.muteUntil) }}</strong>.
              </span>
            </div>
          </div>

          <!-- ========================================================= -->
          <!-- СПИСОК РОЗДІЛІВ, ПІДРОЗДІЛІВ ТА ТЕМ                       -->
          <!-- ========================================================= -->
          <template v-else>
            <div v-if="activeNode && currentUser && isCurrentUserMuted" class="mute-warning-banner mb-16">
              <Icon icon="mdi:volume-off" />
              <span>
                Вам видано мут. Причина: <strong>{{ currentUser.muteReason }}</strong>.
                Закінчується: <strong>{{ formatPunishDate(currentUser.muteUntil) }}</strong>.
              </span>
            </div>

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

                    <!-- Індикатор прав доступу для адміністрації (ЗГА+) -->
                    <div v-if="canConfigureNodes" class="node-perms-tags">
                      <span class="perm-pill">
                        Підрозділи:
                        <strong>
                          {{ node.allowSubforums === false ? 'Заборонено' : `від ${getLevelLabel(node.minSubforumLevel ?? 8)}` }}
                        </strong>
                      </span>
                      <span class="perm-pill">
                        Теми:
                        <strong>
                          {{ node.allowTopics === false ? 'Заборонено' : `від ${getLevelLabel(node.minTopicLevel ?? 1)}` }}
                        </strong>
                      </span>
                    </div>

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
                        <span
                          class="author-nick clickable-profile"
                          @click.stop="openUserProfile(getLatestNodeTopic(node.id).author)"
                        >
                          {{ getLatestNodeTopic(node.id).author }}
                        </span>
                      </div>
                    </template>
                    <span v-else class="no-posts">Немає дописів</span>
                  </div>

                  <!-- Кнопки редагування та видалення розділу (від ЗГА 8+) -->
                  <div v-if="canConfigureNodes" class="node-admin-btns">
                    <button
                      class="btn-row-icon"
                      title="Редагувати розділ та права"
                      @click.stop="openEditNodeModal(node)"
                    >
                      <Icon icon="mdi:cog-outline" />
                    </button>
                    <button
                      class="btn-delete-icon"
                      title="Видалити розділ"
                      @click.stop="handleDeleteNode(node.id)"
                    >
                      <Icon icon="mdi:trash-can-outline" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ШВИДКЕ СТВОРЕННЯ ТЕМИ -->
            <div v-if="activeNode && canCreateTopicHere" class="quick-thread-box">
              <div
                class="qt-avatar clickable-profile"
                @click="openUserProfile(currentUser.nickname)"
              >
                <img v-if="currentUser?.avatarUrl" :src="currentUser.avatarUrl" alt="Avatar" />
                <span v-else>{{ currentUser?.nickname?.charAt(0).toUpperCase() }}</span>
              </div>

              <form @submit.prevent="handleCreateTopic" class="qt-form">
                <div class="qt-title-row">
                  <select v-model="newTopicPrefix" class="qt-prefix-select">
                    <option value="">Без тегу</option>
                    <option v-for="tag in TOPIC_PREFIXES" :key="tag" :value="tag">
                      {{ tag }}
                    </option>
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

                <div v-if="isQuickTopicOpen || newTopicTitle.length > 0" class="qt-editor-collapse">
                  <RichTextEditor
                    v-model="newTopicContent"
                    :rows="7"
                    placeholder="Повідомлення..."
                  />

                  <div class="qt-footer">
                    <div class="qt-checkboxes">
                      <label v-if="canPinTopics" class="qt-lock-check">
                        <input type="checkbox" v-model="newTopicPinned" />
                        <span>Закріпити вгорі</span>
                      </label>

                      <label v-if="canPinTopics" class="qt-lock-check">
                        <input type="checkbox" v-model="newTopicLocked" />
                        <span>Закрити для відповідей</span>
                      </label>
                    </div>

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

            <!-- СПИСОК ТЕМ У РОЗДІЛІ -->
            <div v-if="activeNode" class="threads-table-wrapper">
              <div v-if="currentNodeTopics.length === 0 && childNodes.length === 0" class="empty-state">
                У цьому розділі ще немає тем.
              </div>

              <div v-if="currentNodeTopics.length > 0" class="threads-container">
                <div
                  v-for="topic in pinnedNodeTopics"
                  :key="topic.id"
                  class="thread-row pinned-row"
                  @click="openTopic(topic)"
                >
                  <div class="thread-row-left">
                    <div
                      class="thread-avatar clickable-profile"
                      @click.stop="openUserProfile(topic.author)"
                    >
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
                        <Icon icon="mdi:pin" class="pin-icon" title="Закріплена тема" />
                        <Icon v-if="topic.isLocked" icon="mdi:lock" class="lock-icon" />
                      </div>
                      <div class="thread-row-meta">
                        <span
                          class="author-nick clickable-profile"
                          @click.stop="openUserProfile(topic.author)"
                        >
                          {{ topic.author }}
                        </span>
                        • {{ topic.dateText }}
                      </div>
                    </div>
                  </div>

                  <div class="thread-row-right">
                    <div class="thread-counters">
                      <div>Відповіді: <strong>{{ getTopicRepliesCount(topic.id) }}</strong></div>
                      <div class="views-text">Перегляди: {{ topic.views || 1 }}</div>
                    </div>

                    <div v-if="canEditTopic(topic)" class="row-quick-actions" @click.stop>
                      <button
                        type="button"
                        class="btn-row-icon"
                        title="Редагувати тему / тег"
                        @click="openEditTopicModal(topic)"
                      >
                        <Icon icon="mdi:pencil-outline" />
                      </button>
                      <button
                        v-if="canPinTopics"
                        type="button"
                        class="btn-row-icon active-pin"
                        title="Відкріпити тему"
                        @click="toggleTopicPin(topic)"
                      >
                        <Icon icon="mdi:pin-off-outline" />
                      </button>
                      <button
                        v-if="canDeleteTopics"
                        type="button"
                        class="btn-delete-icon"
                        title="Видалити тему"
                        @click="handleDeleteTopic(topic.id)"
                      >
                        <Icon icon="mdi:trash-can-outline" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  v-if="pinnedNodeTopics.length > 0 && regularNodeTopics.length > 0"
                  class="pinned-divider"
                ></div>

                <div
                  v-for="topic in regularNodeTopics"
                  :key="topic.id"
                  class="thread-row"
                  @click="openTopic(topic)"
                >
                  <div class="thread-row-left">
                    <div
                      class="thread-avatar clickable-profile"
                      @click.stop="openUserProfile(topic.author)"
                    >
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
                        <span
                          class="author-nick clickable-profile"
                          @click.stop="openUserProfile(topic.author)"
                        >
                          {{ topic.author }}
                        </span>
                        • {{ topic.dateText }}
                      </div>
                    </div>
                  </div>

                  <div class="thread-row-right">
                    <div class="thread-counters">
                      <div>Відповіді: <strong>{{ getTopicRepliesCount(topic.id) }}</strong></div>
                      <div class="views-text">Перегляди: {{ topic.views || 1 }}</div>
                    </div>

                    <div v-if="canEditTopic(topic)" class="row-quick-actions" @click.stop>
                      <button
                        type="button"
                        class="btn-row-icon"
                        title="Редагувати тему / тег"
                        @click="openEditTopicModal(topic)"
                      >
                        <Icon icon="mdi:pencil-outline" />
                      </button>
                      <button
                        v-if="canPinTopics"
                        type="button"
                        class="btn-row-icon"
                        title="Закріпити вгорі"
                        @click="toggleTopicPin(topic)"
                      >
                        <Icon icon="mdi:pin-outline" />
                      </button>
                      <button
                        v-if="canDeleteTopics"
                        type="button"
                        class="btn-delete-icon"
                        title="Видалити тему"
                        @click="handleDeleteTopic(topic.id)"
                      >
                        <Icon icon="mdi:trash-can-outline" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="childNodes.length === 0" class="empty-state">
              Розділів поки що немає.
              <span v-if="canConfigureNodes">Натисніть «+ Створити розділ», щоб почати.</span>
            </div>
          </template>
        </template>
      </template>
    </div>

    <!-- МОДАЛКА РЕДАГУВАННЯ ПУБЛІКАЦІЇ -->
    <div v-if="isEditModalOpen" class="modal-overlay" @click.self="isEditModalOpen = false">
      <div class="modal-card large-modal">
        <h3>Редагування публікації</h3>

        <form @submit.prevent="handleSaveEditedTopic" class="admin-form">
          <div class="form-row-2">
            <div>
              <label>Тег (префікс теми)</label>
              <select v-model="editForm.prefix">
                <option value="">Без тегу</option>
                <option v-for="tag in TOPIC_PREFIXES" :key="tag" :value="tag">
                  {{ tag }}
                </option>
              </select>
            </div>

            <div>
              <label>Заголовок теми *</label>
              <input v-model="editForm.title" type="text" required />
            </div>
          </div>

          <label>Текст публікації *</label>
          <RichTextEditor v-model="editForm.content" :rows="9" />

          <div class="edit-toggles-row">
            <label v-if="canPinTopics" class="checkbox-label">
              <input type="checkbox" v-model="editForm.isPinned" />
              Закріпити публікацію вгорі розділу
            </label>

            <label v-if="canPinTopics" class="checkbox-label">
              <input type="checkbox" v-model="editForm.isLocked" />
              Закрити тему для нових відповідей
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="isEditModalOpen = false">
              Скасувати
            </button>
            <button type="submit" class="btn-save">Зберегти зміни</button>
          </div>
        </form>
      </div>
    </div>

    <!-- МОДАЛКА СТВОРЕННЯ АБО РЕДАГУВАННЯ РОЗДІЛУ / ПІДРОЗДІЛУ (ЗГА 8+) -->
    <div v-if="isNodeModalOpen" class="modal-overlay" @click.self="isNodeModalOpen = false">
      <div class="modal-card node-settings-modal">
        <h3>
          {{
            nodeForm.isEdit
              ? `Налаштування розділу «${nodeForm.title}»`
              : activeNode
                ? `Новий підрозділ у «${activeNode.title}»`
                : 'Новий головний розділ'
          }}
        </h3>

        <form @submit.prevent="handleSaveNode" class="admin-form">
          <label>Назва розділу *</label>
          <input
            v-model="nodeForm.title"
            type="text"
            placeholder="Наприклад: Державні організації"
            required
          />

          <label>Короткий опис (необов'язково)</label>
          <input
            v-model="nodeForm.description"
            type="text"
            placeholder="Наприклад: Інформація, статути та заяви"
          />

          <!-- БЛОК ПРАВ НА СТВОРЕННЯ ПІДРОЗДІЛІВ -->
          <div class="perm-config-box">
            <label class="checkbox-label bold-toggle">
              <input type="checkbox" v-model="nodeForm.allowSubforums" />
              Дозволити створювати підрозділи всередині
            </label>

            <div v-if="nodeForm.allowSubforums" class="perm-select-row">
              <label>Мінімальний ранг для створення підрозділів:</label>
              <select v-model.number="nodeForm.minSubforumLevel">
                <option
                  v-for="role in ROLES_HIERARCHY"
                  :key="role.id"
                  :value="role.level"
                >
                  {{ role.level }}. {{ role.label }} і вище
                </option>
              </select>
            </div>
          </div>

          <!-- БЛОК ПРАВ НА СТВОРЕННЯ ТЕМ -->
          <div class="perm-config-box">
            <label class="checkbox-label bold-toggle">
              <input type="checkbox" v-model="nodeForm.allowTopics" />
              Дозволити створювати теми у цьому розділі
            </label>

            <div v-if="nodeForm.allowTopics" class="perm-select-row">
              <label>Мінімальний ранг для створення тем:</label>
              <select v-model.number="nodeForm.minTopicLevel">
                <option
                  v-for="role in ROLES_HIERARCHY"
                  :key="role.id"
                  :value="role.level"
                >
                  {{ role.level }}. {{ role.label }} і вище
                </option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="isNodeModalOpen = false">
              Скасувати
            </button>
            <button type="submit" class="btn-save">
              {{ nodeForm.isEdit ? 'Зберегти налаштування' : 'Створити' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { currentUser } from '../authStore.js'
import {
  ROLES_HIERARCHY,
  getRoleInfo,
  getRoleLevel,
  getExtraBadgeInfo
} from '../rolesConfig.js'
import { renderBbCodeHtml } from '../bbcodeParser.js'
import RichTextEditor from './RichTextEditor.vue'
import UserProfileView from './UserProfileView.vue'
import {
  forumNodes,
  forumTopics,
  forumReplies,
  usersByNick,
  isForumLoading,
  initForumListeners,
  createNode,
  updateNode,
  deleteNode,
  createTopic,
  updateTopic,
  incrementTopicViews,
  deleteTopic,
  createReply,
  deleteReply
} from '../forumStore.js'

const TOPIC_PREFIXES = [
  'Важливо',
  'Інформація',
  'База знань',
  'На розгляд',
  'В очікуванні',
  'Розглянуто',
  'Схвалено',
  'Відмовлено'
]

const isCurrentUserBanned = computed(() =>
  Boolean(currentUser.value?.banUntil && currentUser.value.banUntil > Date.now())
)

const isCurrentUserMuted = computed(() =>
  Boolean(currentUser.value?.muteUntil && currentUser.value.muteUntil > Date.now())
)

const formatPunishDate = (ts) => {
  if (!ts || ts >= 4000000000000) return 'ніколи (перманентно)'
  return new Date(ts).toLocaleString('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getLevelLabel = (lvl) => {
  const found = ROLES_HIERARCHY.find((r) => r.level === Number(lvl))
  return found ? found.label : 'Гравець'
}

// Ієрархія прав доступу
const myLevel = computed(() => getRoleLevel(currentUser.value?.role))
const canConfigureNodes = computed(() => myLevel.value >= 8) // Від ЗГА (8) до Головного Розробника (11)
const canDeleteTopics = computed(() => myLevel.value >= 3)
const canPinTopics = computed(() => myLevel.value >= 2)
const canDeleteReplies = computed(() => myLevel.value >= 2)

const activeNodeId = ref(null)
const activeTopicId = ref(null)

// Стан перегляду профілю гравця
const viewedProfileNick = ref(null)
const viewedProfileTab = ref('wall')

const openUserProfile = (nickname, tab = 'wall') => {
  if (!nickname) return
  viewedProfileNick.value = nickname
  viewedProfileTab.value = tab
}

const jumpToTopicFromProfile = (topicId) => {
  const foundTopic = forumTopics.value.find((t) => t.id === topicId)
  viewedProfileNick.value = null
  if (foundTopic) {
    openTopic(foundTopic)
  }
}

const activeNode = computed(() =>
  forumNodes.value.find((n) => n.id === activeNodeId.value) || null
)

const activeTopic = computed(() =>
  forumTopics.value.find((t) => t.id === activeTopicId.value) || null
)

// Динамічні права на створення підрозділів і тем у поточному розділі
const canCreateSubforumHere = computed(() => {
  if (!currentUser.value || isCurrentUserMuted.value) return false
  if (!activeNode.value) return myLevel.value >= 8
  if (activeNode.value.allowSubforums === false) return false
  const minLvl = activeNode.value.minSubforumLevel ?? 8
  return myLevel.value >= minLvl
})

const canCreateTopicHere = computed(() => {
  if (!activeNode.value || !currentUser.value || isCurrentUserMuted.value) return false
  if (activeNode.value.allowTopics === false) return false
  const minLvl = activeNode.value.minTopicLevel ?? 1
  return myLevel.value >= minLvl
})

const canEditTopic = (topic) => {
  if (!currentUser.value || !topic) return false
  if (myLevel.value >= 2) return true
  return topic.author?.toLowerCase() === currentUser.value.nickname?.toLowerCase()
}

onMounted(() => {
  initForumListeners()
})

const getUserAvatar = (nickname, fallbackAvatar = '') => {
  if (!nickname) return fallbackAvatar
  return usersByNick.value[nickname.toLowerCase()]?.avatarUrl || fallbackAvatar || ''
}

const getUserTitle = (nickname) => {
  if (!nickname) return ''
  return usersByNick.value[nickname.toLowerCase()]?.title || ''
}

const getUserSignature = (nickname) => {
  if (!nickname) return ''
  return usersByNick.value[nickname.toLowerCase()]?.signature || ''
}

const getUserRoleInfo = (nickname, fallbackRole = 'player') => {
  if (!nickname) return getRoleInfo(fallbackRole)
  const profile = usersByNick.value[nickname.toLowerCase()]
  return getRoleInfo(profile?.role || fallbackRole)
}

// Отримання незалежних анімованих бейджів користувача (Блогер, Донатер)
const getUserExtraBadges = (nickname) => {
  if (!nickname) return []
  const profile = usersByNick.value[nickname.toLowerCase()]
  const rawList = profile?.extraBadges || []
  return rawList.map((id) => getExtraBadgeInfo(id)).filter(Boolean)
}

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

const getDirectChildren = (nodeId) => forumNodes.value.filter((n) => n.parentId === nodeId)

const currentNodeTopics = computed(() => {
  if (!activeNodeId.value) return []
  return forumTopics.value.filter((t) => t.nodeId === activeNodeId.value)
})

const pinnedNodeTopics = computed(() =>
  currentNodeTopics.value.filter((t) => Boolean(t.isPinned))
)

const regularNodeTopics = computed(() =>
  currentNodeTopics.value.filter((t) => !t.isPinned)
)

const currentTopicReplies = computed(() => {
  if (!activeTopicId.value) return []
  return forumReplies.value.filter((r) => r.topicId === activeTopicId.value)
})

const getAllDescendantNodeIds = (nodeId) => {
  let ids = [nodeId]
  for (const child of getDirectChildren(nodeId)) {
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

const getTopicRepliesCount = (topicId) =>
  forumReplies.value.filter((r) => r.topicId === topicId).length

const goHome = () => {
  viewedProfileNick.value = null
  activeNodeId.value = null
  activeTopicId.value = null
}

const openNode = (node) => {
  viewedProfileNick.value = null
  activeTopicId.value = null
  activeNodeId.value = node.id
  isQuickTopicOpen.value = false
}

const openTopic = (topic) => {
  viewedProfileNick.value = null
  activeNodeId.value = topic.nodeId
  activeTopicId.value = topic.id
  incrementTopicViews(topic.id)
}

// МОДАЛКА СТВОРЕННЯ / РЕДАГУВАННЯ РОЗДІЛУ ТА ЙОГО ПРАВ (ЗГА 8+)
const isNodeModalOpen = ref(false)
const nodeForm = reactive({
  isEdit: false,
  id: '',
  title: '',
  description: '',
  allowSubforums: true,
  minSubforumLevel: 8,
  allowTopics: true,
  minTopicLevel: 1
})

const openCreateNodeModal = () => {
  nodeForm.isEdit = false
  nodeForm.id = ''
  nodeForm.title = ''
  nodeForm.description = ''
  nodeForm.allowSubforums = true
  nodeForm.minSubforumLevel = 8
  nodeForm.allowTopics = true
  nodeForm.minTopicLevel = 1
  isNodeModalOpen.value = true
}

const openEditNodeModal = (node) => {
  nodeForm.isEdit = true
  nodeForm.id = node.id
  nodeForm.title = node.title
  nodeForm.description = node.description || ''
  nodeForm.allowSubforums = node.allowSubforums !== false
  nodeForm.minSubforumLevel = node.minSubforumLevel ?? 8
  nodeForm.allowTopics = node.allowTopics !== false
  nodeForm.minTopicLevel = node.minTopicLevel ?? 1
  isNodeModalOpen.value = true
}

const handleSaveNode = async () => {
  if (!nodeForm.title.trim()) return
  if (nodeForm.isEdit && nodeForm.id) {
    await updateNode(nodeForm.id, nodeForm)
  } else {
    await createNode({
      ...nodeForm,
      parentId: activeNodeId.value || null
    })
  }
  isNodeModalOpen.value = false
}

const handleDeleteNode = async (id) => {
  if (confirm('Видалити цей розділ?')) {
    await deleteNode(id)
    if (activeNodeId.value === id) goHome()
  }
}

// СТВОРЕННЯ ТА РЕДАГУВАННЯ ТЕМ
const isQuickTopicOpen = ref(false)
const newTopicPrefix = ref('Важливо')
const newTopicTitle = ref('')
const newTopicContent = ref('')
const newTopicLocked = ref(false)
const newTopicPinned = ref(false)

const handleCreateTopic = async () => {
  if (!activeNodeId.value || !canCreateTopicHere.value || !newTopicContent.value.trim()) return
  await createTopic({
    nodeId: activeNodeId.value,
    title: newTopicTitle.value,
    content: newTopicContent.value,
    prefix: newTopicPrefix.value,
    authorNickname: currentUser.value.nickname,
    authorRole: currentUser.value.role,
    authorAvatar: currentUser.value.avatarUrl || '',
    isLocked: newTopicLocked.value,
    isPinned: newTopicPinned.value
  })
  newTopicTitle.value = ''
  newTopicContent.value = ''
  newTopicLocked.value = false
  newTopicPinned.value = false
  isQuickTopicOpen.value = false
}

const isEditModalOpen = ref(false)
const editForm = reactive({
  id: '',
  title: '',
  prefix: '',
  content: '',
  isPinned: false,
  isLocked: false
})

const openEditTopicModal = (topic) => {
  editForm.id = topic.id
  editForm.title = topic.title
  editForm.prefix = topic.prefix || ''
  editForm.content = topic.content
  editForm.isPinned = Boolean(topic.isPinned)
  editForm.isLocked = Boolean(topic.isLocked)
  isEditModalOpen.value = true
}

const handleSaveEditedTopic = async () => {
  if (!editForm.id || !editForm.title.trim() || !editForm.content.trim()) return
  await updateTopic(editForm.id, {
    title: editForm.title.trim(),
    prefix: editForm.prefix,
    content: editForm.content.trim(),
    isPinned: editForm.isPinned,
    isLocked: editForm.isLocked,
    editedText: new Date().toLocaleString('uk-UA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  })
  isEditModalOpen.value = false
}

const toggleTopicPin = async (topic) => {
  await updateTopic(topic.id, { isPinned: !topic.isPinned })
}

const handleDeleteTopic = async (id) => {
  if (confirm('Видалити цю тему?')) {
    await deleteTopic(id)
    if (activeTopicId.value === id) activeTopicId.value = null
  }
}

const replyText = ref('')
const handleSendReply = async () => {
  if (!activeTopicId.value || !currentUser.value || isCurrentUserMuted.value || !replyText.value.trim()) return
  await createReply({
    topicId: activeTopicId.value,
    content: replyText.value,
    authorNickname: currentUser.value.nickname,
    authorRole: currentUser.value.role,
    authorAvatar: currentUser.value.avatarUrl || ''
  })
  replyText.value = ''
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
.forum-page { padding: 28px 0 80px; min-height: 78vh; color: #fff; }
.mb-16 { margin-bottom: 16px; }

.clickable-profile { cursor: pointer; }
.author-name.clickable-profile:hover,
.author-nick.clickable-profile:hover,
.thread-submeta .clickable-profile:hover {
  text-decoration: underline;
  color: #ff6b00;
}

.banned-screen-wrapper { display: flex; flex-direction: column; gap: 16px; }
.ban-alert-top { background: #14161e; border: 1px solid #232733; border-radius: 8px; padding: 18px 22px; font-size: 20px; color: #e5e7eb; }
.ban-main-card { background: #14161e; border: 1px solid #232733; border-radius: 8px; padding: 46px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; }
.ban-big-icon { font-size: 165px; color: #c84b4b; margin-bottom: 18px; }
.ban-red-title { color: #d64545; font-size: 28px; font-weight: 800; line-height: 1.25; max-width: 480px; margin: 0 0 16px; }
.ban-details-text { color: #d1d5db; font-size: 16px; line-height: 1.6; max-width: 520px; margin: 0; }
.mute-warning-banner { margin-top: 20px; background: rgba(245, 158, 11, 0.12); border: 1px solid #d97706; color: #fbbf24; padding: 14px 18px; border-radius: 8px; font-size: 14px; display: flex; align-items: center; gap: 10px; }

.breadcrumbs { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #8a8d98; margin-bottom: 18px; }
.crumb-home-icon { vertical-align: -2px; margin-right: 4px; }
.crumb-link { cursor: pointer; }
.crumb-link:hover { color: #ff3b30; }
.crumb-current { color: #fff; font-weight: 700; }

.forum-top-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
.forum-title { font-size: 26px; font-weight: 800; margin: 0; }
.forum-subtitle { margin: 6px 0 0; color: #8a8d98; font-size: 14px; }
.admin-controls { display: flex; gap: 12px; flex-wrap: wrap; }

.btn-admin-primary { background: linear-gradient(90deg, #ff3b30 0%, #ff6b00 100%); color: #fff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px; cursor: pointer; }
.btn-admin-secondary { background: #1c1f2b; color: #fff; border: 1px solid #32384d; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px; cursor: pointer; }

.quick-thread-box { display: flex; gap: 14px; background: #181a22; border: 1px solid #282d3d; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; }
.qt-avatar { width: 40px; height: 40px; border-radius: 6px; background: linear-gradient(135deg, #ff3b30, #ff6b00); color: #fff; font-weight: 800; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.qt-avatar img { width: 100%; height: 100%; object-fit: cover; }
.qt-form { flex: 1; min-width: 0; }
.qt-title-row { display: flex; align-items: center; gap: 10px; }
.qt-prefix-select { background: #252936; border: 1px solid #353b4d; color: #fff; padding: 9px 12px; border-radius: 5px; font-size: 13px; font-weight: 600; outline: none; cursor: pointer; }
.qt-title-input { flex: 1; background: #111319; border: 1px solid #2b3040; color: #fff; padding: 10px 14px; border-radius: 5px; font-size: 15px; outline: none; }
.qt-editor-collapse { margin-top: 12px; }
.qt-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 4px 0; flex-wrap: wrap; gap: 10px; }
.qt-checkboxes { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.qt-lock-check { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #9ca3af; cursor: pointer; }
.qt-submit-group { display: flex; align-items: center; gap: 10px; }
.btn-qt-cancel { background: #252936; border: none; color: #c5c8d4; padding: 9px 14px; border-radius: 5px; font-size: 13px; cursor: pointer; }
.btn-qt-submit { background: linear-gradient(90deg, #ff3b30, #ff6b00); border: none; color: #fff; padding: 9px 18px; border-radius: 5px; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px; cursor: pointer; }

.sections-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.section-card { background: #14161e; border: 1px solid #232733; border-radius: 8px; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.section-main { display: flex; align-items: flex-start; gap: 16px; flex: 1; }
.section-icon { font-size: 26px; color: #8a8d98; background: #1c1f2b; padding: 12px; border-radius: 8px; display: flex; cursor: pointer; }
.section-name { font-size: 17px; font-weight: 700; margin: 0 0 4px; color: #fff; cursor: pointer; }
.section-name:hover { color: #ff3b30; }
.section-desc { font-size: 13px; color: #8a8d98; margin: 0 0 6px; }

.node-perms-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.perm-pill { background: #1a1d28; border: 1px solid #2c3244; color: #9ca3af; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.perm-pill strong { color: #ff6b00; }
.node-admin-btns { display: flex; align-items: center; gap: 6px; }

.subforums-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px 16px; margin-top: 8px; }
.subforum-link-btn { background: none; border: none; padding: 2px 0; color: #d0d3df; font-size: 13px; font-family: inherit; display: flex; align-items: center; gap: 6px; cursor: pointer; text-align: left; }
.subforum-link-btn:hover { color: #ff6b00; text-decoration: underline; }
.section-stats { display: flex; align-items: center; gap: 20px; }
.stat-box { display: flex; flex-direction: column; align-items: center; min-width: 55px; }
.stat-label { font-size: 10px; color: #6c7284; font-weight: 700; }
.stat-val { font-size: 15px; font-weight: 700; }
.last-post-box { width: 240px; font-size: 13px; }
.last-post-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; margin-bottom: 3px; }
.last-post-title.clickable { cursor: pointer; }
.last-post-meta, .no-posts { font-size: 12px; color: #6c7284; }
.author-nick { color: #ff6b00; font-weight: 600; }

.topic-prefix { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; margin-right: 7px; }
.large-prefix { font-size: 13px; padding: 4px 11px; }
.prefix-red { background: #dc2626; color: #fff; }
.prefix-green { background: #059669; color: #fff; }
.prefix-lime { background: #16a34a; color: #fff; }
.prefix-orange { background: #f59e0b; color: #111827; }
.prefix-gray { background: #e5e7eb; color: #111827; }
.prefix-blue { background: #2563eb; color: #fff; }

.threads-container { background: #14161e; border: 1px solid #232733; border-radius: 8px; overflow: hidden; }
.thread-row { display: flex; justify-content: space-between; align-items: center; padding: 13px 18px; border-bottom: 1px solid #1e222d; cursor: pointer; gap: 12px; }
.thread-row:last-child { border-bottom: none; }
.thread-row:hover { background: #191c26; }
.pinned-row { background: #171a24; border-left: 3px solid #ff6b00; }
.pinned-divider { height: 10px; background: #0e1015; border-top: 1px solid #262b38; border-bottom: 1px solid #262b38; }
.thread-row-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.thread-avatar { width: 38px; height: 38px; border-radius: 50%; background: #252a3a; color: #ff6b00; font-weight: 800; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.thread-avatar img { width: 100%; height: 100%; object-fit: cover; }
.thread-row-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; flex-wrap: wrap; }
.thread-row:hover .thread-link-text { color: #ff6b00; }
.pin-icon { margin-left: 8px; color: #ff6b00; font-size: 15px; }
.lock-icon { margin-left: 6px; color: #8a8d98; font-size: 14px; }
.thread-row-meta { font-size: 12px; color: #8a8d98; }
.thread-row-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.thread-counters { text-align: right; font-size: 12px; color: #c5c8d4; }
.views-text { color: #6c7284; margin-top: 2px; }
.row-quick-actions { display: flex; align-items: center; gap: 6px; }
.btn-row-icon { background: #1c1f2b; border: 1px solid #2e3446; color: #9ca3af; padding: 6px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; }
.btn-row-icon:hover, .btn-row-icon.active-pin { color: #ff6b00; border-color: #ff6b00; }

.thread-header-block { margin-bottom: 20px; }
.thread-title-line { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.thread-main-title { font-size: 24px; margin: 0; }
.thread-submeta { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 13px; color: #8a8d98; }
.topic-manage-bar { display: flex; align-items: center; gap: 8px; margin-left: 8px; flex-wrap: wrap; }
.btn-topic-tool { background: #1c1f2b; border: 1px solid #2f3548; color: #e5e7eb; padding: 4px 10px; border-radius: 5px; font-size: 12px; display: flex; align-items: center; gap: 5px; cursor: pointer; }
.btn-topic-tool:hover, .btn-topic-tool.tool-active { border-color: #ff6b00; color: #ff6b00; }
.locked-banner { margin-top: 14px; background: #14161e; border: 1px solid #2b3040; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #9ca3af; display: flex; align-items: center; gap: 8px; }

.post-card { display: flex; background: #14161e; border: 1px solid #232733; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
.post-author-sidebar { width: 200px; background: #11131a; border-right: 1px solid #232733; padding: 24px 16px; display: flex; flex-direction: column; align-items: center; text-align: center; flex-shrink: 0; }
.author-avatar { width: 84px; height: 84px; border-radius: 8px; background: linear-gradient(135deg, #ff3b30, #ff6b00); color: #fff; font-size: 32px; font-weight: 900; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; overflow: hidden; }
.author-avatar img { width: 100%; height: 100%; object-fit: cover; }
.secondary-avatar { background: #252a3a; }
.author-name { font-weight: 700; font-size: 15px; color: #5ea5ff; margin-bottom: 4px; }
.author-custom-title { font-size: 11px; color: #9ca3af; margin-bottom: 8px; line-height: 1.3; }
.post-body { flex: 1; padding: 20px 24px; display: flex; flex-direction: column; min-width: 0; }
.post-top-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6c7284; border-bottom: 1px solid #1e222d; padding-bottom: 10px; margin-bottom: 16px; }
.post-right-actions { display: flex; align-items: center; gap: 12px; }
.btn-edit-inline { background: none; border: none; color: #9ca3af; font-size: 12px; display: flex; align-items: center; gap: 4px; cursor: pointer; }
.btn-edit-inline:hover { color: #ff6b00; }
.post-content { font-size: 15px; line-height: 1.65; color: #e5e7eb; flex: 1; word-break: break-word; }
.edited-note { margin-top: 14px; font-size: 11px; color: #6c7284; text-align: right; }
.post-signature { margin-top: 18px; padding-top: 12px; border-top: 1px solid #232733; font-size: 12px; color: #8a8d98; font-style: italic; }

.formatted-content :deep(.bb-h1) { font-size: 24px; color: #fff; margin: 14px 0 8px; }
.formatted-content :deep(.bb-h2) { font-size: 20px; color: #f59e0b; margin: 12px 0 6px; }
.formatted-content :deep(.bb-h3) { font-size: 17px; color: #f59e0b; margin: 10px 0 6px; }
.formatted-content :deep(.bb-hr) { border: none; border-top: 1px solid #32384d; margin: 14px 0; }
.formatted-content :deep(.bb-icode) { background: #232735; color: #f87171; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; }
.formatted-content :deep(.bb-code-block) { background: #0d0f14; border: 1px solid #282d3d; border-radius: 6px; margin: 12px 0; overflow: hidden; }
.formatted-content :deep(.bb-code-lang) { background: #181b24; padding: 5px 12px; font-size: 11px; color: #8a8d98; border-bottom: 1px solid #282d3d; }
.formatted-content :deep(.bb-code-block pre) { margin: 0; padding: 12px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 13px; color: #a5f3fc; }
.formatted-content :deep(.bb-spoiler) { background: #191c26; border: 1px solid #2e3446; border-radius: 6px; padding: 8px 12px; margin: 10px 0; }
.formatted-content :deep(.bb-spoiler summary) { cursor: pointer; font-weight: 700; color: #ff6b00; }
.formatted-content :deep(.bb-spoiler-body) { margin-top: 8px; padding-top: 8px; border-top: 1px solid #282d3d; }
.formatted-content :deep(.bb-quote) { background: #191c26; border-left: 3px solid #ff6b00; padding: 10px 14px; margin: 10px 0; border-radius: 0 6px 6px 0; }
.formatted-content :deep(.bb-quote-author) { font-size: 12px; color: #ff6b00; font-weight: 700; margin-bottom: 4px; }
.formatted-content :deep(.bb-list) { padding-left: 24px; margin: 8px 0; }
.formatted-content :deep(.bb-link) { color: #5ea5ff; text-decoration: underline; }
.formatted-content :deep(.bb-img) { max-width: 100%; border-radius: 6px; margin: 10px 0; }
.formatted-content :deep(.bb-video-wrap) { position: relative; padding-bottom: 56.25%; height: 0; margin: 12px 0; }
.formatted-content :deep(.bb-video-wrap iframe) { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 6px; }
.formatted-content :deep(.bb-table) { width: 100%; border-collapse: collapse; margin: 12px 0; background: #1a1d28; }
.formatted-content :deep(.bb-table th),
.formatted-content :deep(.bb-table td) { border: 1px solid #2e3446; padding: 9px 12px; text-align: left; }
.formatted-content :deep(.bb-table th) { background: #11131a; color: #f59e0b; }

.reply-box { display: flex; gap: 16px; background: #14161e; border: 1px solid #232733; border-radius: 8px; padding: 20px; margin-top: 24px; }
.reply-avatar { width: 44px; height: 44px; border-radius: 8px; background: #ff3b30; display: flex; align-items: center; justify-content: center; font-weight: 800; overflow: hidden; flex-shrink: 0; }
.reply-avatar img { width: 100%; height: 100%; object-fit: cover; }
.reply-form { flex: 1; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.reply-actions { display: flex; justify-content: flex-end; }

.btn-delete-icon { background: none; border: 1px solid #3a2328; color: #ff4d4d; padding: 6px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; }
.btn-delete-small { background: rgba(255, 77, 77, 0.15); border: 1px solid #ff4d4d; color: #ff4d4d; padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; }
.btn-delete-tiny { background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 12px; }
.empty-state { background: #14161e; border: 1px dashed #2b3040; border-radius: 8px; padding: 36px; text-align: center; color: #8a8d98; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); display: flex; align-items: center; justify-content: center; z-index: 3000; padding: 16px; }
.modal-card { background: #14161e; border: 1px solid #232733; border-radius: 10px; padding: 26px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
.large-modal { max-width: 760px; }
.node-settings-modal { max-width: 540px; }
.admin-form { display: flex; flex-direction: column; gap: 12px; }
.form-row-2 { display: grid; grid-template-columns: 180px 1fr; gap: 12px; }
.edit-toggles-row { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 4px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #e5e7eb !important; cursor: pointer; }
.bold-toggle { font-weight: 700; color: #ffffff !important; }
.admin-form label { font-size: 13px; color: #8a8d98; }
.admin-form input[type="text"], .admin-form select { width: 100%; background: #0b0c10; border: 1px solid #232733; border-radius: 6px; padding: 11px 14px; color: #fff; font-family: inherit; font-size: 14px; box-sizing: border-box; }

.perm-config-box {
  background: #101219;
  border: 1px solid #252a38;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.perm-select-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 22px;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
.btn-cancel { background: #232733; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; }
.btn-save { background: #ff3b30; color: #fff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; }

@media (max-width: 768px) {
  .post-card { flex-direction: column; }
  .post-author-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #232733; flex-direction: row; flex-wrap: wrap; gap: 12px; padding: 14px; }
  .author-avatar { width: 48px; height: 48px; font-size: 18px; margin-bottom: 0; }
  .section-card, .thread-row { flex-direction: column; align-items: flex-start; }
  .thread-row-right { width: 100%; justify-content: space-between; }
  .qt-title-row, .form-row-2 { grid-template-columns: 1fr; flex-direction: column; align-items: stretch; }
}
</style>