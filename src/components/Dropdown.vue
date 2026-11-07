<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger class="lang-trigger">
      <span class="flag"><Icon icon="twemoji:flag-ukraine"/></span>
      <span class="lang-text text">Українська</span>
      <span class="arrow"><Icon icon="tabler:chevron-down" /></span>
    </DropdownMenuTrigger>

    <DropdownMenuPortal style="z-index: 999;">
      <DropdownMenuContent class="lang-dropdown-content" :side-offset="8" align="end">
        
        <DropdownMenuItem class="lang-item" @select="changeLanguage('uk')">
          <span class="flag"><Icon icon="twemoji:flag-ukraine"/></span> Українська
        </DropdownMenuItem>
        
        <DropdownMenuItem class="lang-item" @select="changeLanguage('en')">
          <span class="flag"><Icon icon="flagpack:gb-ukm"/></span> English
        </DropdownMenuItem>
        
        <DropdownMenuItem class="lang-item" @select="changeLanguage('pl')">
          <span class="flag"><Icon icon="twemoji:flag-poland"/></span> Polska
        </DropdownMenuItem>

        <DropdownMenuItem class="lang-item" @select="changeLanguage('es')">
          <span class="flag"><Icon icon="twemoji:flag-spain"/></span> Español
        </DropdownMenuItem>
        
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { 
  DropdownMenuRoot, 
  DropdownMenuTrigger, 
  DropdownMenuPortal, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from 'reka-ui';

const changeLanguage = (langCode) => {
  console.log('Зміна мови на:', langCode);
};
</script>

<style scoped>
/* Стилі для тригера (кнопки) */
.lang-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 8px 14px;
  color: var(--primary);
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.lang-trigger:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.02);
}

.flag {
  display: flex;
  align-items: center;
  font-size: 18px;
}

.arrow {
  font-size: 12px;
  color: #525866;
  display: flex;
  align-items: center;
}

/* Контент меню з ефектом матового скла (Backdrop Blur) */
:global(.lang-dropdown-content) {
  min-width: 180px;
  background-color: rgba(15, 15, 22, 0.75); /* Синхронізовано з твоїм --main-bg */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  z-index: 1100;
}

/* Елемент списку мов */
.lang-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  color: rgba(255, 255, 255, 0.65);
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;
}

/* Стан наведення через data-attribute від Reka UI */
.lang-item[data-highlighted] {
  background-color: rgba(255, 255, 255, 0.07);
  color: var(--primary);
}

@media (max-width: 768px) {
  .lang-trigger {
    padding: 8px;
  }
}
</style>