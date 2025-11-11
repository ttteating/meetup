<!--首页是否需要使用userstore更新状态需要再考虑一下-->
<template>
  <div class="activity-list-page">
    <!-- 顶部导航栏 -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">
            <img src="@/assets/logo.png" alt="觅活—MeetHub">
            <span class="logo-text">觅活—MeetHub</span>
          </div>
           <div class="nav-links">
             <router-link to="/" class="nav-link active">首页</router-link>
             <a href="#" class="nav-link">分类</a>
           </div>
        </div>
        
        <div class="nav-center">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchKeyword"
              placeholder="输入搜索关键词" 
              @keyup.enter="handleSearch"
            >
            <button class="search-btn" @click="handleSearch">
              🔍
            </button>
          </div>
        </div>
        
      <div class="nav-right">
    <template v-if="userStore.isLoggedIn && userStore.userInfo">
      <div class="user-info">
        <router-link to="/activity" class="create-activity-btn">发布活动</router-link>
        <button class="username-btn" @click="goToProfile">
          {{ userStore.userInfo.username }}
        </button>
        <span class="user-location" v-if="userStore.userInfo.location">{{ userStore.userInfo.location }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </template>
    <template v-else>
      <router-link to="/auth" class="nav-link">注册/登录</router-link>
    </template>
  </div>

      </div>
    </nav>

    <!-- 筛选条件区域 -->
    <div class="filter-section">
      <div class="filter-container">
        
        <!-- 参与收获筛选 -->
        <div class="filter-group">
          <div class="filter-label">参与收获</div>
          <div class="filter-options">
            <label 
              v-for="benefit in benefitsOptions" 
              :key="benefit.value"
              class="filter-option"
            >
              <input 
                type="checkbox" 
                :value="benefit.value"
                v-model="filters.benefits"
                @change="applyFilters"
              >
              <span class="option-text">{{ benefit.label }}</span>
            </label>
          </div>
        </div>

        <!-- 面向人群筛选 -->
        <div class="filter-group">
          <div class="filter-label">面向人群</div>
          <div class="filter-options">
            <label 
              v-for="audience in audienceOptions" 
              :key="audience.value"
              class="filter-option"
            >
              <input 
                type="checkbox" 
                :value="audience.value"
                v-model="filters.audience"
                @change="applyFilters"
              >
              <span class="option-text">{{ audience.label }}</span>
            </label>
          </div>
        </div>

        <!-- 活动分类筛选 -->
        <div class="filter-group">
          <div class="filter-label">活动类型</div>
          <div class="filter-options">
            <label 
              v-for="category in categoryOptions" 
              :key="category.value"
              class="filter-option"
            >
              <input 
                type="checkbox" 
                :value="category.value"
                v-model="filters.categories"
                @change="applyFilters"
              >
              <span class="option-text">{{ category.label }}</span>
            </label>
          </div>
        </div>

        <!-- 时间筛选 -->
        <div class="filter-group">
          <div class="filter-label">时间</div>
          <div class="filter-options">
            <label 
              v-for="time in timeOptions" 
              :key="time.value"
              class="filter-option"
            >
              <input 
                type="checkbox" 
                :value="time.value"
                v-model="filters.timeRange"
                @change="applyFilters"
              >
              <span class="option-text">{{ time.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 排序和结果统计 -->
    <div class="results-header">
      <div class="results-count">
        找到 {{ filteredActivities.length }} 个活动
      </div>
      <div class="sort-options">
        <select v-model="sortBy" @change="applySorting" class="sort-select">
          <option value="latest">最新发布</option>
          <option value="hot">热门点击</option>
          <option value="participants">最多参与</option>
        </select>
      </div>
    </div>

    <!-- 活动列表 -->
     <!--此处需要获取活动ID跳转详情界面-->
    <div class="activities-container">
      <div class="activities-grid">
        <div 
          v-for="activity in paginatedActivities" 
          :key="activity.id"
          class="activity-card"
          @click="viewActivityDetail(activity.id)"
        >
          <div class="card-image">
            <img 
              :src="activity.cover_image || '/placeholder-image.jpg'" 
              :alt="activity.title"
              class="activity-cover"
            >
            <div class="card-badge" v-if="activity.category">
              {{ getCategoryLabel(activity.category) }}
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <p class="activity-organizer">{{ activity.organizer }}</p>
            
            <div class="activity-meta">
              <div class="meta-item">
                <span class="meta-icon">📍</span>
                {{ activity.location }}
              </div>
              <div class="meta-item">
                <span class="meta-icon">🕒</span>
                {{ formatDate(activity.activity_time) }}
              </div>
            </div>

            <div class="activity-benefits">
              <span 
                v-for="benefit in activity.benefits" 
                :key="benefit"
                class="benefit-tag"
              >
                {{ benefit }}
              </span>
            </div>

            <div class="card-footer">
              <div class="participants">
                👥 {{ activity.current_participants || 0 }}/{{ activity.max_participants }}
              </div>
              <button 
                class="join-btn"
                @click.stop="joinActivity(activity.id)"
                :disabled="activity.joined"
              >
                {{ activity.joined ? '已报名' : '立即报名' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <p>正在加载活动...</p>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredActivities.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>没有找到符合条件的活动</h3>
        <p>尝试调整筛选条件或搜索关键词</p>
        <button class="create-btn" @click="goToCreate">创建第一个活动</button>
      </div>

      <!-- 分页 -->
      <div v-if="filteredActivities.length > 0" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        
        <span class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </span>
        
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { activityAPI, API_BASE_URL as API_BASE_URL_IMPORT } from '@/services/api'
import { userStore } from '@/stores/userstore'

const router = useRouter()

onMounted(async () => {
  await userStore.initUser()
  initData()
})

// 添加退出登录方法
const handleLogout = () => {
  userStore.clearUser()
  router.push('/auth')
}

//跳转至个人中心
const goToProfile = () => {
  if (userStore.userInfo && userStore.userInfo.id) {
    router.push(`/user/${userStore.userInfo.id}`)
  } else {
    router.push('/auth')
  }
}

// 搜索和筛选状态
const searchKeyword = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 12
const sortBy = ref('latest')//双向响应

// 筛选条件
const filters = reactive({
  benefits: [],
  audience: [],
  categories: [],
  timeRange: []
})

// 计算属性
const filteredActivities = computed(() => activities.value)

// 选项数据
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

const timeOptions = [
  { value: 'this_week', label: '本周内' },
  { value: 'two_weeks', label: '两周内' },
  { value: 'one_month', label: '一个月内' }
]

// 活动数据
const activities = ref([])//双向同步

// 1. 删除本地筛选的 filteredActivities computed 属性
// 2. 修改 totalPages 计算方式：
const totalCount = ref(0) // 新增总数引用
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize)
})

// 3. 简化 paginatedActivities:
const paginatedActivities = computed(() => {
  return activities.value // 直接使用后端返回的分页数据
})

// 4. 更新 fetchActivities 方法：
const fetchActivities = async () => {
  loading.value = true
  try {
      // 将前端的筛选值映射为后端期望的值（后端使用中文标签）
      const audienceMap = { freshman: '大一', sophomore: '大二', junior: '大三', senior: '大四', graduate: '研究生', all: 'all' }
      const categoryMap = { academic: '学术调研', career: '就业创业', arts: '文体艺术', volunteer: '志愿服务', social: '社会实践', campus: '校园生活' }

      const params = {
        keyword: searchKeyword.value.trim(),
        benefits: filters.benefits && filters.benefits.length ? filters.benefits : undefined,
        audience: filters.audience && filters.audience.length ? filters.audience.map(a => audienceMap[a] || a) : undefined,
        categories: filters.categories && filters.categories.length ? filters.categories.map(c => categoryMap[c] || c) : undefined,
        timeRange: filters.timeRange && filters.timeRange.length ? filters.timeRange : undefined,
        page: currentPage.value,
        pageSize: pageSize,
        sortBy: sortByMap[sortBy.value] || 'created_at' // 默认按创建时间
      }

      const result = await activityAPI.getActivitiesWithFilters(params)
      if (result.success) {
        // 后端返回结构 { total, items: [...] }
        const items = result.data.items || []
        // 规范化每个活动的字段以适应前端显示逻辑
        activities.value = items.map(item => ({
          ...item,
          // 兼容不同字段命名：activity_time 使用 start_time
          activity_time: item.start_time || item.activity_time,
          // category 从 target_audience.Activity_class 取第一个值（如果存在）或使用 item.category
          category: (item.target_audience && Array.isArray(item.target_audience.Activity_class) && item.target_audience.Activity_class.length > 0)
                    ? item.target_audience.Activity_class[0]
                    : (item.category || ''),
          // benefits 展平为数组
          benefits: Array.isArray(item.benefits?.benefit) ? item.benefits.benefit : (Array.isArray(item.benefits) ? item.benefits : []),
          // organizer 可从 publisher.nickname / username 推断
          organizer: (item.publisher && (item.publisher.nickname || item.publisher.username)) || item.organizer || '',
          // 初始 cover_image 先使用返回值或占位，之后会尝试检测可用的静态 URL
          cover_image: item.cover_image || item.cover_image_url || ''
        }))
        // 异步检测并解析每个活动的封面真实 URL（如果需要）
        activities.value.forEach(a => resolveCoverImageIfNeeded(a))
        totalCount.value = result.data.total || 0
      } else {
        activities.value = []
        totalCount.value = 0
      }
  } catch (error) {
    console.error('获取活动列表错误:', error)
    activities.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// 5. 添加防抖的数据监听：
let searchTimer = null
watch(
  [searchKeyword, filters, sortBy, currentPage],
  () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      fetchActivities()
    }, 300)
  },
  { deep: true }
)



// 方法
const getCategoryLabel = (categoryValue) => {
  // 支持两种情况：categoryValue 可能是前端 code（如 'academic'），也可能是后端中文标签（如 '学术调研'）
  let category = categoryOptions.find(cat => cat.value === categoryValue)
  if (category) return category.label
  // 如果传入的是中文标签，尝试直接返回它或者匹配 label
  category = categoryOptions.find(cat => cat.label === categoryValue)
  return category ? category.label : categoryValue
}

const getBenefitLabels = (benefits) => {
  if (!Array.isArray(benefits)) return []
  return benefits.map(benefit => {
    const option = benefitsOptions.find(opt => opt.value === benefit)
    return option ? option.label : benefit
  })
}
const formatDate = (dateString) => {
  if (!dateString) return '时间待定'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '时间待定'
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const sortByMap = {
  latest: 'created_at',
  hot: 'views_count',
  participants: 'current_participants'
}

const handleSearch = () => {
  currentPage.value = 1
  fetchActivities()
}

const applyFilters = () => {
  currentPage.value = 1
  fetchActivities()
}

const applySorting = () => {
  currentPage.value = 1
  fetchActivities()
}

// 在 activitylist.vue 中添加计算属性或方法
const getAudience = (activity) => {
  return activity.target_audience?.Targeted_people || []
}

const getCategory = (activity) => {
  return activity.target_audience?.Activity_class || []
}
const viewActivityDetail = (activityId) => {
  // 使用命名路由并传递 params，路由名为 'ActivityDetails'（router/index.js）
  router.push({ name: 'ActivityDetails', params: { id: activityId } })
}

const joinActivity = async (activityId) => {
  try {
    const result = await activityAPI.joinActivity(activityId)
    if (result.success) {
      alert('报名成功！')
      // 更新活动状态
      const activity = activities.value.find(a => a.id === activityId)
      if (activity) {
        activity.joined = true
        activity.current_participants = (activity.current_participants || 0) + 1
      }
    } else {
      alert(result.message || '报名失败')
    }
  } catch (error) {
    console.error('报名错误:', error)
    alert('报名失败，请稍后重试')
  }
}

const goToCreate = () => {
  router.push('/activity')
}

// --- 图片解析与探测逻辑 ---
// 尝试多种候选 URL（基于后端可能的静态路径与命名规则），找到第一个可访问的图片并更新 activity.cover_image
const imageExtensions = ['jpg', 'jpeg', 'png', 'webp','gif','bmp']
const staticCandidatesFor = (item) => {
  const id = item.id
  const candidates = []
  // 如果后端直接返回完整 URL 或以 / 开头的相对路径，会在下面处理
  if (item.cover_image) {
    const v = item.cover_image
    if (/^https?:\/\//i.test(v)) {
      candidates.push(v)
    } else if (v.startsWith('/')) {
      candidates.push(`${API_BASE_URL_IMPORT}${v}`)
    } else if (v.includes('.')) {
      // 看起来像文件名，尝试以 uploads 目录为前缀
      candidates.push(`${API_BASE_URL_IMPORT}/uploads/images/activities/${v}`)
      candidates.push(`${API_BASE_URL_IMPORT}/uploads/${v}`)
    }
  }

  // 按 activityId 构造常见命名候选（后端以 activityId 命名封面）
  if (id !== undefined && id !== null) {
    // 优先尝试后端已知的静态路径模式（TopActivities）
    candidates.push(`${API_BASE_URL_IMPORT}/static/img/TopActivities/${id}.jpg`)
    // 然后尝试常见扩展名
    imageExtensions.forEach(ext => {
      candidates.push(`${API_BASE_URL_IMPORT}/uploads/images/activities/${id}.${ext}`)
    })
    // 也尝试无扩展名路径（后端有时直接用 id 无后缀）
    candidates.push(`${API_BASE_URL_IMPORT}/uploads/images/activities/${id}`)
    candidates.push(`${API_BASE_URL_IMPORT}/uploads/${id}`)
  }

  // 最后尝试后端常见静态路径（含 static 前缀）
  if (id !== undefined && id !== null) {
    imageExtensions.forEach(ext => {
      candidates.push(`${API_BASE_URL_IMPORT}/static/uploads/images/activities/${id}.${ext}`)
    })
  }

  return candidates
}

const checkImage = (url) => {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    // add a small cache-busting param to avoid stale 404 cached responses
    img.src = url + (url.includes('?') ? '&' : '?') + 'v=1'
    // safety timeout
    setTimeout(() => resolve(false), 3000)
  })
}

const resolveCoverImageIfNeeded = async (item) => {
  // 如果已经是完整可用 URL，则不做探测
  if (!item) return
  const cur = item.cover_image || ''
  if (/^https?:\/\//i.test(cur)) return

  const candidates = staticCandidatesFor(item)
  for (const c of candidates) {
    // skip duplicates and empty
    if (!c) continue
    try {
      // eslint-disable-next-line no-await-in-loop
      const ok = await checkImage(c)
      if (ok) {
        item.cover_image = c
        return
      }
    } catch (e) {
      // ignore and try next
    }
  }
  // 如果都不行，维持占位图（模板会显示 placeholder）
}



const initData = () => {
  currentPage.value = 1
  fetchActivities()
}

// 监听路由变化，用于从详情页返回时刷新数据
const route = useRoute()
onMounted(() => {
  initData()
})



// 监听筛选条件变化
watch([searchKeyword, filters, sortBy], () => {
  // 防抖处理，避免频繁请求
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    initData()
  }, 300)
})

</script>

<style scoped>
.activity-list-page {
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
  gap: 40px;
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

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-center {
  flex: 1;
  max-width: 400px;
  margin: 0 40px;
}

.search-box {
  display: flex;
  background: #f8f9fa;
  border-radius: 25px;
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  transition: all 0.3s;
}

.search-box:focus-within {
  border-color: #ff7e5f;
  box-shadow: 0 0 0 3px rgba(255, 126, 95, 0.1);
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  padding: 4px 8px;
}

.search-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
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

.nav-link:hover,
.nav-link.active {
  color: #ff7e5f;
}

.nav-link.router-link-active {
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

/* 筛选区域样式 */
.filter-section {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 20px 0;
}

.filter-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-label {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.filter-option input {
  margin-right: 6px;
}

.option-text {
  font-size: 14px;
  color: #6c757d;
  padding: 4px 12px;
  background: #f8f9fa;
  border-radius: 15px;
  border: 1px solid #e9ecef;
  transition: all 0.3s;
}

.filter-option input:checked + .option-text {
  background: #ffe8e0;
  border-color: #ff7e5f;
  color: #ff7e5f;
  font-weight: 500;
}

/* 结果头部样式 */
.results-header {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-count {
  font-size: 16px;
  color: #6c757d;
}

.sort-select {
  padding: 8px 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #495057;
  cursor: pointer;
  outline: none;
}

.sort-select:focus {
  border-color: #ff7e5f;
}

/* 活动网格样式 */
.activities-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(255, 126, 95, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  background: #f8f9fa;
  overflow: hidden;
}

.activity-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 126, 95, 0.9);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.card-content {
  padding: 20px;
}

.activity-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-organizer {
  color: #ff7e5f;
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 500;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 14px;
}

.meta-icon {
  font-size: 14px;
}

.activity-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.benefit-tag {
  background: #ffe8e0;
  color: #ff7e5f;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participants {
  color: #6c757d;
  font-size: 14px;
}

.join-btn {
  background: #ff7e5f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.join-btn:hover:not(:disabled) {
  background: #ff6b4a;
  transform: translateY(-1px);
}

.join-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 加载状态 */
.loading-section {
  text-align: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff7e5f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #495057;
  margin-bottom: 12px;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 24px;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.page-btn {
  background: white;
  border: 1px solid #e9ecef;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #ff7e5f;
  color: white;
  border-color: #ff7e5f;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 16px;
    padding: 12px 16px;
  }
  
  .nav-left {
    width: 100%;
    justify-content: space-between;
  }
  
  .nav-center {
    margin: 0;
    max-width: none;
  }
  
  .nav-right {
    width: 100%;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .filter-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
}

/* 图片错误处理 */
.activity-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f8f9fa;
}

/* 报名按钮状态样式 */
.join-btn.joined {
  background: #6c757d;
  cursor: not-allowed;
}

.join-btn.full {
  background: #dc3545;
  cursor: not-allowed;
}

.join-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 卡片点击效果 */
.activity-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(255, 126, 95, 0.15);
}

/* 加载状态优化 */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #6c757d;
}

/* 空状态优化 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .activities-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .activity-card {
    margin: 0 8px;
  }
}

/* 筛选器响应式 */
@media (max-width: 1024px) {
  .filter-container {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .filter-container {
    grid-template-columns: 1fr;
  }
  
  .filter-options {
    justify-content: flex-start;
  }
}
}

/* 添加用户信息相关样式 */

.username {
  color: #4a5057;
  font-weight: 1000;
}

.logout-btn {
  background: #ff7e5f;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #ff6b4a;
}

.username-btn {
  background: none;
  border: none;
  color: #4a5057;
  font-weight: 1000;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.username-btn:hover {
  color: #ff7e5f;
  background-color: #f8f9fa;
}
</style>