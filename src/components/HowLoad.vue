<template>
    <div class="hero__title-wrapper">
      <h1 class="hero__title">
        як <span class="text-gradient">ЗАВАНТАЖИТИ ГРУ</span>
      </h1>
    </div>
    
    <section class="how-to-start">
      <div class="container">
        <div class="content-wrapper">
          
          <div class="image-preview">
            <img 
              src="https://ukraine-gta.com.ua/images/pages/main/how.webp" 
              alt="Ukraine GTA Launcher"
              loading="lazy"
            >
          </div>
  
          <div class="info-steps">
            <h2 class="title">РОЗПОЧАТИ ГРУ ДУЖЕ ЛЕГКО!</h2>
            <p class="subtitle">Інсталюйте наш лаунчер та ознайомтесь з інструкцією нижче!</p>
  
            <div class="download-block">
              <button class="download-btn" @click="downloadLauncher">
                <Icon icon="mdi:play" height="25"/> ЗАВАНТАЖИТИ ЛАУНЧЕР
              </button>
              <div class="os-info">
                <Icon icon="mdi:microsoft-windows" class="icon-os" />
                <span>Доступно тільки для Windows</span>
              </div>
            </div>
  
            <hr class="divider">
  
            <h3 class="steps-heading">Інструкція</h3>
            
            <div class="steps-list">
              <div 
                v-for="step in steps" 
                :key="step.id" 
                class="step-item"
                :class="{ 'active': activeStepId === step.id, 'text-muted': activeStepId !== step.id }"
                @click="setActiveStep(step.id)"
              >
                <div class="step-indicator"></div>
                <div class="step-text" v-html="step.text"></div>
              </div>
            </div>
  
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { Icon } from '@iconify/vue';
  
  // Зберігаємо ID поточного активного кроку (за замовчуванням 2, як на скриншоті)
  const activeStepId = ref(2)
  
  const steps = ref([
    {
      id: 1,
      text: 'Натисніть на кнопку "Завантажити", після чого у вас завантажиться .exe файл.'
    },
    {
      id: 2,
      text: 'Відкрийте його та пройдіть інсталяцію. З грою у вас встановляться два драйвери, якщо у вас вони вже встановлені, то їх можна не завантажувати.'
    },
    {
      id: 3,
      text: 'Зайдіть до ігрового лаунчера та завантажте файли самої гри, під час встановлення не закривайте лаунчер.'
    },
    {
      id: 4,
      text: 'Після завершення встановлення оберіть сервер, на якому хочете грати і заходьте в гру!'
    }
  ])
  
  // Функція зміни активного кроку при кліку
  const setActiveStep = (id) => {
    activeStepId.value = id
  }
  
  const downloadLauncher = () => {
    console.log('Завантаження лаунчера...')
  }
  </script>
  
  <style scoped>
  .hero__title-wrapper {
    overflow: hidden;
    text-align: center;
    margin-top: 40px;
  }
  
  .hero__title {
    font-family: var(--font-primary, 'Montserrat', sans-serif);
    font-size: 72px;
    font-weight: 900;
    letter-spacing: 0.5px;
    color: #ffffff;
    margin-bottom: 24px;
    line-height: 1.1;
    text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
    text-transform: uppercase;
  }
  
  .text-gradient {
    background: linear-gradient(90deg, #ff4e00 0%, #ec6f12 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline-block;
  }
  
  .how-to-start {
    background-color: #0d0f12;
    color: #ffffff;
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    overflow: hidden;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 60px 20px;
  }
  
  .content-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 50px;
  }
  
  /* --- ЛІВА КОЛОНКА (Оновлений ховер картинки) --- */
  .image-preview {
    flex: 1;
    display: flex;
    justify-content: center;
    perspective: 1200px;
  }
  
  .image-preview img {
    max-width: 100%;
    height: auto;
    /* Початковий нахил картки */
    transform: rotateY(12deg) rotateX(2deg) scale(1);
    border-radius: 12px;
    box-shadow: -20px 20px 50px rgba(0, 0, 0, 0.6);
    transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s ease;
  }
  
  /* При наведенні: вирівнюється і трохи ЗБІЛЬШУЄТЬСЯ (scale 1.05) */
  .image-preview:hover img {
    transform: rotateY(3deg) rotateX(0deg) scale(1.05);
    box-shadow: -10px 15px 40px rgba(236, 111, 18, 0.15);
  }
  
  /* Права колонка */
  .info-steps {
    flex: 1;
  }
  
  .title {
    font-size: 32px;
    font-weight: 800;
    text-transform: uppercase;
    margin: 0 0 10px 0;
    letter-spacing: 0.5px;
  }
  
  .subtitle {
    color: #8a8f99;
    font-size: 16px;
    margin: 0 0 35px 0;
  }
  
  /* Кнопка та ОС інфо */
  .download-block {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .download-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(90deg, #ff4e00 0%, #ec6f12 100%);
    color: #fff;
    border: none;
    font-weight: 700;
    padding: 16px 32px;
    border-radius: 6px;
    text-transform: uppercase;
    font-size: 15px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(236, 111, 18, 0.25);
    transition: all 0.2s ease;
  }
  
  .download-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(236, 111, 18, 0.45);
  }
  
  .os-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #626875;
    font-size: 14px;
  }
  
  .icon-os {
    width: 18px;
    height: 18px;
    color: #626875;
  }
  
  .divider {
    border: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
    margin: 40px 0 30px 0;
  }
  
  .steps-heading {
    color: #ff4e00;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 25px 0;
    border-left: 2px solid #ff4e00;
    padding-left: 10px;
  }
  
  /* Лінія кроків */
  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: relative;
  }
  
  .steps-list::before {
    content: '';
    position: absolute;
    left: 9px;
    top: 12px;
    bottom: 12px;
    width: 2px;
    background-color: rgba(255, 255, 255, 0.05);
    z-index: 1;
  }
  
  /* --- ІНТЕРАКТИВНІ КРОКИ --- */
  .step-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    position: relative;
    z-index: 2;
    cursor: pointer; /* Робимо курсор у вигляді пальця */
    transition: opacity 0.3s ease, transform 0.2s ease;
  }
  
  .step-indicator {
    width: 20px;
    height: 20px;
    background-color: #161920;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    flex-shrink: 0;
    margin-top: 2px;
    transition: all 0.3s ease;
  }
  
  .step-text {
    font-size: 15px;
    line-height: 1.6;
    color: #ffffff;
    transition: color 0.3s ease;
  }
  
  /* Стани */
  .text-muted {
    opacity: 0.35; /* Неактивні кроки приглушені */
  }
  
  .step-item:hover {
    opacity: 0.8; /* Підсвічування при наведенні на будь-який крок */
  }
  
  /* Активний стан (коли обрано) */
  .step-item.active {
    opacity: 1;
  }
  
  .step-item.active .step-indicator {
    background: linear-gradient(135deg, #ff4e00 0%, #ec6f12 100%);
    border-color: transparent;
    box-shadow: 0 0 12px rgba(255, 78, 0, 0.5);
  }
  
  .step-item.active .step-text {
    color: #ffffff;
  }
  
  /* Адаптивність */
  @media (max-width: 1024px) {
    .content-wrapper {
      flex-direction: column-reverse;
      gap: 40px;
    }
    .image-preview img {
      transform: none;
      max-width: 90%;
    }
    .image-preview:hover img {
      transform: scale(1.03); /* Невелике збільшення без 3D на мобільних */
    }
    .hero__title {
      font-size: 52px;
    }
  }
  
  @media (max-width: 767px) {
    .hero__title {
      font-size: 38px;
    }
  }
  </style>