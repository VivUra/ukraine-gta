<template>
  <header class="header">
    <div class="container header-inner">
      <div class="header-left">
        <HeaderSheet />
        <router-link to="/" class="logo">
          <img src="/favicon.svg" alt="Ukraine GTA" />
        </router-link>

        <nav class="nav-menu">
          <router-link to="/" class="nav-link">
            <Icon icon="majesticons:home" />
            <span>Головна</span>
          </router-link>
          <router-link to="/forum" class="nav-link">
            <Icon icon="mynaui:chat-messages-solid" />
            <span>Форум</span>
          </router-link>
          <a href="#" class="nav-link">
            <Icon icon="mdi:shopping" />
            <span>Ігровий магазин</span>
          </a>
          <a href="#" class="nav-link">
            <Icon icon="mdi:globe" />
            <span>WIKI</span>
          </a>
        </nav>
      </div>

      <div class="header-actions">
        <Dropdown />

        <AccountDropdown v-if="currentUser" />

        <button
          v-else
          class="btn-cabinet"
          type="button"
          @click="isAuthModalOpen = true"
        >
          <span class="btn-icon">
            <Icon icon="carbon:user-avatar-filled" />
          </span>
          <span class="btn-text">Кабінет</span>
        </button>
      </div>
    </div>

    <AuthModal
      :isOpen="isAuthModalOpen"
      @close="isAuthModalOpen = false"
    />
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import Dropdown from './Dropdown.vue';
import HeaderSheet from './HeaderSheet.vue';
import AuthModal from './AuthModal.vue';
import AccountDropdown from './AccountDropdown.vue';
import { currentUser } from '../authStore.js';

const isAuthModalOpen = ref(false);
</script>

<style scoped>
.header {
  width: 100%;
  padding: 18px 0;
  position: relative;
  z-index: 1000;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 28px;
}

.logo img {
  height: 44px;
  display: block;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #ff6b00;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Повертаємо фірмовий вигляд помаранчевої кнопки для AccountDropdown */
:deep(.btn-cabinet) {
  background: linear-gradient(90deg, #ff3b30 0%, #ff6b00 100%);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(255, 59, 48, 0.35);
  transition: transform 0.15s, opacity 0.2s;
}

:deep(.btn-cabinet:hover) {
  opacity: 0.92;
  transform: translateY(-1px);
}

@media (max-width: 960px) {
  .nav-menu {
    display: none;
  }
}
</style>