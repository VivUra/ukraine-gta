<script setup>
import { ref } from 'vue';

import Header from './components/Header.vue';
import HeroSection from './components/HeroSection.vue';
import ServerList from './components/ServerList.vue';
import WhyPlay1 from './components/WhyPlay1.vue';
import WhyPlay2 from './components/WhyPlay2.vue';
import HowLoad from './components/HowLoad.vue';
import CarsImage from './components/CarsImage.vue';
import SystemRequirements from './components/SystemRequirements.vue';
import NewsSection from './components/NewsSection.vue';
import Footer from './components/Footer.vue';

// Імпортуємо ваш новий компонент Форуму
import Forum from './components/Forum.vue';

// Змінна для відстеження активної сторінки ('home' або 'forum')
const currentPage = ref('home');
</script>

<template>
  <!-- Передаємо функцію або міняємо сторінку з Хедера -->
  <Header @open-forum="currentPage = 'forum'" @open-home="currentPage = 'home'" />

  <!-- Контент Головної сторінки -->
  <main v-if="currentPage === 'home'">
    <HeroSection />
    <ServerList />
    <WhyPlay1 />
    <WhyPlay2 />
    <CarsImage />
    <HowLoad />
    <SystemRequirements />
    <NewsSection />
  </main>

  <!-- Контент Форуму -->
  <main v-else-if="currentPage === 'forum'">
    <Forum />
  </main>

  <Footer />
</template>