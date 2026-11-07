<template>
  <section class="hero">
    <div class="hero__bg"></div>

    <div class="hero__characters-wrap">
      <img src="https://ukraine-gta.com.ua/images/pages/main/main-img.webp?v=1" alt="Ukraine GTA Characters"
        class="hero__characters-img">
    </div>

    <div class="container hero__container">
      <div class="hero__content">

        <div class="hero__title-wrapper">
          <h1 class="hero__title">
            Онлайн гра <span class="text-gradient">про Україну!</span>
          </h1>
      </div>

        <p class="hero__description">
          <span class="text-white font-bold">UKRAINE GTA</span> — це реалістична онлайн гра про нашу країну, в якій
          відтворена вся краса наших міст, справжніх авто, де ти зможеш попрацювати на реально крутих роботах.
          Запрошуємо тебе відчути цю теплу атмосферу української гри та знайти серед українських гравців справжніх
          друзів!
        </p>

        <div class="hero__interactive">

          <div class="online-counter">
            <span class="online-counter__badge">
              <span class="pulse-dot"></span>
              3209+
            </span>
            <span class="online-counter__text">Активних гравців</span>
          </div>

          <div class="hero__buttons">
            <button class="btn-play">
              <span class="btn-play__icon">▶</span>
              <a href="https://ukraine-gta.com.ua/uagta_online_signed.exe">Розпочати гру</a>
            </button>

            <button class="btn-more">
              <span class="btn-more__icon">
                <Icon icon="ion:document-text" />
              </span>
              <a href="https://www.youtube.com/watch?v=rbs0JG64YSs&t=2s">Дізнатись більше</a>
            </button>
          </div>

          <div class="hero__subtext">
            <span class="windows-icon">
              <Icon icon="mdi:microsoft-windows" />
            </span>
            <span>Доступно тільки для Windows</span>
          </div>

        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { Icon } from '@iconify/vue';
</script>

<style scoped>
/* ГОЛОВНИЙ КОНТЕЙНЕР СЕКЦІЇ */
.hero {
  position: relative;
  width: 100%;
  background-color: #050508;
  /* Глибокий темний колір бази */
  display: flex;
  align-items: flex-start;
  /* Контент притискаємо ближче до верху */
  padding-top: 80px;
  padding-bottom: 80px;
  overflow: hidden;
}

/* ШАР 1: ЯСКРАВИЙ ДЕКОРАТИВНИЙ ФОН */
.hero__bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://ukraine-gta.com.ua/images/pages/main/decor.webp');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  /* Створюємо радіальне затемнення до країв, щоб середина світилася */
  mask-image: radial-gradient(circle at center 30%, black 20%, rgba(0, 0, 0, 0.2) 70%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle at center 30%, black 20%, rgba(0, 0, 0, 0.2) 70%, transparent 100%);
  opacity: 0.45;
  /* Регулюємо видимість фону, щоб було видно структуру, але читався текст */
  z-index: 1;
}

/* ШАР 2: ЦЕНТРАЛЬНА КАРТИНКА З ПЕРСОНАЖАМИ */
.hero__characters-wrap {
  position: absolute;
  bottom: 0;
  /* Рівно по нижньому краю хедера */
  left: 50%;
  transform: translate(-50%, 15%);
  width: 100%;
  max-width: 1100px;
  /* Обмежуємо розтягування */
  display: flex;
  justify-content: center;
  pointer-events: none;
  /* Щоб картинка не заважала клікати на кнопки */
  z-index: 2;

  @media (max-width: 991px) {
    transform: translate(-50%, -1%);
    width: 110vw;
  }
}

.hero__characters-img {
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: bottom center;
}

/* ШАР 3: СІТКА КОНТЕНТУ */
.hero__container {
  position: relative;
  z-index: 3;
  /* Поверх фону та персонажів */
  width: 100%;
}

.hero__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0 auto;
}

/* ЗАГОЛОВОК (Синхронізовано шрифт та масштаб) */
.hero__title {
  font-family: var(--font-primary);
  font-size: 72px;
  /* Великий акцентний розмір */
  font-weight: 900;
  /* Твій GothamPro-Black */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--primary);
  margin-bottom: 24px;
  line-height: 1.1;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

.text-gradient {
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
}

/* ОПИС */
.hero__description {
  font-family: var(--font-primary);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.6;
  max-width: 760px;
  color: rgba(255, 255, 255, 0.5);
  /* Створюємо «вікно» простору для облич персонажів */
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

/* ІНТЕРАКТИВНИЙ БЛОК (Внизу персонажів) */
.hero__interactive {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  margin-top: 345px;
  /* Штовхає елементи вниз */
}

/* ЛІЧИЛЬНИК ОНЛАЙНУ */
.online-counter {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: rgba(10, 10, 15, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px 18px 6px 6px;
  border-radius: 30px;
  backdrop-filter: blur(10px);
}

.online-counter__badge {
  background-color: var(--primary);
  color: #0f0f16;
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 900;
  padding: 6px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pulse 1.6s infinite;
}

.online-counter__text {
  font-family: var(--font-primary);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.9);
}

/* КНОПКИ */
.hero__buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-play {
  background: var(--gradient);
  color: #ffffff;
  border: none;
  padding: 16px 40px;
  border-radius: 6px;
  font-family: var(--font-primary);
  font-size: 15px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(236, 43, 29, 0.3);
}

.btn-play:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-play__icon {
  font-size: 11px;
}

.btn-more {
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--primary);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 40px;
  border-radius: 6px;
  font-family: var(--font-primary);
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.btn-more:hover {
  background-color: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.btn-more__icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
}

/* СУБТЕКСТ */
.hero__subtext {
  font-family: var(--font-primary);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: -4px;
}

.windows-icon {
  font-size: 14px;
  display: flex;
  align-items: center;
}

/* АНІМАЦІЯ КРАПКИ */
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* АДАПТИВНІСТЬ ДЛЯ МЕНШИХ ЕКРАНІВ */
@media (max-width: 1024px) {
  .hero__title {
    font-size: 52px;
  }
}

@media (max-width: 767px) {
  .hero {
    padding-top: 40px;
  }

  .hero__title {
    font-size: 38px;
  }

  .hero__description {
    display: none;
  }

  .hero__buttons {
    flex-direction: column;
    width: 100%;
  }

  .hero__characters-wrap {
    top: 70px;
  }

  .hero__interactive {
    margin-top: 30vw;
  }

  .btn-play,
  .btn-more {
    width: 100%;
    justify-content: center;
  }
}

/* Батьківський контейнер, який обрізає все, що виходить за його межі */
.hero__title-wrapper {
  overflow: hidden;
  display: inline-block; /* Або block, залежно від вашої розмітки */
}

/* Стилі для самого заголовка */
.hero__title {
  margin: 0;
  /* Запуск анімації: назва, тривалість, тип плавності, затримка (за бажанням), фіксація кінцевого стану */
  animation: slideUp 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  
  /* Початковий стан (зміщений вниз) */
  transform: translateY(100%); 
  opacity: 0;
}

/* Ключові кадри анімації */
@keyframes slideUp {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Ваш градієнт для тексту */
.text-gradient {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>