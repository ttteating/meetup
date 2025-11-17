<template>
  <div class="app-root auth-page">
    <!-- 全局Logo -->
    <div class="global-logo">
      <img src="@/assets/logo.png" alt="觅活—MeetHub Logo">
    </div>

    <div class="container">
      <!-- 欢迎展示界面 -->
      <div class="welcome">
        <h1>欢迎加入觅活—MeetHub</h1>
        <h2>在这里，您可以轻松找到各种活动，或发布自己的活动信息。</h2>
        <p>
          觅活—MeetHub 是一个专注于校园活动招募与寻找的平台。无论您是想参加有趣的活动，还是希望吸引更多人参与您的活动，觅活都能满足您的需求。快来探索更新奇的世界吧！
        </p>
      </div>

      <!-- 注册登录界面 -->
      <div class="register"> 
        <div class="tabs">
          <div 
            class="register1" 
            :class="{ active: activeTab === 'login' }"
            @click="activeTab = 'login'"
          >
            登录
          </div>
          <div 
            class="register2" 
            :class="{ active: activeTab === 'register' }"
            @click="activeTab = 'register'"
          >
            注册
          </div>
        </div>

        <!-- 登录表单 -->
        <form v-show="activeTab === 'login'" class="login-form" @submit.prevent="handleLogin">
          <div class="form-container">
            <label for="username">用户名</label>
            <input 
              type="text" 
              id="username" 
              class="form1" 
              placeholder="请输入用户名"
              v-model="loginForm.username"
              required
            >
          </div>

          <div class="form-container">
            <label for="password">密码</label>
            <input 
              type="password" 
              id="password" 
              class="form1" 
              placeholder="请输入密码"
              v-model="loginForm.password"
              required
            >
          </div>

          <button type="submit" class="btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
          
    <div class="forget"> 
      <router-link :to="{ name: 'forgotpassword' }">忘记密码？</router-link>
    </div>
        </form>

        <!-- 注册表单 -->
        <form v-show="activeTab === 'register'" class="register-form" @submit.prevent="handleRegister">
          <div class="form-container"> 
            <label for="username">用户名</label>
            <input 
              type="text" 
              id="username" 
              class="form1" 
              placeholder="请输入用户名"
              v-model="registerForm.username"
              required
            >
          </div>
        
          <div class="form-container"> 
            <label for="email">邮箱</label>
            <input 
              type="email" 
              id="email" 
              class="form1" 
              placeholder="请输入邮箱"
              v-model="registerForm.email"
              required
            >
          </div>
        
          <div class="form-container"> 
            <label for="phone">手机号</label>
            <input 
              type="tel" 
              id="phone" 
              class="form1" 
              placeholder="请输入手机号"
              v-model="registerForm.phone"
              required
            >
          </div>
        
          <div class="form-container">
            <label for="gender">性别</label>
            <select id="gender" class="form1" v-model="registerForm.gender">
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>
        
          <div class="form-container">
            <label for="college">学院</label>
            <input 
              type="text" 
              id="college" 
              class="form1" 
              placeholder="请输入学院"
              v-model="registerForm.profile_attributes.college"
              required
            >
          </div>
        
          <div class="form-container"> 
            <label for="major">专业</label>
            <input 
              type="text" 
              id="major" 
              class="form1" 
              placeholder="请输入专业"
              v-model="registerForm.profile_attributes.major"
              required
            >
          </div>

          <div class="form-container">
            <label for="grade">年级</label>
            <select id="grade" class="form1" v-model="registerForm.profile_attributes.grade">
              <option value="freshman">大一</option>
              <option value="sophomore">大二</option>
              <option value="junior">大三</option>
              <option value="senior">大四</option>
              <option value="graduate">研究生及以上</option>
            </select>
          </div>
        
          <div class="form-container">
            <label for="hobby">爱好</label>
            <input 
              type="text" 
              id="hobby" 
              class="form1" 
              placeholder="请输入爱好"
              :value="registerForm.profile_attributes.hobby.join(', ')"
    @input="registerForm.profile_attributes.hobby = $event.target.value.split(',').map(h => h.trim()).filter(h => h)"
              required
            >
          </div>
        
          <div class="form-container">
            <label for="register-password">密码</label>
            <input 
              type="password" 
              id="register-password" 
              class="form1" 
              placeholder="请输入密码"
              v-model="registerForm.password"
              required
            >
          </div>
        
          <div class="form-container">
            <label for="confirm-password">确认密码</label>
            <input 
              type="password" 
              id="confirm-password" 
              class="form1" 
              placeholder="请再次确认密码"
              v-model="registerForm.confirmPassword"
              required
            >
          </div>
          
          <button type="submit" class="btn" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form> 
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, reactive,onMounted } from 'vue'
import { authAPI } from '@/services/api'
import { userStore } from '@/stores/userstore'//登录状态管理
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('login')
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  profile_attributes:
  {
  gender: '',
  college: '',
  major: '',
  hobby: [],
  grade: ''}
})

const convertGradeToYear = (gradeValue) => {
  const currentYear = new Date().getFullYear(); // 获取当前年份
  // 以2024级为大二基准
  const baseYear = 2024;
  const baseGrade = 'sophomore'; // 大二
  
  // 定义年级对应关系
  const gradeMap = {
    'freshman': 0,    // 大一
    'sophomore': 1,   // 大二
    'junior': 2,      // 大三
    'senior': 3,      // 大四
    'graduate': 4     // 研究生
  }
   const yearDifference = gradeMap[gradeValue] - gradeMap[baseGrade];
  const actualYear = baseYear - yearDifference;
  
  return `${actualYear}级`;
}

// 登录处理
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    alert('请填写所有必填字段！')
    return
  }

  loading.value = true
  try {
    const response = await authAPI.login({
      username: loginForm.username,
      password: loginForm.password,
    })

    if (response.success) {
      // 登录成功处理
      localStorage.setItem('token', response.data.token)
      if (response.data.user && response.data.user.id) {
        localStorage.setItem('user_id', response.data.user.id)
      }
      userStore.setUser(response.data.user)
      alert('登录成功！')
      // 跳转到推荐首页（而不是根路径，避免被重定向回登录页）
      router.push('/recommendations')
    } else {
      alert(response.message || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    alert('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 注册处理
// 注册处理
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.username || !registerForm.email || !registerForm.phone || !registerForm.password) {
    alert('请填写所有必填字段！')
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    alert('两次输入的密码不一致！')
    return
  }

  loading.value = true
  try {
    // 调用年级转换函数，定义 convertedGrade 变量
    const convertedGrade = convertGradeToYear(registerForm.profile_attributes.grade);
    
    const response = await authAPI.register({
      username: registerForm.username,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
      profile_attributes:{
        college: registerForm.profile_attributes.college,
        major: registerForm.profile_attributes.major,
        hobby: registerForm.profile_attributes.hobby,
        gender: registerForm.profile_attributes.gender,
        grade: convertedGrade  // 现在 convertedGrade 已正确定义
      }
    })
    
    if (response.success) {
      alert('注册成功！')
      localStorage.setItem('token', response.data.token)
      userStore.setUser(response.data.user)
      router.push('/')
    } else {
      alert(response.message || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
    alert('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 这里复制你原有的所有CSS样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 把页面级的布局限制在组件根上，避免 scoped 无法作用于 body */
.app-root {
  background: linear-gradient(135deg, #ffe8e0 0%, #fff5f0 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
}

.app-root::before {
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
  width: min(1000px, 95vw);
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  gap: 0;
}

.welcome {
  flex: 1;
  background: linear-gradient(135deg, rgba(255, 158, 128, 0.8) 0%, rgba(255, 182, 159, 0.8) 100%);
  color: white;
  padding: clamp(24px, 4vw, 60px) clamp(16px, 2.5vw, 40px);
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

.welcome h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  font-weight: 500;
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

.register {
  flex: 1;
  padding: clamp(24px, 4vw, 60px) clamp(16px, 2.5vw, 40px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
}

.tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(221, 221, 221, 0.5);
}

.register1, .register2 {
  padding: 12px 20px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  color: #777;
  transition: all 0.3s;
}

.register1.active, .register2.active {
  color: #ff7e5f;
  border-bottom: 3px solid #ff7e5f;
}

.login-form, .register-form {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

.forget {
  text-align: center;
  margin-top: 20px;
}

.forget a {
  color: #ff7e5f;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.forget a:hover {
  color: #ff6b4a;
  text-decoration: underline;
}

/* 添加一些装饰元素 */
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

.register::before {
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
  
  .register {
    padding: 40px 30px;
  }
  
  .welcome::after, .register::before {
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