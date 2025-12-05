<template>
  <div class="recommendation-page">
    <!-- 顶部导航栏 -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">
            <img src="@/assets/logo.png" alt="觅活—MeetHub" class="logo-img">
            <span class="logo-text">觅活—MeetHub</span>
          </div>
          <div class="nav-menu">
            <router-link to="/recommendations" class="nav-menu-item active">首页</router-link>
            <router-link to="/activitylist" class="nav-menu-item">分类</router-link>
          </div>
        </div>
        
        <div class="nav-right">
          <button class="create-btn" @click="goToCreate">
            🎯 免费创建
          </button>
          <template v-if="isLoggedIn">
            <router-link :to="userCenter" class="nav-link">{{ displayName }}</router-link>
          </template>
          <template v-else>
            <router-link to="/auth" class="nav-link">注册/登录</router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域：全屏推荐卡片 -->
    <div class="fullscreen-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>正在加载推荐活动...</p>
      </div>

      <!-- 空状态（不存在推荐时-->
      <div v-else-if="activities.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3 v-if="!isLoggedIn">请登录查看推荐活动</h3>
        <h3 v-else>暂无推荐活动</h3>
        <p v-if="!isLoggedIn">登录后我们会根据您的兴趣为您推荐最适合的活动</p>
        <p v-else>请稍后再来查看，或浏览所有活动</p>
        <router-link v-if="!isLoggedIn" to="/auth" class="browse-btn">
          前往登录
        </router-link>
        <router-link v-else to="/activitylist" class="browse-btn">
          浏览所有活动
        </router-link>
      </div>

      <!-- 全屏单卡片展示 -->
      <div v-else class="fullscreen-card-wrapper">
        <!-- 左箭头 -->
        <button 
          class="arrow-btn arrow-left" 
          @click="previousActivity"
          :disabled="activities.length <= 1"
        >
          ‹
        </button>

        <!-- 中间卡片 -->
        <div class="card-display-area">
          <div class="card-transition-wrapper">
            <RecommendationCard 
              :key="`${currentIndex}-${activities[currentIndex]?.id}`"
              :activity="activities[currentIndex]"
              class="fullscreen-card"
            />
          </div>
          
          <!-- 卡片指示器和操作 -->
          <div class="card-controls">
            <div class="card-indicator">
              <span class="indicator-text">{{ currentIndex + 1 }} / {{ activities.length }}</span>
              <button 
                class="refresh-mini-btn"
                @click="refreshRecommendations"
                title="换一批推荐"
              >
                🔄
              </button>
            </div>
          </div>
        </div>

        <!-- 右箭头 -->
        <button 
          class="arrow-btn arrow-right" 
          @click="nextActivity"
          :disabled="activities.length <= 1"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import RecommendationCard from './recommendationcard.vue'
import { activityAPI } from '@/services/api'
import { userStore } from '@/stores/userstore'

const router = useRouter()

// 数据状态
const activities = ref([])
const loading = ref(false)
const recommendCount = ref(5)
const currentIndex = ref(0) // 当前显示的卡片索引

// 计算属性
const isLoggedIn = computed(() => userStore.isLoggedIn)
const displayName = computed(() => userStore.userInfo?.username || '用户')
const userCenter = computed(() => {
  const id = (userStore.userInfo && (userStore.userInfo.id || userStore.userInfo.user_id)) || localStorage.getItem('user_id')
  return id ? `/user/${id}` : '/auth'
})
const totalPages = computed(() => 1)

// 加载推荐活动
const loadRecommendations = async () => {
  loading.value = true
  try {
    const res = await activityAPI.getRecommendedActivities(recommendCount.value, {
      exclude_viewed: true,
      exclude_registered: true,
      exclude_ended: true
    })
    
    console.log('推荐接口响应:', res)
    
    if (res.success) {
      let activityList = []
      
      if (res.data && Array.isArray(res.data.recommendations)) {
        //recommendations 数组，每个元素包含 activity 对象
        activityList = res.data.recommendations.map(item => {
          const activity = item.activity || item
          return {
            ...activity,
            id: activity.id || item.id
          }
        })
      } else if (Array.isArray(res.data)) {
        // 备用格式：直接是活动数组
        activityList = res.data
      } else if (res.data && Array.isArray(res.data.items)) {
        // 备用格式：items 数组
        activityList = res.data.items
      } else {
        console.warn('推荐活动返回格式未知:', res.data)
        activityList = []
      }
      
      activities.value = activityList
      currentIndex.value = 0
      console.log('推荐活动已加载，总数:', activities.value.length)
    } else {
      console.error('获取推荐活动失败:', res.message)
      activities.value = []
    }
  } catch (error) {
    console.error('加载推荐活动异常:', error)
    activities.value = []
  } finally {
    loading.value = false
  }
}

// 翻页方法
const nextActivity = () => {
  if (activities.value.length === 0) return
  
  // 检查是否到达最后一个活动
  if (currentIndex.value === activities.value.length - 1) {
    // 到达最后一个，自动加载新的推荐（一批5个）
    loadMoreRecommendations()
  } else {
    // 继续切换到下一个
    currentIndex.value++
  }
}

const previousActivity = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 加载更多推荐（循环推荐）
const loadMoreRecommendations = async () => {
  loading.value = true
  try {
    const res = await activityAPI.getRecommendedActivities(recommendCount.value, {
      exclude_viewed: true,
      exclude_registered: true,
      exclude_ended: true
    })
    
    console.log('加载更多推荐:', res)
    
    if (res.success) {
      let newActivityList = []
      
      if (res.data && Array.isArray(res.data.recommendations)) {
        newActivityList = res.data.recommendations.map(item => {
          const activity = item.activity || item
          return {
            ...activity,
            id: activity.id || item.id
          }
        })
      } else if (Array.isArray(res.data)) {
        newActivityList = res.data
      } else if (res.data && Array.isArray(res.data.items)) {
        newActivityList = res.data.items
      }
      
      // 追加新活动到现有列表
      if (newActivityList.length > 0) {
        activities.value.push(...newActivityList)
        console.log('推荐列表已更新，总数:', activities.value.length)
      }
    } else {
      console.error('加载更多推荐失败:', res.message)
    }
  } catch (error) {
    console.error('加载更多推荐异常:', error)
  } finally {
    loading.value = false
  }
}

// 刷新推荐（重新开始）
const refreshRecommendations = () => {
  currentIndex.value = 0
  loadRecommendations()
}

// 导航方法
const goToCreate = () => {
  router.push('/activity')
}

// 页面加载时获取推荐
onMounted(() => {
  // 如果已登录，加载推荐；如果未登录，显示空状态提示
  if (isLoggedIn.value) {
    loadRecommendations()
  } else {
    console.warn('用户未登录，显示空状态')
    activities.value = []
  }
})
</script>

<style scoped>
/* 整体布局 */
.recommendation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8F0 0%, #F8F9FB 100%);
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.main-nav {
  background: linear-gradient(135deg, #FF8519 0%, #FF9E47 100%);
  box-shadow: 0 4px 12px rgba(255, 133, 25, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-menu-item {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  padding: 6px 0;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.nav-menu-item:hover {
  border-bottom-color: rgba(255, 255, 255, 0.5);
}

.nav-menu-item.active {
  border-bottom-color: #fff;
}

.nav-menu-item.router-link-active {
  border-bottom-color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.logo:hover {
  transform: scale(1.02);
}

.logo-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.create-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 全屏容器 */
.fullscreen-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top-color: #FF8519;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1a1a1a;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #666;
  font-size: 14px;
}

.browse-btn {
  display: inline-block;
  padding: 10px 20px;
  background: linear-gradient(135deg, #FF8519 0%, #FF9E47 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.browse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 133, 25, 0.3);
}

/* 全屏卡片包装 */
.fullscreen-card-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  padding: 60px 40px;
  position: relative;
}

/* 卡片显示区域 */
.card-display-area {
  flex: 1;
  max-width: 1150px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.card-transition-wrapper {
  width: 100%;
  height: auto;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fullscreen-card {
  width: 100%;
  max-width: 1150px;
}

/* 箭头按钮 */
.arrow-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #FF8519;
  background: rgba(255, 133, 25, 0.1);
  color: #FF8519;
  font-size: 36px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  z-index: 10;
}

.arrow-btn:hover:not(:disabled) {
  background: #FF8519;
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 133, 25, 0.3);
}

.arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.arrow-left {
  margin-right: 20px;
}

.arrow-right {
  margin-left: 20px;
}

/* 卡片控制区 */
.card-controls {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}

.card-indicator {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.indicator-text {
  font-size: 14px;
  font-weight: 600;
  color: #FF8519;
  min-width: 60px;
  text-align: center;
}

.refresh-mini-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #FF8519 0%, #FF9E47 100%);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.refresh-mini-btn:hover {
  transform: rotate(180deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 133, 25, 0.3);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .fullscreen-card-wrapper {
    gap: 20px;
    padding: 30px 15px;
  }

  .arrow-btn {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }

  .card-display-area {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .fullscreen-card-wrapper {
    flex-direction: column;
    gap: 20px;
    padding: 20px 10px;
  }

  .arrow-btn {
    width: 45px;
    height: 45px;
    font-size: 24px;
  }

  .arrow-left,
  .arrow-right {
    margin: 0;
  }

  .card-display-area {
    order: 2;
    max-height: 60vh;
  }

  .nav-container {
    padding: 10px 16px;
  }

  .nav-left {
    gap: 12px;
  }

  .logo-text {
    display: none;
  }

  .nav-right {
    gap: 12px;
  }

  .create-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .card-controls {
    margin-top: 15px;
  }

  .card-indicator {
    padding: 10px 16px;
    gap: 12px;
  }

  .indicator-text {
    font-size: 12px;
    min-width: 50px;
  }

  .refresh-mini-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .fullscreen-container {
    padding-bottom: 20px;
  }

  .fullscreen-card-wrapper {
    gap: 15px;
    padding: 15px 8px;
  }

  .arrow-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-width: 1px;
  }

  .card-display-area {
    max-height: 50vh;
  }

  .card-transition-wrapper {
    max-height: 50vh;
  }

  .card-indicator {
    padding: 8px 12px;
    gap: 10px;
  }

  .indicator-text {
    font-size: 11px;
    min-width: 45px;
  }

  .refresh-mini-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .logo-img {
    width: 32px;
    height: 32px;
  }
}
</style>
