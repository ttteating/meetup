<template>
  <div class="activity-detail-page">
    <!-- 顶部导航栏 -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">
            <img src="@/assets/logo.png" alt="觅活—MeetHub">
            <span class="logo-text">觅活—MeetHub</span>
          </div>
          <button class="back-btn" @click="goBack">
            ← 返回
          </button>
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

    <!-- 主要内容区域 -->
    <div class="detail-container" v-if="activity">
      <div class="detail-content">
        <!-- 封面图和基本信息 -->
        <div class="cover-section">
          <div class="cover-image">
            <img 
              :src="activity.cover_image || '/placeholder-cover.jpg'"
              referrerpolicy="no-referrer" 
              :alt="activity.title"
              class="cover-img"
            >
            <div class="cover-overlay">
              <div class="activity-badge">
                {{ getCategoryLabel(activity.category) }}
              </div>
            </div>
          </div>
          
          <div class="basic-info">
            <h1 class="activity-title">{{ activity.title }}</h1>
            <div class="organizer-info">
              <span class="organizer-label">发布人：</span>
              <span class="organizer-name">{{ activity.organizer }}</span>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="info-icon">📍</span>
                <div class="info-content">
                  <div class="info-label">活动地点</div>
                  <div class="info-value">{{ activity.location }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <span class="info-icon">🕒</span>
                <div class="info-content">
                  <div class="info-label">活动时间</div>
                  <div class="info-value">{{ formatDateTime(activity.activity_time) }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <span class="info-icon">👥</span>
                <div class="info-content">
                  <div class="info-label">招募人数</div>
                  <div class="info-value">
                    {{ activity.current_participants || 0 }}/{{ activity.max_participants }} 人
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: getParticipationRate() + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 侧边栏 - 报名区域 -->
        <div class="sidebar">
          <div class="join-card">
            <div class="join-header">
              <h3>立即报名</h3>
            </div>
            
            <div class="join-stats">
              <div class="stat-item">
                <span class="stat-number">{{ activity.current_participants || 0 }}</span>
                <span class="stat-label">已报名</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ activity.views || 0 }}</span>
                <span class="stat-label">浏览</span>
              </div>
            </div>
            
            <button 
              class="join-btn"
              @click="handleJoin"
              :disabled="isJoined || loading || !isJoinable"
            >
              <span v-if="loading">报名中...</span>
              <span v-else-if="isJoined">✅ 已报名</span>
              <span v-else-if="isFull">❌ 已满员</span>
              <span v-else-if="!isJoinable">❌ 不可报名</span>
              <span v-else>立即报名</span>
            </button>

            <div class="join-tips">
              <div class="tip-item">✓ 免费参与</div>
              <div class="tip-item">✓ 随时取消</div>
              <div class="tip-item">✓ 活动提醒</div>
            </div>
          </div>
          
          <!-- 组织者信息 -->
          <div class="organizer-card">
            <h4>组织者信息</h4>
            <div class="organizer-details">
              <div class="organizer-avatar">
                {{ getOrganizerInitials(activity.organizer) }}
              </div>
              <div class="organizer-text">
                <div class="organizer-name">{{ activity.organizer }}</div>
                <div class="organizer-rating">⭐ 4.8 (126次活动)</div>
              </div>
            </div>
            <button class="contact-btn">联系组织者</button>
          </div>
        </div>

        <!-- 详情内容区域 -->
        <div class="content-section">
          <!-- 活动收获 -->
          <div class="content-card">
            <h2 class="section-title">🎁 参与收获</h2>
            <div class="benefits-list">
              <div 
                v-for="benefit in activity.benefits" 
                :key="benefit"
                class="benefit-item"
              >
                <span class="benefit-icon">
                  {{ getBenefitIcon(benefit) }}
                </span>
                <span class="benefit-text">{{ benefit }}</span>
              </div>
            </div>
            <div v-if="activity.benefits_details" class="benefits-details">
              <p>{{ activity.benefits_details }}</p>
            </div>
          </div>

          <!-- 活动简介 -->
          <div class="content-card">
            <h2 class="section-title">📝 活动简介</h2>
            <div class="description-content">
              <p>{{ activity.description }}</p>
            </div>
          </div>

          <!-- 面向人群 -->
          <div class="content-card">
            <h2 class="section-title">🎯 面向人群</h2>
            <div class="audience-section">
              <div class="audience-group">
                <h4>年级要求</h4>
                <div class="audience-tags">
                  <span 
                    v-for="audience in activity.target_audience" 
                    :key="audience"
                    class="audience-tag"
                  >
                    {{ getAudienceLabel(audience) }}
                  </span>
                </div>
              </div>
              
              <div class="audience-group" v-if="activity.major_requirements">
                <h4>专业要求</h4>
                <div class="major-requirements">
                  {{ activity.major_requirements }}
                </div>
              </div>
            </div>
          </div>

          <!-- 活动标签 -->
          <div class="content-card">
            <h2 class="section-title">🏷️ 活动标签</h2>
            <div class="tags-section">
              <div class="category-tag main-tag">
                {{ getCategoryLabel(activity.category) }}
              </div>
              <div 
                v-for="benefit in activity.benefits" 
                :key="'tag-' + benefit"
                class="benefit-tag"
              >
                {{ benefit }}
              </div>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>正在加载活动详情...</p>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-section">
      <div class="error-icon">❌</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchActivityDetail">重试</button>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { activityAPI, API_BASE_URL as API_BASE_URL_IMPORT } from '@/services/api'
import { userStore } from '@/stores/userstore'

const route = useRoute()
const router = useRouter()

// 活动数据
const activity = ref(null)
const loading = ref(false)
const error = ref('')
const isJoined = ref(false)

// 计算属性
const isFull = computed(() => {
  if (!activity.value) return false
  return activity.value.current_participants >= activity.value.max_participants
})

const isJoinable = computed(() => {
  const a = activity.value
  if (!a) return false
  
  // 检查活动状态是否为已发布
  if (a.status !== 'published') {
    return false
  }
  
  // 检查是否超过活动开始时间
  const now = Date.now()
  const startTs = a.activity_time ? new Date(a.activity_time).getTime() : null
  if (startTs === null || isNaN(startTs)) return true
  return now <= startTs
})

// 登录状态与用户信息展示
const isLoggedIn = computed(() => userStore.isLoggedIn)
const displayName = computed(() => {
  const u = userStore.userInfo || {}
  const nick = (u.nickname || '').trim()
  const uname = (u.username || '').trim()
  const normalize = (v) => (v && v.toLowerCase() !== 'string' ? v : '')
  return normalize(nick) || normalize(uname) || '个人中心'
})
const userCenter = computed(() => {
  const id = (userStore.userInfo && (userStore.userInfo.id || userStore.userInfo.user_id)) || localStorage.getItem('user_id')
  return id ? `/user/${id}` : '/mycenter'
})

// 选项数据（与创建活动页面保持一致）
const benefitsOptions = [
  { value: '综测加分', label: '综测加分' },
  { value: '志愿时', label: '志愿时' },
  { value: '其他', label: '其他' }
]

const audienceOptions = [
  { value: 'freshman', label: '大一' },
  { value: 'sophomore', label: '大二' },
  { value: 'junior', label: '大三' },
  { value: 'senior', label: '大四' },
  { value: 'graduate', label: '研究生' },
  { value: 'all', label: '不限年级' }
]

const categoryOptions = [
  { value: 'academic', label: '学术调研' },
  { value: 'career', label: '就业创业' },
  { value: 'arts', label: '文体艺术' },
  { value: 'volunteer', label: '志愿服务' },
  { value: 'social', label: '社会实践' },
  { value: 'campus', label: '校园生活' }
]

// 方法
const getCategoryLabel = (categoryValue) => {
  const category = categoryOptions.find(cat => cat.value === categoryValue)
  return category ? category.label : categoryValue
}

const getAudienceLabel = (audienceValue) => {
  const audience = audienceOptions.find(aud => aud.value === audienceValue)
  return audience ? audience.label : audienceValue
}

const getBenefitIcon = (benefit) => {
  const icons = {
    '综测加分': '📈',
    '志愿时': '⏱️',
    '其他': '🎯'
  }
  return icons[benefit] || '✅'
}

const getOrganizerInitials = (organizer) => {
  if (!organizer) return '组'
  return organizer.charAt(0)
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  })
}

const getParticipationRate = () => {
  if (!activity.value || !activity.value.max_participants) return 0
  const current = activity.value.current_participants || 0
  return Math.min((current / activity.value.max_participants) * 100, 100)
}

const goBack = () => {
  router.back()
}

const goToCreate = () => {
  router.push('/activity')
}

const handleJoin = async () => {
  if (isJoined.value || !isJoinable.value) {
    alert('当前活动状态不可报名')
    return
  }
  // 需要登录
  if (!userStore.isLoggedIn) {
    router.push('/auth')
    return
  }
  // 需要令牌
  const token = localStorage.getItem('token')
  if (!token) {
    alert('登录已失效，请重新登录后再试')
    router.push('/auth')
    return
  }
  
  loading.value = true
  try {
    const result = await activityAPI.joinActivity(Number(route.params.id), {
      comment: '',
      additional_info: {}
    })
    if (result.success) {
      isJoined.value = true
      // 更新报名人数
      if (activity.value) {
        activity.value.current_participants = (activity.value.current_participants || 0) + 1
      }
      alert('报名成功！')
      // 成功后再拉一次报名状态以与后端保持一致
      await checkJoinStatus()
    } else {
      alert(result.message || '报名失败')
    }
  } catch (err) {
    console.error('报名错误:', err)
    alert('报名失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const fetchActivityDetail = async () => {
  loading.value = true
  error.value = ''

  try {
    // 获取活动详情
    const result = await activityAPI.getActivityDetails(route.params.id)

    if (!result || !result.success) {
      throw new Error(result?.message || '获取活动详情失败')
    }

    // 如果返回的是分页结构，则取 items[0]
    const payload = result.data
    // 兼容后端两种返回：{ activity, stats } 或 { items: [...] } 或直接对象
    const item = payload?.activity
      ? payload.activity
      : (payload?.items && payload.items.length > 0 ? payload.items[0] : payload)

    // 规范化字段
    const activityData = {
      id: item.id,
      title: item.title,
      description: item.description,
      cover_image: item.cover_image,
      location: item.location,
      activity_time: item.start_time, 
      end_time: item.end_time,
      max_participants: item.max_participants,
      current_participants: item.current_participants || 0,
      views: item.views_count || 0,
      status: item.status,
      benefits: Array.isArray(item.benefits?.benefit) ? item.benefits.benefit : [],
      target_audience: Array.isArray(item.target_audience?.Targeted_people) 
        ? item.target_audience.Targeted_people 
        : [],
      category: Array.isArray(item.target_audience?.Activity_class) && item.target_audience.Activity_class.length > 0
        ? item.target_audience.Activity_class[0]
        : 'campus',
      organizer: item.publisher?.username || item.publisher?.nickname || '未知组织者'
    }

    // 设置到 state
    activity.value = activityData

    // 解析封面图
    await resolveCoverForDetail(activity.value)

    // 检查报名状态
    await checkJoinStatus()

  } catch (err) {
    console.error('获取活动详情错误:', err)
    error.value = '网络错误，请检查连接后重试'
    activity.value = null
  } finally {
    loading.value = false
  }
}

// 检查图片URL是否有效
const checkImage = (url) => {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    // 添加缓存破坏参数以避免过期的 404 响应缓存
    img.src = url + (url.includes('?') ? '&' : '?') + 'v=1'
    // 安全超时
    setTimeout(() => resolve(false), 3000)
  })
}

// 图片扩展名列表
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP']

// 根据活动ID生成候选静态图片URL列表
const getStaticCandidates = (item) => {
  const id = item.id
  const candidates = []

  if (id !== undefined && id !== null) {
    // 使用后端的静态路径 TopActivities，尝试多种扩展名
    imageExtensions.forEach(ext => {
      candidates.push(`${API_BASE_URL_IMPORT}/static/img/TopActivities/${id}.${ext}`)
    })
  }

  return candidates
}

// 解析活动详情页的封面图片
// 优先尝试使用 cover_image URL，失败后回退到静态资源库
const resolveCoverForDetail = async (item) => {
  if (!item) return
  const cur = item.cover_image || ''

  // 如果已经是完整的HTTP URL，则先尝试该URL
  if (/^https?:\/\//i.test(cur)) {
    // 尝试直接使用提供的URL
    if (await checkImage(cur)) {
      item.cover_image = cur
      return
    }
    // URL失败，回退到静态资源库
  }

  // 尝试静态资源库候选
  const candidates = getStaticCandidates(item)
  for (const c of candidates) {
    if (!c) continue
    try {
      // eslint-disable-next-line no-await-in-loop
      const ok = await checkImage(c)
      if (ok) {
        item.cover_image = c
        return
      }
    } catch (e) {
      // 忽略错误，继续尝试下一个候选
    }
  }

  // 如果都不行，维持原值或清空
  if (!cur || cur === 'string') {
    item.cover_image = ''
  }
}

const checkJoinStatus = async () => {
  try {
    // 使用您的API接口检查报名状态
    const result = await activityAPI.checkJoinStatus(route.params.id)
    if (result.success) {
      isJoined.value = result.data.joined || false
    }
  } catch (err) {
    console.error('检查报名状态失败:', err)
  }
}

// 生命周期 - 页面加载时自动获取活动详情
onMounted(() => {
  fetchActivityDetail()
})
</script>

<style scoped>
.activity-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 导航栏样式 */
.main-nav {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo img {
  height: 40px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #ff7e5f;
}

.back-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 8px 16px;
  border-radius: 6px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #e9ecef;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: #495057;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #ff7e5f;
}

.create-btn {
  background: #ff7e5f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.create-btn:hover {
  background: #ff6b4a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 126, 95, 0.3);
}

/* 主要内容区域 */
.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

/* 封面区域 */
.cover-section {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.cover-image {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cover-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3));
  display: flex;
  align-items: flex-end;
  padding: 20px;
}

.activity-badge {
  background: rgba(255, 126, 95, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.basic-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.activity-title {
  font-size: 32px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 16px;
  line-height: 1.3;
}

.organizer-info {
  margin-bottom: 24px;
}

.organizer-label {
  color: #6c757d;
  font-weight: 500;
}

.organizer-name {
  color: #ff7e5f;
  font-weight: 600;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  font-size: 20px;
  margin-top: 2px;
}

.info-content {
  flex: 1;
}

.info-label {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 4px;
}

.info-value {
  color: #212529;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ff7e5f;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.join-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.join-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.join-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.join-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #ff7e5f;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.join-btn {
  width: 100%;
  background: #ff7e5f;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.join-btn:hover:not(:disabled) {
  background: #ff6b4a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 126, 95, 0.3);
}

.join-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.join-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  color: #28a745;
  font-size: 14px;
}

.organizer-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.organizer-card h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #212529;
}

.organizer-details {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.organizer-avatar {
  width: 50px;
  height: 50px;
  background: #ff7e5f;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.organizer-text {
  flex: 1;
}

.organizer-name {
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
}

.organizer-rating {
  font-size: 12px;
  color: #6c757d;
}

.contact-btn {
  width: 100%;
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.contact-btn:hover {
  background: #e9ecef;
}

/* 内容区域 */
.content-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 收获列表 */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.benefit-icon {
  font-size: 20px;
}

.benefit-text {
  font-weight: 500;
  color: #212529;
}

.benefits-details {
  background: #ffe8e0;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #ff7e5f;
}

.benefits-details p {
  margin: 0;
  color: #495057;
  line-height: 1.5;
}

/* 描述内容 */
.description-content {
  line-height: 1.6;
  color: #495057;
}

.description-content p {
  margin: 0;
}

/* 面向人群 */
.audience-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.audience-group h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #495057;
  font-weight: 500;
}

.audience-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.audience-tag {
  background: #e7f5ff;
  color: #1971c2;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 500;
}

.major-requirements {
  color: #495057;
  line-height: 1.5;
}

/* 标签区域 */
.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  background: #ff7e5f;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.benefit-tag {
  background: #ffe8e0;
  color: #ff7e5f;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 500;
}

/* 加载状态 */
.loading-section {
  text-align: center;
  padding: 80px 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff7e5f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-section p {
  color: #6c757d;
  font-size: 16px;
}

/* 错误状态 */
.error-section {
  text-align: center;
  padding: 80px 0;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-section h3 {
  color: #495057;
  margin-bottom: 12px;
}

.error-section p {
  color: #6c757d;
  margin-bottom: 24px;
}

.retry-btn {
  background: #ff7e5f;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: #ff6b4a;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
  
  .cover-section {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .detail-container {
    padding: 16px;
  }
  
  .nav-container {
    padding: 12px 16px;
  }
  
  .logo-text {
    display: none;
  }
  
  .activity-title {
    font-size: 24px;
  }
  
  .content-card {
    padding: 20px;
  }
}
</style>
