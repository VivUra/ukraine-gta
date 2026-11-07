<template>
    <footer class="app-footer">
      <div class="container-footer">
        
        <div class="footer-main-grid">
          
          <div class="footer-logo-block">
            <img 
              src="https://ukraine-gta.com.ua/images/footer-logo.png" 
              alt="UKRAINE GTA Logo" 
              class="footer-logo"
            />
          </div>
  
          <div class="footer-links-grid">
            <div>
              <h4 class="links-title">Навігація</h4>
              <ul class="links-list">
                <li><a href="#" class="footer-link">Соц. мережі</a></li>
                <li><a href="#" class="footer-link">Ігровий форум</a></li>
                <li><a href="#" class="footer-link">Ігровий магазин</a></li>
                <li><a href="#" class="footer-link">Новини</a></li>
                <li><a href="#" class="footer-link">Hata Online</a></li>
              </ul>
            </div>
  
            <div>
              <h4 class="links-title">Інформація</h4>
              <ul class="links-list">
                <li><a href="#" class="footer-link">Угода користувача</a></li>
                <li><a href="#" class="footer-link">Правила користування</a></li>
                <li><a href="#" class="footer-link">Політика конфіденційності</a></li>
              </ul>
            </div>
  
            <div>
              <h4 class="links-title">Контакти</h4>
              <ul class="links-list">
                <li><a href="#" class="footer-link">Співпраця / Партнерство</a></li>
                <li><a href="#" class="footer-link">Технічна підтримка</a></li>
                <li><a href="#" class="footer-link">Вакансії</a></li>
                <li><a href="#" class="footer-link">Про нас</a></li>
              </ul>
            </div>
          </div>
  
          <div class="footer-socials-block">
            <div class="socials-grid">
              <a href="#" class="social-button" target="_blank" rel="noopener noreferrer">
                <img src="https://ukraine-gta.com.ua/images/svg/discord.svg" alt="Discord" class="social-icon" />
                <span>Discord</span>
              </a>
              <a href="#" class="social-button" target="_blank" rel="noopener noreferrer">
                <img src="https://ukraine-gta.com.ua/images/svg/instagram.svg" alt="Instagram" class="social-icon" />
                <span>Instagram</span>
              </a>
              <a href="#" class="social-button" target="_blank" rel="noopener noreferrer">
                <img src="https://ukraine-gta.com.ua/images/svg/youtube.svg" alt="YouTube" class="social-icon" />
                <span>YouTube</span>
              </a>
              <a href="#" class="social-button" target="_blank" rel="noopener noreferrer">
                <img src="https://ukraine-gta.com.ua/images/svg/tiktok.svg" alt="TikTok" class="social-icon" />
                <span>TikTok</span>
              </a>
              <a href="#" class="social-button" target="_blank" rel="noopener noreferrer">
                <img src="https://ukraine-gta.com.ua/images/svg/telegram.svg" alt="Telegram" class="social-icon" />
                <span>Telegram</span>
              </a>
            </div>
          </div>
  
        </div>
  
        <div class="footer-bottom-section">
          
          <div class="info-and-payments">
            <p class="project-description">
              Україна ГТА - це український ролеплей проєкт, створений українськими розробниками на платформі МТА. Гра, в якій є графіка та можливості GTA 5 RP. Це український РП проєкт, створений за мотивами кримінальної України.
            </p>
            
            <div class="payment-methods">
            <img src="https://ukraine-gta.com.ua/images/svg/liqpay.svg" alt="LiqPay" class="payment-logo" />
            <img src="https://ukraine-gta.com.ua/images/svg/visa.svg" alt="Visa" class="payment-logo" />
            <img src="https://ukraine-gta.com.ua/images/svg/mastercard.svg" alt="Mastercard" class="payment-logo" />
            <img src="https://ukraine-gta.com.ua/images/svg/apple-pay.svg" alt="Apple Pay" class="payment-logo" />
            <img src="https://ukraine-gta.com.ua/images/svg/google-pay.svg" alt="Google Pay" class="payment-logo" />
          </div>
          </div>
  
          <div class="copyright-divider"></div>
          
          <p class="copyright-text">
            Усі права захищені © 2022 - 2026 UKRAINE GTA
          </p>
  
        </div>
  
      </div>
    </footer>
  </template>
  
  <script setup lang="ts">
  // Компонент статичний, додаткова логіка не потрібна
  </script>
  
  <style scoped>
  .app-footer {
    background-color: #0d0f12; /* Темний бекграунд з макета */
    padding: 60px 0 30px 0;
    font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    border-top: 1px solid rgba(255, 255, 255, 0.03);
  }
  
  .container-footer {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  /* Сітка верхньої частини */
  .footer-main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    margin-bottom: 50px;
  }
  
  @media (min-width: 1024px) {
    .footer-main-grid {
      grid-template-columns: 150px 1fr 280px; /* Лого, Посилання, Соцмережі */
      gap: 50px;
    }
  }
  
  .footer-logo-block {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
  }
  
  .footer-logo {
    height: auto;
    width: 110px;
    opacity: 0.9;
  }
  
  /* Сітка для колонок з посиланнями */
  .footer-links-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 30px;
  }
  
  @media (min-width: 640px) {
    .footer-links-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  
  .links-title {
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 16px 0;
    text-transform: none;
  }
  
  .links-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .footer-link {
    color: #585f6b; /* Приглушений сірий колір посилань */
    font-size: 13.5px;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  .footer-link:hover {
    color: #ffffff;
  }
  
  /* Блок соціальних мереж */
.footer-socials-block {
  display: flex;
  flex-direction: column;
}

.socials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* Остання кнопка займає всю ширину */
.socials-grid :nth-child(5) {
  grid-column: span 2;
}

/* Сама кнопка-компонент */
.social-button {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.03); /* Легкий напівпрозорий фон */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px 16px;
  color: #8a8f99; /* Початковий колір тексту */
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease-in-out; /* Плавна анімація для всього */
}

/* ЕФЕКТ ПРИ НАВЕДЕННІ: підсвічується весь компонент */
.social-button:hover {
  background-color: rgba(255, 255, 255, 0.08); /* Фон стає яскравішим */
  border-color: rgba(255, 255, 255, 0.15);     /* Грані підсвічуються */
  color: #ffffff;                             /* Текст стає чисто білим */
  transform: translateY(-2px);                /* Кнопка ледь помітно піднімається вгору */
}

/* Стилі для іконки всередині */
.social-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  transition: transform 0.25s ease-in-out;
}

/* При ховері на кнопку іконка просто м'яко збільшується, без білих спалахів чи інверсій */
.social-button:hover .social-icon {
  transform: scale(1.08);
}
  /* Нижня секція */
  .footer-bottom-section {
    display: flex;
    flex-direction: column;
  }
  
  .info-and-payments {
    display: flex;
    flex-direction: column;
    gap: 25px;
    margin-bottom: 25px;
  }
  
  @media (min-width: 1024px) {
    .info-and-payments {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .project-description {
    color: #383e48; /* Дуже приглушений текст опису */
    font-size: 12px;
    line-height: 1.6;
    max-width: 750px;
    margin: 0;
  }
  
  .payment-methods {
  display: flex;
  align-items: center;
  gap: 12px; /* Відступ між логотипами */
  flex-wrap: wrap;
}

.payment-logo {
  height: 26px; /* Оптимальна висота для платіжних плашок */
  width: auto;
  object-fit: contain;
  user-select: none;
  pointer-events: none; /* Щоб картинки не можна було випадково перетягнути мишкою */
}
  
  .payment-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    min-width: 65px;
    opacity: 0.4;
    user-select: none;
  }
  
  .copyright-divider {
    height: 1px;
    background-color: rgba(255, 255, 255, 0.03);
    margin-bottom: 25px;
  }
  
  .copyright-text {
    color: #383e48;
    font-size: 13px;
    text-align: center;
    margin: 0;
  }

  .app-footer {
    background-color: #15151d;
  }
  </style>