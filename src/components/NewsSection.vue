<template>
  <section class="news-section">
    <div class="container">

      <div class="section-top">
        <h2 class="section-title">
          Новини <span class="text-orange">проєкту</span>
        </h2>
      </div>

      <Swiper :breakpoints="breakpoints" :slides-per-view="1" :space-between="20">
        <SwiperSlide v-for="list in newsList">
          <NewsCard :key="list.id" :image="list.image" :title="list.title" :description="list.description"
            :date="list.date" :link="list.link" />
        </SwiperSlide>
      </Swiper>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import NewsCard from './NewsCard.vue'
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css"

const breakpoints = {
  '450': {
    slidesPerView: 1.5,
    spaceBetween: 20,
  },
  '640': {
    slidesPerView: 2,
  },
  '768': {
    slidesPerView: 3,
  },
  '1024': {
    slidesPerView: 4,
  },
}



// Твій масив новин із робочими тестовими картинками
const newsList = ref([
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    title: '4 РОКИ | UKRAINE GTA 4.0',
    description: 'Попереду нова глава UKRAINE GTA. Ми підготували для вас те, що зробить ігровий світ ще більш живим, цікавим та захопливим. Дивіться прем’єру, дізнавайтеся про всі новинки та готуйтеся до нової ери 4.0',
    date: '28.06.2026',
    link: '/news/4-years'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600&auto=format&fit=crop',
    title: 'Оновлення 3.9 | Свіжий подих',
    description: 'Керування будинками, кланом та робота «викрадач авто» отримали новий вигляд і можливості! Оцінюй свіжий дизайн та заробляй більше. Скоріш заходь до гри, все це тебе вже чекає.',
    date: '29.04.2026',
    link: '/news/update-3-9'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    title: 'Оновлення 3.8 | Пасхальна долина',
    description: 'Зустрічайте оновлення 3.8! Ми додали довгоочікувану систему аукціонів для запеклих торгів, запустили святковий Пасхальний івент та впровадили нову систему продажу спецтранспорту.',
    date: '10.04.2026',
    link: '/news/update-3-8'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
    title: 'Оновлення 3.7 | Весняний BattlePass',
    description: 'Весняна мапа, на яку ми так чекали, вже у грі! Заходь, щоб почати проходження нового BattlePass, взяти участь у весняному івенті та переглянути оновлену систему відкриття кейсів.',
    date: '06.03.2026',
    link: '/news/battlepass-3-7'
  },
])
</script>

<style scoped>
.news-section {
  background-color: #0d0f12;
  padding: 60px 0;
  font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-top {
  margin-bottom: 35px;
}

.section-title {
  font-size: 38px;
  font-weight: 900;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0;
  letter-spacing: 1px;
}

.text-orange {
  color: #ff4e00;
}
</style>