import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import ForumPage from './pages/ForumPage.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/forum', component: ForumPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;