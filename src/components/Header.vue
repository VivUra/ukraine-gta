<template>
  <header class="header">
    <div class="container header-container">
      <div class="header-left">
        <HeaderSheet />
        <router-link to="/" class="logo">
          <img src="/favicon.svg" alt="Ukraine GTA" />
        </router-link>

        <nav class="nav-links">
          <router-link to="/" class="nav-item">
            <Icon icon="majesticons:home" class="nav-icon" /> Головна
          </router-link>
          <router-link to="/forum" class="nav-item">
            <Icon icon="mynaui:chat-messages-solid" class="nav-icon" /> Форум
          </router-link>
          <a href="#" class="nav-item">
            <Icon icon="mdi:shopping" class="nav-icon" /> Ігровий магазин
          </a>
          <a href="#" class="nav-item">
            <Icon icon="mdi:globe" class="nav-icon" /> WIKI
          </a>
        </nav>
      </div>

      <div class="header-actions">
        <Dropdown />

        <!-- Якщо користувач увійшов — відкривається фірмове меню профілю -->
        <AccountDropdown v-if="currentUser" />

        <!-- Якщо гість — кнопка входу/реєстрації -->
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
/* Головний контейнер хедера */
.header {
  width: 100%;
  background-color: var(--main-bg);
  border-bottom: 1px solid #1e2026;
  user-select: none;

  /* Фіксація зверху */
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* ОБГОРТКА: Додаємо flex-wrap для адаптивності */
.header__wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  padding-bottom: 24px;
  min-height: 100px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-logo {
  margin-right: 32px;
}

.logo-link {
  display: block;
  transition: opacity 0.2s ease;
} 

.logo-img {
  height: 56px;
  width: auto;
  display: block;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8a8d98;
  font-family: var(--font-primary);
  font-size: 16px;
  font-weight: 700;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary);
}

.nav-icon {
  font-size: 22px;
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-shrink: 0;
}

.btn-cabinet {
  background: var(--gradient);
  color: #ffffff;
  border: none;
  padding: 14px 36px;
  border-radius: 8px;
  font-family: var(--font-primary);
  font-size: 15px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 20px rgba(236, 43, 29, 0.25);
}

.btn-cabinet:hover {
  filter: brightness(1.1);
}

.btn-cabinet:active {
  transform: scale(0.96);
}

.btn-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
}

/* Адаптиви для малих екранів замість display: none */
@media (max-width: 1199px) {
  .header__wrapper {
    padding-top: 16px;
    padding-bottom: 16px;
    min-height: auto;
  }

  .header-nav {
    gap: 16px;
  }

  .header-actions {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .header__wrapper {
    justify-content: center;
  }

  .header-logo {
    margin-right: 0;
  }

  .logo-img {
    height: 44px;
  }

  .nav-link {
    font-size: 14px;
  }

  .btn-cabinet {
    padding: 10px 20px;
    font-size: 13px;
  }
}
</style>