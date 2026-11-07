<template>
    <section class="jobs-section">
      <div class="container">
        
        <div 
          ref="jobsRef"
          :class="['content-grid', { 'is-visible': isVisible }]"
        >
          
          <div class="image-card">
            <img 
              src="https://ukraine-gta.com.ua/images/pages/main/gallery/@2x/novaposhta.webp" 
              alt="Ukraine GTA Jobs Nova Poshta" 
              class="job-image"
            />
            <div class="image-overlay"></div>
          </div>
  
          <div class="info-card">
            <div class="info-top">
              <span class="fact-badge">| Другий факт</span>
              <h3 class="card-title">Реальні роботи та професії</h3>
              <p class="card-description">
                Величезний вибір робіт для новачків та гравців із досвідом. 
                Працюй у різних державних установах: від генерала СБУ чи НПУ до слуги народу, стань міським головою та очоль місто. Або піди служити в ЗСУ — обороняй свою маленьку країну в UKRAINE GTA. Подобається кримінал, є навіть і таке, викрадай елітні авто, але не потрапляй до рук поліції. Ти можеш стати будь-ким, тисячі професій таких як:
              </p>
            </div>
  
            <div class="jobs-list-wrapper">
              <div class="jobs-list">
                <div v-for="job in jobs" :key="job.name" class="job-item">
                  <span class="job-icon">{{ job.icon }}</span>
                  {{ job.name }}
                </div>
                <div class="job-item more-item">
                  <span class="job-icon">💬</span>
                  та інші...
                </div>
              </div>
            </div>
          </div>
  
        </div>
  
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  
  // Список професій з макету
  const jobs = ref([
    { name: 'Далекобійник', icon: '🚛' },
    { name: 'Машиніст', icon: '🚂' },
    { name: 'Таксист', icon: '🚕' },
    { name: 'Фермер', icon: '🧑‍🌾' }
  ])
  
  const isVisible = ref(false)
  const jobsRef = ref(null)
  let observer = null
  
  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible.value = true
        }
      })
    }, {
      threshold: 0.1
    })
  
    if (jobsRef.value) observer.observe(jobsRef.value)
  })
  
  onUnmounted(() => {
    if (observer) observer.disconnect()
  })
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
  
  .jobs-section {
    background-color: #0f1115;
    color: #ffffff;
    padding: 0px 16px 64px 16px;
    font-family: 'Montserrat', sans-serif;
    overflow: hidden;
  }
  
  .container {
    max-width: 1140px;
    margin: 0 auto;
  }
  
  /* --- АНІМАЦІЯ ВИСОВУВАННЯ --- */
  .content-grid {
    opacity: 0;
    transform: translateY(60px);
    transition: opacity 1s ease-out, transform 1s ease-out;
  }
  
  .content-grid.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Сітка (навпаки: спочатку фото, потім текст) */
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  /* Права картка з текстом */
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
  
  /* Професії */
  .jobs-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .job-item {
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
  
  .job-item:hover {
    border-color: #4b5563;
  }
  
  .more-item {
    color: #6b7280;
    border-style: dashed;
  }
  
  .more-item:hover {
    border-color: #4b5563;
  }
  
  .job-icon {
    font-size: 14px;
  }
  
  /* Ліва картка (Зображення) */
  .image-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    min-height: 300px;
  }
  
  .job-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.7s ease;
  }
  
  .image-card:hover .job-image {
    transform: scale(1.04);
  }
  
  .image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(15, 17, 21, 0.4), transparent);
    pointer-events: none;
  }
  
  .logo-badge {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(15, 17, 21, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    color: #ff4b2b;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  /* --- АДАПТИВНІСТЬ --- */
  @media (min-width: 1024px) {
    .jobs-section {
      padding: 32px 32px 0px 32px;
    }
    /* Тут міняємо колонки місцями для десктопу: 7fr для зображення, 5fr для тексту */
    .content-grid {
      grid-template-columns: 7fr 5fr;
    }
    .image-card {
      min-height: auto;
    }
  }
  </style>