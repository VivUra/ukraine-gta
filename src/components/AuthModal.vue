<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <button class="close-btn" @click="close">✕</button>
      
      <!-- Якщо користувач вже увійшов -->
      <div v-if="currentUser" class="profile-view">
        <h2>Кабінет гравця</h2>
        <div class="profile-info">
          <span class="profile-label">Ваш нікнейм:</span>
          <span class="profile-nick">{{ currentUser.nickname }}</span>
        </div>
        <button type="button" class="logout-btn" @click="handleLogout">
          Вийти з акаунта
        </button>
      </div>

      <!-- Якщо користувач не авторизований -->
      <template v-else>
        <h2>{{ isSignUp ? 'Реєстрація акаунта' : 'Вхід на форум' }}</h2>
        
        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label>Ігровий нікнейм</label>
            <input 
              v-model="nickname" 
              type="text" 
              placeholder="Наприклад: Taras_Shevchenko" 
              required 
              minlength="3"
            />
          </div>

          <div class="form-group">
            <label>Пароль</label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              minlength="6"
            />
          </div>

          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

          <button type="submit" class="submit-btn">
            {{ isSignUp ? 'Створити акаунт' : 'Увійти' }}
          </button>
        </form>

        <div class="toggle-mode">
          <span v-if="isSignUp">Вже є акаунт? </span>
          <span v-else>Немає акаунта? </span>
          <button type="button" @click="switchMode" class="toggle-btn">
            {{ isSignUp ? 'Увійти' : 'Зареєструватися' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { currentUser, registerUser, loginUser, logoutUser } from '../authStore.js'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'success'])

const nickname = ref('')
const password = ref('')
const isSignUp = ref(false)
const errorMessage = ref('')

const switchMode = () => {
  errorMessage.value = ''
  isSignUp.value = !isSignUp.value
}

const close = () => {
  errorMessage.value = ''
  emit('close')
}

const handleSubmit = () => {
  errorMessage.value = ''

  try {
    if (isSignUp.value) {
      registerUser(nickname.value, password.value)
    } else {
      loginUser(nickname.value, password.value)
    }
    
    nickname.value = ''
    password.value = ''
    emit('success')
    close()
  } catch (error) {
    errorMessage.value = error.message
  }
}

const handleLogout = () => {
  logoutUser()
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(5px);
}

.modal-card {
  background: #14161e;
  border: 1px solid #232733;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  position: relative;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #8a8d98;
  font-size: 20px;
  cursor: pointer;
}

.close-btn:hover {
  color: #fff;
}

h2 {
  font-size: 22px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 700;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  color: #8a8d98;
}

.form-group input {
  background: #0b0c10;
  border: 1px solid #232733;
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #ff3b30;
}

.submit-btn {
  background: linear-gradient(90deg, #ff3b30 0%, #ff6b00 100%);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: opacity 0.2s;
}

.submit-btn:hover {
  opacity: 0.9;
}

.error-msg {
  color: #ff4d4d;
  font-size: 13px;
  margin: 0;
  text-align: center;
}

.toggle-mode {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #8a8d98;
}

.toggle-btn {
  background: none;
  border: none;
  color: #ff3b30;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
}

.toggle-btn:hover {
  text-decoration: underline;
}

.profile-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.profile-info {
  background: #0b0c10;
  border: 1px solid #232733;
  border-radius: 8px;
  padding: 16px 24px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-label {
  color: #8a8d98;
  font-size: 14px;
}

.profile-nick {
  font-weight: 800;
  font-size: 16px;
  color: #fff;
}

.logout-btn {
  width: 100%;
  background: #232733;
  color: #ff4d4d;
  border: 1px solid #ff4d4d;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 77, 77, 0.1);
}
</style>