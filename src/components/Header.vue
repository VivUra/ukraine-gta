<template>
  <header class="header">
    <div class="container header__wrapper">
      <!-- Логотип -->
      <div class="header-left">
        <a href="#" class="logo-link">
          <img src="/public/favicon.svg" alt="Ukraine GTA" class="logo-img" />
        </a>
      </div>

      <!-- Десктопна навігація -->
      <nav class="header-nav desktop-only">
        <a href="#" class="nav-link active">
          <span class="nav-icon">🏠</span> Головна
        </a>
        <a href="#" class="nav-link">
          <span class="nav-icon">💬</span> Форум
        </a>
        <a href="#" class="nav-link">
          <span class="nav-icon">🛒</span> Ігровий магазин
        </a>
        <a href="#" class="nav-link">
          <span class="nav-icon">📖</span> WIKI
        </a>
      </nav>

      <!-- Десктопні дії -->
      <div class="header-actions desktop-only">
        <button class="btn-cabinet">
          <span class="btn-icon">👤</span> Кабінет
        </button>
      </div>

      <!-- Кнопка відкриття бургер-меню (для мобільних) -->
      <button 
        class="burger-btn mobile-only" 
        @click="isMenuOpen = true" 
        aria-label="Open menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Мобільне повноекранне меню -->
    <transition name="fade">
      <div v-if="isMenuOpen" class="mobile-menu">
        <div class="mobile-menu__header">
          <a href="#" class="logo-link">
            <img src="/public/favicon.svg" alt="Ukraine GTA" class="logo-img" />
          </a>
          <!-- Кнопка закриття (хрестик) -->
          <button 
            class="close-btn" 
            @click="isMenuOpen = false" 
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav class="mobile-menu__nav">
          <a href="#" class="mobile-nav-link active" @click="isMenuOpen = false">
            <span class="nav-icon">🏠</span> Головна
          </a>
          <a href="#" class="mobile-nav-link" @click="isMenuOpen = false">
            <span class="nav-icon">💬</span> Форум
          </a>
          <a href="#" class="mobile-nav-link" @click="isMenuOpen = false">
            <span class="nav-icon">🛒</span> Ігровий магазин
          </a>
          <a href="#" class="mobile-nav-link" @click="isMenuOpen = false">
            <span class="nav-icon">📖</span> WIKI
          </a>
        </nav>

        <div class="mobile-menu__footer">
          <div class="lang-selector">
            <span class="flag">🇺🇦</span> Українська
          </div>
          <button class="btn-cabinet mobile-cabinet-btn">
            <span class="btn-icon">👤</span> КАБІНЕТ
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)
</script>

<style scoped>
/* Основні стилі хедера */
.header {
  width: 100%;
  background-color: #0d0e12;
  border-bottom: 1px solid #1e2026;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header__wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  padding-bottom: 16px;
  min-height: 80px;
}

.logo-img {
  height: 48px;
  width: auto;
  display: block;
}

/* Десктопне меню */
.header-nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8a8d98;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #ffffff;
}

.btn-cabinet {
  background: linear-gradient(90deg, #ff3b30 0%, #ff6b00 100%);
  color: #ffffff;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 800;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 59, 48, 0.3);
}

/* Кнопка бургер */
.burger-btn {
  background: #1a1c23;
  border: 1px solid #2a2d37;
  border-radius: 8px;
  width: 44px;
  height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.burger-btn span {
  display: block;
  width: 20px;
  height: 2px;
  background-color: #ffffff;
  border-radius: 2px;
}

/* Мобільне меню (Overlay) */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0b0c10;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
}

.mobile-menu__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: #1e2028;
  border: none;
  color: #8a8d98;
  font-size: 24px;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu__nav {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 40px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #8a8d98;
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
}

.mobile-nav-link.active,
.mobile-nav-link:hover {
  color: #ffffff;
}

.mobile-menu__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.lang-selector {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-cabinet-btn {
  width: 100%;
  justify-content: center;
  padding: 16px;
}

/* Анімація появи */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Медіазапити для перемикання виду */
.mobile-only {
  display: none;
}

@media (max-width: 991px) {
  .desktop-only {
    display: none !important;
  }
  .mobile-only {
    display: flex !important;
  }
}
</style>