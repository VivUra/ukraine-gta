<template>
    <section class="system-requirements">
      <div class="container">
        
        <div class="accordion-header" @click="toggleAccordion" :class="{ 'is-open': isOpen }">
          <div class="header-left">
            <div class="requirements-badge">
              <Icon icon="mdi:calculator-variant" class="badge-icon" />
            </div>
            <h2 class="header-title">Системні вимоги</h2>
          </div>
          <button class="toggle-btn">
            <Icon :icon="isOpen ? 'mdi:minus' : 'mdi:plus'" />
          </button>
        </div>
  
        <div class="accordion-content" :class="{ 'show': isOpen }">
          <div class="requirements-grid">
            
            <div class="req-card">
              <div class="card-top">
                <span class="type-badge low">LOW</span>
                <h3 class="card-title">Мінімальні</h3>
              </div>
              <ul class="specs-list">
                <li v-for="(spec, index) in minimalSpecs" :key="index" class="spec-item">
                  <Icon icon="ph:check-circle-fill" class="check-icon" />
                  <div class="spec-text">
                    <span class="label">{{ spec.label }}</span>
                    <span class="value" v-html="spec.value"></span>
                  </div>
                </li>
              </ul>
            </div>
  
            <div class="req-card">
              <div class="card-top">
                <span class="type-badge med">MED</span>
                <h3 class="card-title">Рекомендовані</h3>
              </div>
              <ul class="specs-list">
                <li v-for="(spec, index) in recommendedSpecs" :key="index" class="spec-item">
                  <Icon icon="ph:check-circle-fill" class="check-icon" />
                  <div class="spec-text">
                    <span class="label">{{ spec.label }}</span>
                    <span class="value" v-html="spec.value"></span>
                  </div>
                </li>
              </ul>
            </div>
  
          </div>
        </div>
  
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { Icon } from '@iconify/vue'
  
  // Стан відкриття аккордеону (тепер за замовчуванням закритий)
  const isOpen = ref(false)
  
  const toggleAccordion = () => {
    isOpen.value = !isOpen.value
  }
  
  // Дані для Мінімальних вимог
  const minimalSpecs = ref([
    { label: 'Операційна система', value: '<strong>Windows 10 x64, Windows 11 x64</strong>' },
    { label: 'Процесор', value: '<strong>Intel Core 2 Duo 2.2 GHz / AMD Phenom 2.2 GHz</strong>' },
    { label: 'Відеокарта', value: '<strong>GTX 550 Ti / ATI Radeon HD 5000 (1 GB VRAM)</strong>' },
    { label: 'Оперативна пам’ять', value: '<strong>8ГБ DDR3</strong>' },
    { label: 'Роздільна здатність екрану', value: '<strong>1280x720</strong>' },
    { label: 'Звукова карта', value: '<strong>Сумісна з DirectX 9</strong>' },
    { label: 'Інтернет-з’єднання', value: '<strong>8 мбіт/сек</strong>' },
    { label: 'Вільне місце на накопичувачі', value: '<strong>15 ГБ</strong>' }
  ])
  
  // Дані для Рекомендованих вимог
  const recommendedSpecs = ref([
    { label: 'Операційна система', value: '<strong>Windows 10 x64, Windows 11 x64</strong>' },
    { label: 'Процесор', value: '<strong>Intel Core i5 3GHz / AMD Ryzen 3GHz</strong>' },
    { label: 'Відеокарта', value: '<strong>GTX 760 Ti / ATI Radeon HD 6000 (2 GB VRAM)</strong>' },
    { label: 'Оперативна пам’ять', value: '<strong>16ГБ DDR3</strong>' },
    { label: 'Роздільна здатність екрану', value: '<strong>1920x1080</strong>' },
    { label: 'Звукова карта', value: '<strong>Сумісна з DirectX 9</strong>' },
    { label: 'Інтернет-з’єднання', value: '<strong>100 мбіт/сек</strong>' },
    { label: 'Вільне місце на накопичувачі', value: '<strong>15 ГБ</strong>' }
  ])
  </script>
  
  <style scoped>
  .system-requirements {
    background-color: #0d0f12;
    color: #ffffff;
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    padding: 40px 0;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  /* --- ШАПКА АККОРДЕОНУ --- */
  .accordion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #161922;
    padding: 18px 24px;
    border-radius: 10px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease, border-radius 0.3s ease;
  }
  
  .accordion-header:hover {
    background-color: #1c202b;
  }
  
  .accordion-header.is-open {
    /* Якщо відкритий, прибираємо нижні закруглення, щоб зливався з контентом */
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .requirements-badge {
    background: linear-gradient(135deg, #ff4e00 0%, #ec6f12 100%);
    width: 28px;
    height: 22px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .badge-icon {
    font-size: 14px;
    color: #fff;
  }
  
  .header-title {
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }
  
  .toggle-btn {
    background: rgba(255, 255, 255, 0.05);
    border: none;
    color: #8a8f99;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .accordion-header:hover .toggle-btn {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
  
  /* --- КОНТЕНТ АККОРДЕОНУ --- */
  .accordion-content {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    background-color: #161922;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  
  .accordion-content.show {
    max-height: 1000px; /* Достатня висота для розгортання */
    opacity: 1;
    padding: 30px;
  }
  
  /* Сетка з карток */
  .requirements-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  
  .req-card {
    background-color: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 20px;
  }
  
  .card-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .type-badge {
    font-size: 10px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 4px;
    color: #fff;
  }
  
  .type-badge.low {
    background: #3b5998; /* Приглушений синій для LOW */
  }
  
  .type-badge.med {
    background: #e67e22; /* Помаранчевий для MED */
  }
  
  .card-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }
  
  /* Списки специфікацій */
  .specs-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }
  
  .spec-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  
  .spec-item:last-child {
    border-bottom: none;
  }
  
  .check-icon {
    color: #2ecc71; /* Зелений колір галочки */
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .spec-text {
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 14px;
    gap: 10px;
  }
  
  .label {
    color: #8a8f99;
  }
  
  .value {
    color: #ffffff;
    text-align: right;
  }
  
  /* Адаптивність */
  @media (max-width: 992px) {
    .requirements-grid {
      grid-template-columns: 1fr; /* На мобільних картки стають одна під одну */
      gap: 20px;
    }
    .accordion-content.show {
      padding: 20px;
    }
    .spec-text {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }
    .value {
      text-align: left;
    }
  }
  </style>