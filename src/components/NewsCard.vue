<template>
    <div class="news-card">
      <div class="card-image-wrapper">
        <img :src="image" :alt="title" loading="lazy" class="card-image" />
      </div>
      <div class="card-content">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-description">{{ description }}</p>
        <div class="card-footer">
          <span class="card-date">{{ date }}</span>
          <a :href="link" class="card-link" target="_blank" rel="noopener noreferrer">
            Детальніше
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    link: { type: String, default: '#' }
  })
  </script>
  
  <style scoped>
  .news-card {
    flex: 0 0 285px;
    background-color: #161922;
    border-radius: 14px; /* Збільшене заокруглення всієї картки */
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.02);
    user-select: none;
    
    /* Магнітне вирівнювання: картка завжди підлаштовується під лівий край при зупинці */
    scroll-snap-align: start; 
  }
  
  .card-image-wrapper {
    width: 100%;
    height: 160px;
    overflow: hidden;
    background-color: #1a1d26;
    flex-shrink: 0;
    border-top-left-radius: 14px;  /* Заокруглення картинок зверху */
    border-top-right-radius: 14px;
  }
  
  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  .news-card:hover .card-image {
    transform: scale(1.05);
  }
  
  .card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    line-height: 1.3;
  }
  
  .card-description {
    font-size: 13px;
    color: #8a8f99;
    line-height: 1.6;
    margin: 0 0 20px 0;
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }
  
  /* Дата тепер чисто біла і трохи приглушена прозорістю за бажанням, або чисто #ffffff */
  .card-date {
    font-size: 13px;
    color: #ffffff; 
    opacity: 0.9;
  }
  
  .card-link {
    font-size: 13px;
    color: #ff4e00;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }
  
  .card-link:hover {
    color: #ec6f12;
  }
  </style>