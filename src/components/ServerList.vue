<template>
    <div class="server-container">
      <div class="server-grid">
        <div 
          v-for="server in visibleServers" 
          :key="server.id" 
          class="server-card"
        >
          <div class="server-number">{{ server.id }}</div>
          <div class="server-info">
            <div class="server-name">{{ server.name }}</div>
            <div class="server-progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (server.online / server.max) * 100 + '%' }"
              ></div>
            </div>
            <div class="server-online">
              <span class="status-dot"></span>
              <span class="online-count">{{ server.online }}</span>/{{ server.max }}
            </div>
          </div>
        </div>
      </div>
  
      <button @click="isExpanded = !isExpanded" class="toggle-btn">
        {{ isExpanded ? 'Приховати всі сервери' : 'Показати всі сервери' }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const servers = ref([
    { id: 7, name: 'Чорноморський край', online: 337, max: 900 },
    { id: 1, name: 'Центральна Україна', online: 549, max: 900 },
    { id: 2, name: 'Західна Україна', online: 493, max: 900 },
    { id: 3, name: 'Східна Україна', online: 434, max: 900 },
    { id: 4, name: 'Північна Україна', online: 359, max: 900 },
    { id: 5, name: 'Південна Україна', online: 269, max: 900 },
    { id: 6, name: 'Подільський Край', online: 232, max: 900 }
  ])
  
  const isExpanded = ref(false)
  
  const visibleServers = computed(() => {
    return isExpanded.value ? servers.value : servers.value.slice(0, 4)
  })
  </script>
  
  <style scoped>
  .server-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #0b0c10;
    font-family: sans-serif;
  }
  
  .server-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }
  
  @media (min-width: 600px) {
    .server-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .server-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  /* Стилі картки сервера */
  .server-card {
    display: flex;
    align-items: center;
    background-color: #12141c;
    border: 1px solid #1f222e;
    border-radius: 4px;
    padding: 15px;
    color: #fff;
    cursor: pointer;
    /* Плавний перехід для збільшення та рамки */
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }
  
  /* Ефект при наведенні (Hover) */
  .server-card:hover {
    transform: scale(1.03); /* Картка стає трохи більшою */
    border-color: #3b4259;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  }
  
  .server-number {
    background-color: #1f222e;
    color: #fff;
    font-weight: bold;
    font-size: 1.1rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    margin-right: 15px;
    transition: background-color 0.25s ease;
  }
  
  /* Білий фон номера при наведенні на картку */
  .server-card:hover .server-number {
    background-color: #fff;
    color: #12141c;
  }
  
  .server-info {
    flex-grow: 1;
  }
  
  .server-name {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 8px;
  }
  
  .server-progress-bar {
    background-color: #1a1d28;
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 6px;
  }
  
  .progress-fill {
    background-color: #4caf50;
    height: 100%;
  }
  
  .server-online {
    font-size: 0.75rem;
    color: #646c7c;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  
  /* Стиль зеленої крапки */
  .status-dot {
    width: 5px;
    height: 5px;
    background-color: #4caf50;
    border-radius: 50%;
    margin-right: 6px;
    display: inline-block;
    box-shadow: 0 0 6px #4caf50; /* Легке світіння */
  }
  
  .online-count {
    color: #a0a5b5;
  }
  
  /* Кнопка */
  .toggle-btn {
    width: 100%;
    background-color: #12141c;
    border: 1px solid #1f222e;
    color: #a0a5b5;
    padding: 12px;
    font-size: 0.9rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .toggle-btn:hover {
    background-color: #1f222e;
    color: #fff;
  }
  </style>