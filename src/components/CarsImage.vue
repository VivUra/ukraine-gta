<template>
    <section class="image-section">
      <div class="container">
        
        <div 
          ref="imageBlockRef"
          :class="['image-wrapper', { 'is-visible': isVisible }]"
        >
          <img 
            src="https://ukraine-gta.com.ua/images/pages/main/cars-big.webp" 
            alt="Ukraine GTA Cars" 
            class="cars-image"
          />
          <div class="image-overlay"></div>
        </div>
  
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  
  const isVisible = ref(false)
  const imageBlockRef = ref(null)
  let observer = null
  
  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible.value = true
        }
      })
    }, {
      threshold: 0.1 // Анімація спрацьовує, коли 10% зображення з'являється на екрані
    })
  
    if (imageBlockRef.value) observer.observe(imageBlockRef.value)
  })
  
  onUnmounted(() => {
    if (observer) observer.disconnect()
  })
  </script>
  
  <style scoped>
.image-section {
  background-color: #0f1115;
  padding: 32px 16px 0 16px; /* Занулюємо нижній падінг секції, якщо під нею одразу заголовок */
  overflow: hidden;
}

.container {
  max-width: 1140px;
  margin: 0 auto;
}

/* --- АНІМАЦІЯ ВИСОВУВАННЯ --- */
.image-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  
  /* ВИПРАВЛЕННЯ: Прибираємо aspect-ratio, щоб висота залежала тільки від картинки */
  height: auto; 
  background-color: transparent;
  
  /* Початковий стан анімації */
  opacity: 0;
  transform: translateY(60px);
  transition: opacity 1s ease-out, transform 1s ease-out;
}

/* Стан після появи на екрані */
.image-wrapper.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ВИПРАВЛЕННЯ для картинки */
.cars-image {
  width: 100%;
  height: auto; /* Картинка пропорційно масштабується по ширині */
  display: block; /* Прибирає дефолтний нижній відступ інлайнових елементів */
  transition: transform 0.8s ease;
}

.image-wrapper:hover .cars-image {
  transform: scale(1.02);
}

/* Покриття-оверлей */
.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 17, 21, 0.2), transparent);
  pointer-events: none;
}

/* Адаптивність */
@media (min-width: 1024px) {
  .image-section {
    padding: 40px 32px 0 32px;
  }
}
  </style>