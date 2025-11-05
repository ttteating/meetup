<template>
  <div class="forgot-password-page">
    <!-- 全局Logo -->
    <div class="global-logo">
      <img src="@/assets/logo.png" alt="觅活—MeetHub Logo">
    </div>

    <div class="container">
      <!-- 欢迎展示界面 -->
      <div class="welcome">
        <h1>重置密码</h1>
        <p>
          如果您忘记了密码，可以通过验证手机号和邮箱来重置密码。请确保输入的信息与您注册时提供的信息一致，以验证您的身份。
        </p>
      </div>

      <!-- 重置密码界面 -->
      <div class="reset-password">
        <!-- 步骤指示器 -->
        <div class="steps">
          <div class="step" :class="{ active: currentStep >= 1 }">
            <div class="step-circle">1</div>
            <div class="step-label">身份验证</div>
          </div>
          <div class="step" :class="{ active: currentStep >= 2 }">
            <div class="step-circle">2</div>
            <div class="step-label">重置密码</div>
          </div>
          <div class="step" :class="{ active: currentStep >= 3 }">
            <div class="step-circle">3</div>
            <div class="step-label">完成</div>
          </div>
        </div>

        <!-- 身份验证表单 -->
        <form v-show="currentStep === 1" class="form-section">
          <div class="form-container">
            <label for="phone">手机号</label>
            <input 
              type="text" 
              id="phone" 
              class="form1" 
              placeholder="请输入注册时使用的手机号"
              v-model="verificationForm.phone"
              @input="hideError('phone')"
            >
            <div class="error-message" v-if="errors.phone">{{ errors.phone }}</div>
          </div>

          <div class="form-container">
            <label for="email">邮箱</label>
            <input 
              type="email" 
              id="email" 
              class="form1" 
              placeholder="请输入注册时使用的邮箱"
              v-model="verificationForm.email"
              @input="hideError('email')"
            >
            <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
          </div>

          <button type="button" class="btn" @click="verifyIdentity" :disabled="loading">
            {{ loading ? '验证中...' : '验证身份' }}
          </button>
          
          <div class="back-to-login">
            <router-link to="/login">返回登录</router-link>
          </div>
        </form>

        <!-- 重置密码表单 -->
        <form v-show="currentStep === 2" class="form-section">
          <div class="form-container">
            <label for="new-password">新密码</label>
            <input 
              type="password" 
              id="new-password" 
              class="form1" 
              placeholder="请输入新密码"
              v-model="passwordForm.newPassword"
              @input="hideError('password')"
            >
            <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
          </div>

          <div class="form-container">
            <label for="confirm-password">确认新密码</label>
            <input 
              type="password" 
              id="confirm-password" 
              class="form1" 
              placeholder="请再次输入新密码"
              v-model="passwordForm.confirmPassword"
              @input="hideError('confirm')"
            >
            <div class="error-message" v-if="errors.confirm">{{ errors.confirm }}</div>
          </div>

          <button type="button" class="btn" @click="resetPassword" :disabled="loading">
            {{ loading ? '重置中...' : '重置密码' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="goToStep(1)">返回上一步</button>
        </form>

        <!-- 完成提示 -->
        <div v-show="currentStep === 3" class="form-section">
          <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>密码重置成功！</h2>
            <p>您的密码已成功重置，现在可以使用新密码登录您的账户。</p>
          </div>
          <button type="button" class="btn" @click="goToLogin">返回登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/api'

const router = useRouter()

// 响应式数据
const currentStep = ref(1)
const loading = ref(false)
const verificationToken = ref(null)

// 表单数据
const verificationForm = reactive({
  phone: '',
  email: ''
})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 错误信息
const errors = reactive({
  phone: '',
  email: '',
  password: '',
  confirm: ''
})

// 验证手机号格式
function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 验证邮箱格式
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
function validatePassword(password) {
  return password.length >= 6
}

// 隐藏错误消息
function hideError(field) {
  errors[field] = ''
}

// 跳转到指定步骤
function goToStep(step) {
  currentStep.value = step
}

// 验证身份
async function verifyIdentity() {
  // 清除之前的错误
  hideError('phone')
  hideError('email')
  
  let isValid = true
  
  // 验证手机号
  if (!verificationForm.phone) {
    errors.phone = '请输入手机号'
    isValid = false
  } else if (!validatePhone(verificationForm.phone)) {
    errors.phone = '请输入有效的手机号'
    isValid = false
  }
  
  // 验证邮箱
  if (!verificationForm.email) {
    errors.email = '请输入邮箱'
    isValid = false
  } else if (!validateEmail(verificationForm.email)) {
    errors.email = '请输入有效的邮箱'
    isValid = false
  }
  
  if (!isValid) return
  
  loading.value = true
  
  try {
    const response = await authAPI.verifyIdentity({
      phone: verificationForm.phone,
      email: verificationForm.email
    })
    
    if (response.success) {
      // 保存验证token
      verificationToken.value = response.data.token
      // 进入下一步
      currentStep.value = 2
    } else {
      alert(response.message || '身份验证失败')
    }
  } catch (error) {
    console.error('身份验证错误:', error)
    alert('身份验证失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 重置密码
async function resetPassword() {
  // 清除之前的错误
  hideError('password')
  hideError('confirm')
  
  let isValid = true
  
  // 验证密码
  if (!passwordForm.newPassword) {
    errors.password = '请输入新密码'
    isValid = false
  } else if (!validatePassword(passwordForm.newPassword)) {
    errors.password = '密码长度至少6位'
    isValid = false
  }
  
  // 验证确认密码
  if (!passwordForm.confirmPassword) {
    errors.confirm = '请确认新密码'
    isValid = false
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errors.confirm = '两次输入的密码不一致'
    isValid = false
  }
  
  if (!isValid) return
  
  loading.value = true
  
  try {
    const response = await authAPI.resetPassword({
      token: verificationToken.value,
      new_password: passwordForm.newPassword
    })
    
    if (response.success) {
      // 进入成功页面
      currentStep.value = 3
    } else {
      alert(response.message || '密码重置失败')
    }
  } catch (error) {
    console.error('密码重置错误:', error)
    alert('密码重置失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 返回登录
function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-page {
  background: linear-gradient(135deg, #ffe8e0 0%, #fff5f0 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
}

.forgot-password-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 158, 128, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 182, 159, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 200, 180, 0.1) 0%, transparent 50%);
  z-index: -1;
}

/* 全局Logo样式 */
.global-logo {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.global-logo img {
  width: 120px;
  height: auto;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.1));
}

.container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.welcome {
  flex: 1;
  background: linear-gradient(135deg, rgba(255, 158, 128, 0.8) 0%, rgba(255, 182, 159, 0.8) 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.welcome::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.2" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,160C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
}

.welcome h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  font-weight: 700;
  position: relative;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome p {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
  position: relative;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.reset-password {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
}

.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  position: relative;
}

.steps::before {
  content: "";
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(221, 221, 221, 0.5);
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ddd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step.active .step-circle {
  background: #ff7e5f;
}

.step-label {
  font-size: 0.9rem;
  color: #777;
  transition: all 0.3s;
}

.step.active .step-label {
  color: #ff7e5f;
  font-weight: 500;
}

.form-container {
  margin-bottom: 20px;
}

.form-container label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form1 {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(221, 221, 221, 0.7);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.8);
}

.form1:focus {
  border-color: #ff7e5f;
  box-shadow: 0 0 0 2px rgba(255, 126, 95, 0.2);
  outline: none;
  background: rgba(255, 255, 255, 0.95);
}

.btn {
  width: 100%;
  padding: 14px;
  background: #ff7e5f;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn:hover:not(:disabled) {
  background: #ff6b4a;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 126, 95, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #ccc;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.form-section {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.success-message {
  text-align: center;
  padding: 20px;
}

.success-icon {
  font-size: 4rem;
  color: #4CAF50;
  margin-bottom: 20px;
}

.error-message {
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 5px;
}

.back-to-login {
  text-align: center;
  margin-top: 20px;
}

.back-to-login a {
  color: #ff7e5f;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.back-to-login a:hover {
  color: #ff6b4a;
  text-decoration: underline;
}

.welcome::after {
  content: "";
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.reset-password::before {
  content: "";
  position: absolute;
  top: -50px;
  left: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255, 126, 95, 0.05);
  border-radius: 50%;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .welcome {
    padding: 40px 30px;
  }
  
  .reset-password {
    padding: 40px 30px;
  }
  
  .welcome::after, .reset-password::before {
    display: none;
  }
  
  .global-logo {
    top: 15px;
    left: 15px;
  }
  
  .global-logo img {
    width: 100px;
  }
}
</style>