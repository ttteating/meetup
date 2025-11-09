<template>
  <div class="activity-management">
    <!-- 顶部导航栏 -->
    <header class="management-header">
      <div class="header-content">
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="觅活 Meetup" class="logo">
          <span class="app-name">觅活</span>
        </div>
        <nav class="nav-links">
          <router-link to="/user" class="nav-link">返回个人中心</router-link>
          <router-link to="/" class="nav-link">返回首页</router-link>
        </nav>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="management-main">
      <div class="container">
        <!-- 活动概览 -->
        <div class="activity-overview" v-if="activityDetails">
          <div class="overview-header">
            <h1 class="activity-title">{{ activityDetails.title }}</h1>
            <div class="activity-meta">
              <div class="meta-item">
                <span class="meta-icon">👁️</span>
                <span class="meta-text">浏览量: {{ activityStats.views || 0 }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👥</span>
                <span class="meta-text">报名人数: {{ participants.length }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span class="meta-text">开始时间: {{ formatDate(activityDetails.start_time) }}</span>
              </div>
              <div class="meta-item" v-if="!canEdit">
                <span class="meta-warning">⚠️ 活动开始前2天内不可修改</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 选项卡导航 -->
        <div class="tabs-navigation">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="tab-icon" :class="tab.icon"></span>
            {{ tab.name }}
          </button>
        </div>

        <!-- 报名者管理选项卡 -->
        <div v-if="activeTab === 'participants'" class="tab-content">
          <div class="participants-section">
            <div class="section-header">
              <h2>报名者管理</h2>
              <div class="section-actions">
                <button 
                  class="btn-outline" 
                  @click="exportParticipants"
                  :disabled="participants.length === 0"
                >
                  <span class="btn-icon">📥</span>
                  导出数据
                </button>
              </div>
            </div>

            <div v-if="loading.participants" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载报名者信息中...</p>
            </div>

            <div v-else-if="participants.length === 0" class="empty-state">
              <div class="empty-icon">👥</div>
              <p>暂无报名者</p>
            </div>

            <div v-else class="participants-list">
              <div class="participants-table">
                <div class="table-header">
                  <div class="table-cell">姓名</div>
                  <div class="table-cell">电话</div>
                  <div class="table-cell">邮箱</div>
                  <div class="table-cell">学院</div>
                  <div class="table-cell">年级</div>
                  <div class="table-cell">报名时间</div>
                </div>
                <div 
                  v-for="participant in participants" 
                  :key="participant.id"
                  class="table-row"
                >
                  <div class="table-cell" data-label="姓名">
                    {{ participant.username || '匿名用户' }}
                  </div>
                  <div class="table-cell" data-label="电话">
                    {{ participant.phone || '未填写' }}
                  </div>
                  <div class="table-cell" data-label="邮箱">
                    {{ participant.email || '未填写' }}
                  </div>
                  <div class="table-cell" data-label="学院">
                    {{ participant.college || '未填写' }}
                  </div>
                  <div class="table-cell" data-label="年级">
                    {{ getGradeText(participant.grade) }}
                  </div>
                  <div class="table-cell" data-label="报名时间">
                    {{ formatDateTime(participant.joined_at) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 活动信息编辑选项卡 -->
        <div v-if="activeTab === 'edit'" class="tab-content">
          <div class="edit-section">
            <div class="section-header">
              <h2>活动信息编辑</h2>
              <div class="edit-status" v-if="!canEdit">
                <span class="status-warning">⚠️ 当前无法修改活动信息</span>
                <p class="status-desc">活动开始前2天内不允许修改信息</p>
              </div>
            </div>

            <div v-if="loading.details" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载活动信息中...</p>
            </div>

            <form v-else @submit.prevent="saveActivity" class="edit-form">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label class="form-label">活动标题</label>
                  <input 
                    v-model="editForm.title" 
                    type="text" 
                    class="form-input"
                    :class="{ 'form-input-error': fieldErrors.title }"
                    :readonly="!canEdit"
                    placeholder="请输入活动标题"
                    @blur="validateField('title')"
                  >
                  <div v-if="fieldErrors.title" class="error-message">{{ fieldErrors.title }}</div>
                </div>

                <div class="form-group full-width">
                  <label class="form-label">活动描述</label>
                  <textarea 
                    v-model="editForm.description" 
                    class="form-textarea"
                    :class="{ 'form-input-error': fieldErrors.description }"
                    :readonly="!canEdit"
                    placeholder="请输入活动详细描述"
                    rows="4"
                    @blur="validateField('description')"
                  ></textarea>
                  <div v-if="fieldErrors.description" class="error-message">{{ fieldErrors.description }}</div>
                </div>

                <div class="form-group">
                  <label class="form-label">开始时间</label>
                  <input 
                    v-model="editForm.start_time" 
                    type="datetime-local" 
                    class="form-input"
                    :class="{ 'form-input-error': fieldErrors.start_time }"
                    :readonly="!canEdit"
                    @blur="validateField('start_time')"
                  >
                  <div v-if="fieldErrors.start_time" class="error-message">{{ fieldErrors.start_time }}</div>
                </div>

                <div class="form-group">
                  <label class="form-label">结束时间</label>
                  <input 
                    v-model="editForm.end_time" 
                    type="datetime-local" 
                    class="form-input"
                    :class="{ 'form-input-error': fieldErrors.end_time }"
                    :readonly="!canEdit"
                    @blur="validateField('end_time')"
                  >
                  <div v-if="fieldErrors.end_time" class="error-message">{{ fieldErrors.end_time }}</div>
                </div>

                <div class="form-group">
                  <label class="form-label">活动地点</label>
                  <input 
                    v-model="editForm.location" 
                    type="text" 
                    class="form-input"
                    :class="{ 'form-input-error': fieldErrors.location }"
                    :readonly="!canEdit"
                    placeholder="请输入活动地点"
                    @blur="validateField('location')"
                  >
                  <div v-if="fieldErrors.location" class="error-message">{{ fieldErrors.location }}</div>
                </div>

                <div class="form-group">
                  <label class="form-label">最大参与人数</label>
                  <input 
                    v-model="editForm.max_participants" 
                    type="number" 
                    class="form-input"
                    :class="{ 'form-input-error': fieldErrors.max_participants }"
                    :readonly="!canEdit"
                    placeholder="0表示不限人数"
                    min="0"
                    @blur="validateField('max_participants')"
                  >
                  <div v-if="fieldErrors.max_participants" class="error-message">{{ fieldErrors.max_participants }}</div>
                </div>

                <div class="form-group full-width">
                  <label class="form-label">活动类型</label>
                  <select 
                    v-model="editForm.category" 
                    class="form-select"
                    :class="{ 'form-input-error': fieldErrors.category }"
                    :disabled="!canEdit"
                  >
                    <option value="">请选择分类</option>
                    <option value="sports"></option>
                    <option value="academic">学术调研</option>
                    <option value="arts">文化艺术</option>
                    <option value="social">社会实践</option>
                    <option value="volunteer">志愿服务</option>
                    <option value="career">就业创业</option>
                    <option value="campus">校园活动</option>
                  </select>
                  <div v-if="fieldErrors.category" class="error-message">{{ fieldErrors.category }}</div>
                </div>
              </div>

              <div class="form-actions" v-if="canEdit">
                <button 
                  type="button" 
                  class="btn-cancel"
                  @click="cancelEdit"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  class="btn-save"
                  :disabled="isSaving || !isFormValid"
                >
                  {{ isSaving ? '保存中...' : '保存修改' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 数据统计选项卡 -->
        <div v-if="activeTab === 'stats'" class="tab-content">
          <div class="stats-section">
            <h2>活动数据统计</h2>
            
            <div v-if="loading.stats" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载统计数据中...</p>
            </div>

            <div v-else class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">👁️</div>
                <div class="stat-content">
                  <div class="stat-number">{{ activityStats.views || 0 }}</div>
                  <div class="stat-label">总浏览量</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                  <div class="stat-number">{{ participants.length }}</div>
                  <div class="stat-label">报名人数</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">❤️</div>
                <div class="stat-content">
                  <div class="stat-number">{{ activityStats.favorites || 0 }}</div>
                  <div class="stat-label">收藏次数</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                  <div class="stat-number">{{ calculateConversionRate() }}%</div>
                  <div class="stat-label">转化率</div>
                </div>
              </div>
            </div>

            <div class="stats-details" v-if="activityStats">
              <h3>详细数据</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">创建时间:</span>
                  <span class="detail-value">{{ formatDateTime(activityStats.created_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">最后更新:</span>
                  <span class="detail-value">{{ formatDateTime(activityStats.updated_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">活动状态:</span>
                  <span class="detail-value">{{ getActivityStatus() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { activityAPI } from '@/services/api'

const router = useRouter()
const route = useRoute()
const activityId = route.params.id

const activeTab = ref('participants')
const isSaving = ref(false)
const canEdit = ref(true)

// 加载状态
const loading = reactive({
  details: false,
  participants: false,
  stats: false
})

// 选项卡配置
const tabs = [
  { id: 'participants', name: '报名者管理', icon: 'icon-participants' },
  { id: 'edit', name: '活动信息', icon: 'icon-edit' },
  { id: 'stats', name: '数据统计', icon: 'icon-stats' }
]

// 活动数据
const activityDetails = ref(null)
const participants = ref([])
const activityStats = ref({})

// 编辑表单
const editForm = reactive({
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  max_participants: 0,
  category: ''
})

// 字段错误信息
const fieldErrors = reactive({
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  max_participants: '',
  category: ''
})

// 表单验证规则
const validationRules = {
  title: (value) => {
    if (!value) return '活动标题不能为空'
    if (value.length < 2) return '标题至少2个字符'
    if (value.length > 50) return '标题不能超过50个字符'
    return ''
  },
  description: (value) => {
    if (!value) return '活动描述不能为空'
    if (value.length < 10) return '描述至少10个字符'
    return ''
  },
  start_time: (value) => {
    if (!value) return '开始时间不能为空'
    return ''
  },
  end_time: (value) => {
    if (!value) return '结束时间不能为空'
    return ''
  },
  location: (value) => {
    if (!value) return '活动地点不能为空'
    return ''
  },
  category: (value) => {
    if (!value) return '请选择活动分类'
    return ''
  }
}

// 表单验证
const validateField = (fieldName) => {
  const value = editForm[fieldName]
  const validator = validationRules[fieldName]
  
  if (validator) {
    fieldErrors[fieldName] = validator(value)
  }
}

const isFormValid = computed(() => {
  return !Object.values(fieldErrors).some(error => error !== '')
})

// 加载活动详情
const loadActivityDetails = async () => {
  loading.details = true
  try {
    const result = await activityAPI.getActivityDetails(activityId)
    if (result.success) {
      activityDetails.value = result.data
      // 填充编辑表单
      Object.assign(editForm, result.data)
      // 格式化日期时间
      if (result.data.start_time) {
        editForm.start_time = formatDateTimeForInput(result.data.start_time)
      }
      if (result.data.end_time) {
        editForm.end_time = formatDateTimeForInput(result.data.end_time)
      }
    } else {
      console.error('获取活动详情失败:', result.message)
      alert('获取活动详情失败')
    }
  } catch (error) {
    console.error('加载活动详情错误:', error)
    alert('加载活动详情失败，请检查网络连接')
  } finally {
    loading.details = false
  }
}

// 加载参与者列表
const loadParticipants = async () => {
  loading.participants = true
  try {
    const result = await activityAPI.getActivityParticipants(activityId)
    if (result.success) {
      participants.value = result.data
    } else {
      console.error('获取参与者列表失败:', result.message)
      alert('获取参与者列表失败')
    }
  } catch (error) {
    console.error('加载参与者列表错误:', error)
    alert('加载参与者列表失败，请检查网络连接')
  } finally {
    loading.participants = false
  }
}

// 加载活动统计
const loadActivityStats = async () => {
  loading.stats = true
  try {
    const result = await activityAPI.getActivityStats(activityId)
    if (result.success) {
      activityStats.value = result.data
    } else {
      console.error('获取活动统计失败:', result.message)
    }
  } catch (error) {
    console.error('加载活动统计错误:', error)
  } finally {
    loading.stats = false
  }
}

// 检查是否可以编辑
const checkEditable = async () => {
  try {
    const result = await activityAPI.checkActivityEditable(activityId)
    if (result.success) {
      canEdit.value = result.data.can_edit
      if (!result.data.can_edit) {
        activeTab.value = 'participants'
      }
    }
  } catch (error) {
    console.error('检查编辑权限错误:', error)
  }
}

// 保存活动修改
const saveActivity = async () => {
  if (isSaving.value || !isFormValid.value) return
  
  isSaving.value = true
  try {
    const formData = new FormData()
    Object.keys(editForm).forEach(key => {
      if (editForm[key] !== null && editForm[key] !== undefined) {
        formData.append(key, editForm[key])
      }
    })

    const result = await activityAPI.updateActivity(activityId, formData)
    if (result.success) {
      alert('活动信息更新成功！')
      // 重新加载活动详情
      await loadActivityDetails()
    } else {
      alert(`更新失败: ${result.message}`)
    }
  } catch (error) {
    console.error('保存活动信息错误:', error)
    alert('保存失败，请稍后重试')
  } finally {
    isSaving.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  // 恢复原始数据
  if (activityDetails.value) {
    Object.assign(editForm, activityDetails.value)
  }
  // 清空错误信息
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key] = ''
  })
}

// 导出参与者数据
const exportParticipants = async () => {
  try {
    const result = await activityAPI.exportParticipants(activityId)
    if (result.success) {
      // 创建下载链接
      const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `活动报名数据_${activityDetails.value?.title || activityId}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
      alert('数据导出成功！')
    } else {
      alert(`导出失败: ${result.message}`)
    }
  } catch (error) {
    console.error('导出数据错误:', error)
    alert('导出失败，请稍后重试')
  }
}

// 工具函数
const formatDate = (dateString) => {
  if (!dateString) return '日期待定'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const formatDateTimeForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

const getGradeText = (grade) => {
  const gradeMap = {
    'freshman': '大一',
    'sophomore': '大二',
    'junior': '大三',
    'senior': '大四',
    'graduate': '研究生'
  }
  return gradeMap[grade] || grade || '未填写'
}

const calculateConversionRate = () => {
  const views = activityStats.value.views || 1
  const participantsCount = participants.value.length
  return ((participantsCount / views) * 100).toFixed(1)
}

const getActivityStatus = () => {
  if (!activityDetails.value) return '未知'
  
  const now = new Date()
  const startTime = new Date(activityDetails.value.start_time)
  const endTime = new Date(activityDetails.value.end_time)
  
  if (now < startTime) return '未开始'
  if (now >= startTime && now <= endTime) return '进行中'
  return '已结束'
}

//初始化加载数据（依据点是activityID)
const loadActivityData = async () => {
  try {
    const result = await activityAPI.getActivityDetails(activityId)
    if (result.success) {
      // 处理活动数据
    } else {
      console.error('获取活动详情失败')
      router.push('/mycenter') // 失败时跳回个人中心
    }
  } catch (error) {
    console.error('加载活动数据错误:', error)
    router.push('/mycenter')
  }
}

onMounted(() => {
  // 加载所有必要数据
  loadActivityDetails()
  loadParticipants()
  loadActivityStats()
  loadActivityData()
  checkEditable()
})
</script>

<style scoped>
.activity-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff9f5 0%, #fff0e6 100%);
}

.management-header {
  background: white;
  box-shadow: 0 2px 10px rgba(255, 107, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  height: 40px;
  width: auto;
}

.app-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff6b00;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
  font-weight: 500;
}

.nav-link:hover {
  color: #ff6b00;
}

.management-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 活动概览 */
.activity-overview {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.activity-title {
  margin: 0;
  font-size: 2rem;
  color: #333;
  flex: 1;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.meta-icon {
  font-size: 1.1rem;
}

.meta-warning {
  color: #dc3545;
  font-weight: 500;
}

/* 选项卡导航 */
.tabs-navigation {
  display: flex;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: rgba(255, 107, 0, 0.05);
  color: #ff6b00;
}

.tab-btn.active {
  background: #ff6b00;
  color: white;
}

.tab-icon {
  font-size: 1.2rem;
}

/* 选项卡内容 */
.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 通用样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.section-actions {
  display: flex;
  gap: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff6b00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

/* 参与者列表 */
.participants-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
}

.participants-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr 1.5fr;
  background: #ff6b00;
  color: white;
  font-weight: 600;
}

.table-cell {
  padding: 1rem;
  text-align: left;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr 1.5fr;
  border-bottom: 1px solid #eee;
  transition: background 0.3s;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

/* 编辑表单 */
.edit-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
}

.edit-status {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  color: #856404;
}

.status-warning {
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}

.status-desc {
  margin: 0;
  font-size: 0.9rem;
}

.edit-form {
  margin-top: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-input, .form-select, .form-textarea {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #fafafa;
  font-family: inherit;
}

.form-input:read-only, .form-select:disabled, .form-textarea:read-only {
  background: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #ff6b00;
  box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.1);
  background: white;
}

.form-input-error {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

/* 按钮样式 */
.btn-primary {
  background: #ff6b00;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #e55a00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ff6b00;
  color: #ff6b00;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-outline:hover:not(:disabled) {
  background: #ff6b00;
  color: white;
}

.btn-outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-save:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-icon {
  font-size: 1.1rem;
}

/* 统计卡片 */
.stats-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.1);
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #fff5f5, #fff0e6);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(255, 107, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #ff6b00;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stats-details {
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.stats-details h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-label {
  font-weight: 500;
  color: #666;
}

.detail-value {
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .header-content {
    padding: 0 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .overview-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .activity-title {
    font-size: 1.5rem;
  }
  
  .tabs-navigation {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1 0 50%;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    display: none; /* 移动端隐藏表头，使用数据标签 */
  }
  
  .table-cell {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }
  
  .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: #666;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>