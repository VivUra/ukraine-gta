

<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-card">
        <button class="close-btn" @click="close">✕</button>
        
        <h2>{{ isSignUp ? 'Реєстрація акаунта' : 'Вхід на форум' }}</h2>
        
        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label>Email адреса</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="example@mail.com" 
              required 
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
  
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Обробка...' : (isSignUp ? 'Створити акаунт' : 'Увійти') }}
          </button>
        </form>
  
        <div class="toggle-mode">
          <span v-if="isSignUp">Вже є акаунт? </span>
          <span v-else>Немає акаунта? </span>
          <button type="button" @click="isSignUp = !isSignUp" class="toggle-btn">
            {{ isSignUp ? 'Увійти' : 'Зареєструватися' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { auth } from '../firebase.js'
  import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
  } from 'firebase/auth'
  
  const props = defineProps({
    isOpen: Boolean
  })
  
  const emit = defineEmits(['close', 'success'])
  
  const email = ref('')
  const password = ref('')
  const isSignUp = ref(false)
  const errorMessage = ref('')
  const loading = ref(false)
  
  const close = () => {
    errorMessage.value = ''
    emit('close')
  }
  
  const handleSubmit = async () => {
    errorMessage.value = ''
    loading.value = true
  
    try {
      if (isSignUp.value) {
        await createUserWithEmailAndPassword(auth, email.value, password.value)
      } else {
        await signInWithEmailAndPassword(auth, email.value, password.value)
      }
      
      email.value = ''
      password.value = ''
      emit('success')
      close()
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage.value = 'Цей Email вже зареєстрований.'
          break
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          errorMessage.value = 'Невірний Email або пароль.'
          break
        case 'auth/weak-password':
          errorMessage.value = 'Пароль має містити щонайменше 6 символів.'
          break
        default:
          errorMessage.value = 'Помилка авторизації: ' + error.message
      }
    } finally {
      loading.value = false
    }
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
  
  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  </style>