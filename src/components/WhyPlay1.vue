<template>
    <section class="why-play-section">
      <div class="container">
        
        <h2 
          ref="titleRef"
          :class="['section-title', { 'is-visible': isTitleVisible }]"
        >
          Чому <span class="highlight">варто грати</span> в <br class="mobile-break">
          <span class="highlight">Ukraine GTA</span>
        </h2>
  
        <div 
          ref="contentRef"
          :class="['content-grid', { 'is-visible': isContentVisible }]"
        >
          
          <div class="info-card">
            <div class="info-top">
              <span class="fact-badge">| Перший факт</span>
              <h3 class="card-title">Українська мапа</h3>
              <p class="card-description">
                Ми розробляємо власну, унікальну карту вже майже рік. З перших хвилин гри ти зрозумієш, 
                що знаходишся у рідній Україні, хоч і насправді перебуваєш за тисячі кілометрів від дому.
              </p>
            </div>
  
            <div class="cities-section">
              <div class="cities-label">Зараз у грі є такі міста:</div>
              <div class="cities-list">
                <div v-for="city in cities" :key="city" class="city-item">
                  <span class="city-icon">🏢</span>
                  {{ city }}
                </div>
              </div>
            </div>
          </div>
  
          <div class="image-card">
            <img 
              src="https://ukraine-gta.com.ua/images/pages/main/map.webp" 
              alt="Ukraine GTA Map Kyiv" 
              class="map-image"
            />
            <div class="image-overlay"></div>
            
          </div>
  
        </div>
  
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  
  const cities = ref(['Київ', 'Харків', 'Дніпро', 'Бориспіль', 'Конча-Заспа'])
  
  const isTitleVisible = ref(false)
  const isContentVisible = ref(false)
  
  const titleRef = ref(null)
  const contentRef = ref(null)
  
  let observer = null
  
  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === titleRef.value) {
            isTitleVisible.value = true
          }
          if (entry.target === contentRef.value) {
            isContentVisible.value = true
          }
        }
      })
    }, {
      threshold: 0.1
    })
  
    if (titleRef.value) observer.observe(titleRef.value)
    if (contentRef.value) observer.observe(contentRef.value)
  })
  
  onUnmounted(() => {
    if (observer) observer.disconnect()
  })
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
  
  /* Базові стилі секції */
  .why-play-section {
    background-color: #0f1115;
    color: #ffffff;
    padding: 0px 16px;
    font-family: 'Montserrat', sans-serif;
    overflow: hidden;
  }
  
  .container {
    max-width: 1140px;
    margin: 0 auto;
  }
  
  /* --- АНІМАЦІЇ ВИСОВУВАННЯ --- */
  .section-title, .content-grid {
    opacity: 0;
    transform: translateY(60px);
    transition: opacity 1s ease-out, transform 1s ease-out;
  }
  
  /* Стан після активації скролом */
  .section-title.is-visible, .content-grid.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Невелика затримка для контенту, щоб заголовок виходив першим */
  .content-grid {
    transition-delay: 0.2s;
  }
  
  /* Стилі заголовка */
  .section-title {
    text-align: center;
    text-transform: uppercase;
    font-weight: 900;
    font-size: 2rem;
    line-height: 1.2;
    letter-spacing: 0.05em;
    margin-bottom: 64px;
  }
  
  .highlight {
    color: #ff4b2b;
  }
  
  /* Сітка */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  /* Ліва картка */
  .info-card {
    background-color: #14171c;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .fact-badge {
    color: #ff4b2b;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 8px;
  }
  
  .card-title {
    font-size: 1.75rem;
    font-weight: 900;
    text-transform: uppercase;
    margin: 0 0 16px 0;
    letter-spacing: 0.03em;
  }
  
  .card-description {
    color: #9ca3af;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 32px;
  }
  
  /* Міста */
  .cities-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: 0.05em;
  }
  
  .cities-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .city-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #1b1f26;
    border: 1px solid #2a313c;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    cursor: default;
    transition: border-color 0.3s;
  }
  
  .city-item:hover {
    border-color: #4b5563;
  }
  
  .city-icon {
    font-size: 12px;
  }
  
  /* Права картка (Зображення) */
  .image-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    min-height: 300px;
    margin-bottom: 40px;
  }
  
  .map-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.7s ease;
  }
  
  .image-card:hover .map-image {
    transform: scale(1.04);
  }
  
  .image-overlay {
    position: absolute;
    inset: 0;
    background: gradient(linear, left bottom, left top, from(rgba(15, 17, 21, 0.4)), to(transparent));
    background: linear-gradient(to top, rgba(15, 17, 21, 0.4), transparent);
    pointer-events: none;
  }
  
  .logo-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    background-color: rgba(15, 17, 21, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    color: #ff4b2b;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  /* --- АДАПТИВНІСТЬ (MEDIA QUERIES) --- */
  @media (min-width: 768px) {
    .section-title {
      font-size: 3rem;
    }
    .mobile-break {
      display: none;
    }
  }
  
  @media (min-width: 1024px) {
    .why-play-section {
      padding: 80px 32px;
    }
    .content-grid {
      grid-template-columns: 5fr 7fr;
    }
    .image-card {
      min-height: auto;
    }
  }
  </style>