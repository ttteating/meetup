<template>
  <div class="activity-create-page">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <div class="nav-container">
        <div class="logo">
          <img src="@/assets/logo.png" alt="觅活—MeetHub Logo">
          <span class="logo-text">发布活动</span>
        </div>
        <div class="nav-actions">
          <button class="nav-btn" @click="goBack">
            <i class="icon-back"></i>
            返回
          </button>
          <button class="nav-btn" @click="saveDraft">
            <i class="icon-save"></i>
            保存草稿
          </button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="form-header">
        <h1>发布新活动</h1>
        <p>填写活动信息，吸引更多参与者</p>
      </div>
      
      <form class="activity-form" @submit.prevent="submitForm">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="form-section-title">
            <i class="icon-info"></i>
            基本信息
          </div>
          
          <div class="form-group">
            <label for="activity-title" class="required">活动名称</label>
            <input 
              type="text" 
              id="activity-title" 
              v-model="formData.title" 
              required 
              placeholder="请输入活动名称"
              maxlength="50"
            >
            <div class="char-count">{{ formData.title.length }}/50</div>
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label for="activity-organizer" class="required">发布人/组织</label>
              <input 
                type="text" 
                id="activity-organizer" 
                v-model="formData.organizer" 
                required 
                placeholder="请输入发布人姓名或组织名称"
              >
            </div>

            <div class="form-group half-width">
              <label for="activity-participants" class="required">招募人数</label>
              <input 
                type="number" 
                id="activity-participants" 
                v-model="formData.max_participants" 
                min="1" 
                required 
                placeholder="请输入招募人数"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label for="activity-time" class="required">开始时间时间</label>
              <input 
                type="datetime-local" 
                id="activity-time" 
                :value="formatDateTimeForInput(formData.start_time)"
                @input="e => formData.start_time = e.target.value"
                required
              >
            </div>

          <div class="form-group half-width">
            <label for="activity-end-time" class="required">结束时间</label>
            <input 
              type="datetime-local" 
              id="activity-end-time" 
              :value="formatDateTimeForInput(formData.end_time)"
              @input="e => formData.end_time = e.target.value"
              required
            >
          </div>

            <div class="form-group half-width">
              <label for="activity-location" class="required">活动地点</label>
              <input 
                type="text" 
                id="activity-location" 
                v-model="formData.location" 
                required 
                placeholder="请输入活动地点"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="activity-description" class="required">活动简介</label>
            <textarea 
              id="activity-description" 
              v-model="formData.description" 
              required 
              rows="4" 
              placeholder="请对活动流程、内容等进行简要介绍"
              maxlength="500"
            ></textarea>
            <div class="char-count">{{ formData.description.length }}/500</div>
          </div>
        </div>

        <!-- 参与收获 -->
        <div class="form-section">
          <div class="form-section-title">
            <i class="icon-benefits"></i>
            参与收获
          </div>
          
          <div class="form-group">
            <div class="options-container">
              <label 
                v-for="benefit in benefitsOptions" 
                :key="benefit.value" 
                class="option-item"
              >
                <input 
                  type="checkbox" 
                  :value="benefit.value" 
                  v-model="formData.benefits.benefit"
                >
                <span class="benefit-label">{{ benefit.label }}</span>
              </label>
            </div>
            <div class="benefits-description">
              <textarea 
                v-model="formData.benefits.details" 
                rows="2" 
                placeholder="请具体说明参与活动的收获，例如：可获得志愿时10小时、综测加分2分..."
                maxlength="200"
              ></textarea>
              <div class="char-count">{{ (formData.benefits.details || '').length }}/200</div>
            </div>
          </div>
        </div>

        <!-- 招募信息 -->
        <div class="form-section">
          <div class="form-section-title">
            <i class="icon-recruit"></i>
            招募信息
          </div>
          
          <div class="form-group">
            <label>面向人群</label>
            <div class="options-container">
              <label 
                v-for="audience in audienceOptions" 
                :key="audience.value" 
                class="option-item"
              >
                <input 
                  type="checkbox" 
                  :value="audience.value" 
                  v-model="formData.target_audience.Targeted_people"
                >
                <span class="audience-label">{{ audience.label }}</span>
              </label>
            </div>
          </div>

        </div>

        <!-- 活动分类 -->
        <div class="form-section">
          <div class="form-section-title">
            <i class="icon-category"></i>
            活动分类
          </div>
          
          <div class="form-group">
            <div class="category-options">
              <label 
                v-for="category in categoryOptions" 
                :key="category.value" 
                class="category-option"
              >
                <input 
                  type="radio" 
                  :value="category.value" 
                  v-model="formData.category" 
                  required
                >
                <span class="category-label">{{ category.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 封面图 -->
        <div class="form-section">
          <div class="form-section-title">
            <i class="icon-cover"></i>
            活动封面
          </div>
          
          <div class="form-group">
            <div class="cover-upload">
              <div 
                class="cover-preview" 
                :class="{ 'has-image': formData.cover_image }"
                @click="triggerFileInput"
              >
                <div v-if="!formData.cover_image" class="upload-placeholder">
                  <i class="icon-upload"></i>
                  <p>点击上传封面图</p>
                  <span>建议尺寸：800×400像素</span>
                </div>
                <img v-else :src="formData.cover_image" alt="封面预览" class="cover-image">
                <input 
                  type="file" 
                  id="activity-cover" 
                  ref="fileInput"
                  accept="image/*" 
                  @change="handleCoverUpload"
                  style="display: none;"
                >
              </div>
              <div class="cover-actions" v-if="formData.cover_image">
                <button type="button" class="btn-secondary" @click="triggerFileInput">
                  重新上传
                </button>
                <button type="button" class="btn-danger" @click="removeCover">
                  移除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="resetForm">
            重置表单
          </button>
          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '发布中...' : '发布活动' }}
          </button>
        </div>

        <!--考虑要不要留-->
        <div class="form-footer">
          发布活动即表示您同意我们的<a href="#">服务条款</a>和<a href="#">隐私政策</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { userStore } from '@/stores/userstore'
import { useRouter } from 'vue-router'
import { activityAPI } from '@/services/api'

const router = useRouter()

// 格式化日期时间为 datetime-local 输入所需的格式
const formatDateTimeForInput = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// 表单数据 - 根据后端 ActivityBase 模型调整
const formData = reactive({
  title: '',
  description: '',
  location: '华南农业大学',  // 默认值
  start_time: '',  // 对应 activity_time
  end_time: '',
  max_participants: 100,  // 默认值
  tags: [],  // 活动标签
  target_audience: {
    Targeted_people: [],  // 年级
    Activity_class: []  // 活动类型
  },
  category: '',  // 活动分类（单选）
  benefits: {
    benefit: []  // 活动收益
  },
  organizer: '',  // 额外字段：组织者
  cover_image: null,  // 本地预览用
  coverFile: null  // 实际文件对象
})

// 选项数据
const benefitsOptions = ref([
  { value: '综测加分', label: '综测加分' },
  { value: '志愿时', label: '志愿时' },
  { value: '其他', label: '其他' }
])

const audienceOptions = ref([
  { value: '大一', label: '大一' },
  { value: '大二', label: '大二' },
  { value: '大三', label: '大三' },
  { value: '大四', label: '大四' },
  { value: '研究生', label: '研究生' }
])

const categoryOptions = ref([
  { value: '就业创业', label: '就业创业' },
  { value: '学术调研', label: '学术调研' },
  { value: '文体艺术', label: '文体艺术' },
  { value: '志愿服务', label: '志愿服务' },
  { value: '社会实践', label: '社会实践' },
  { value: '校园生活', label: '校园生活' }
])

// 状态
const submitting = ref(false)
const fileInput = ref(null)
const coverFile = ref(null) // 存储实际文件对象


// 处理面向人群选择
const handleAudienceChange = (value) => {
  const index = formData.target_audience.Targeted_people.indexOf(value)
  if (index === -1) {
    formData.target_audience.Targeted_people.push(value)
  } else {
    formData.target_audience.Targeted_people.splice(index, 1)
  }
}

// 触发文件输入
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理封面图上传
// 修改后的 handleCoverUpload 方法
const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  
  // 验证文件大小 (限制为5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB')
    return
  }

  // 显示本地预览
  coverFile.value = file
  const localUrl = URL.createObjectURL(file)
  formData.cover_image = localUrl

  // 同步上传到后端（立即上传）
  // 注意：不要在未创建活动时用 0 作为 activityId 直接上传到后端，
  // 这会导致后端拒绝或返回 401（如果未登录）或 400（无效 ID）。
  // 我们只在此处做本地预览并保存文件对象，真正上传封面会在 submitForm
  // 在创建活动并得到 activityId 后统一进行。
  coverFile.value = file
}

// 移除封面图
const removeCover = () => {
  // 如果已经上传到服务器，尝试删除服务端文件
  const uploadedId = formData.cover_image_id
  if (uploadedId) {
    activityAPI.deleteUpload(uploadedId).catch(err => {
      console.warn('删除服务器端文件失败:', err)
    })
  }

  // 如果是本地 blob URL，撤销引用
  try {
    if (formData.cover_image && typeof formData.cover_image === 'string' && formData.cover_image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.cover_image)
    }
  } catch (e) {
    // ignore
  }

  formData.cover_image = null
  formData.cover_image_id = null
  coverFile.value = null
  if (fileInput.value) fileInput.value.value = '' // 重置文件输入
}

// 重置表单
const resetForm = () => {
  if (confirm('是否重置表单？所有已填写的内容将被清空。')) {
    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        formData[key] = []
      } else {
        formData[key] = ''
      }
    })
    removeCover()
    setDefaultTime() // 重置默认时间
  }
}

// 设置默认时间
const setDefaultTime = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(19, 0, 0, 0)
  
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  const hours = String(tomorrow.getHours()).padStart(2, '0')
  const minutes = String(tomorrow.getMinutes()).padStart(2, '0')
  
  formData.start_time = `${year}-${month}-${day}T${hours}:${minutes}`

  // 设置默认结束时间为开始时间后2小时
  const endTime = new Date(tomorrow)
  endTime.setHours(endTime.getHours() + 2)
  
  const endYear = endTime.getFullYear()
  const endMonth = String(endTime.getMonth() + 1).padStart(2, '0')
  const endDay = String(endTime.getDate()).padStart(2, '0')
  const endHours = String(endTime.getHours()).padStart(2, '0')
  const endMinutes = String(endTime.getMinutes()).padStart(2, '0')
  
  formData.end_time = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}`
}

// 保存草稿 - 调用后端创建活动，并设置状态为 draft
const saveDraft = async () => {
  // 确保已登录
  const token = localStorage.getItem('token')
  if (!token) {
    alert('请先登录后保存草稿')
    router.push('/auth')
    return
  }
  
  // 表单验证
  const errors = validateForm()
  if (errors.length > 0) {
    alert('请完善以下信息后保存草稿：\n' + errors.join('\n'))
    return
  }

  submitting.value = true

  try {
    // 准备活动数据
    const activityData = prepareFormData()
    activityData.organizer = formData.organizer || activityData.organizer
    if (formData.benefits_details) activityData.benefits_details = formData.benefits_details

    console.log('Saving draft activity payload:', activityData)
    const response = await activityAPI.createActivity(activityData)
    
    if (response.success) {
      // 获取新创建的活动ID
      const activityId = response.data.id
      
      // 更新活动状态为 draft（不发布）
      try {
        console.debug('[activityout] 保存草稿，activityId=', activityId)
        const draftResponse = await activityAPI.unpublishActivity(activityId)
        console.debug('[activityout] unpublishActivity 返回：', draftResponse)
        
        if (!draftResponse.success) {
          console.warn('活动状态更新为草稿失败:', draftResponse.message)
          alert(`草稿保存成功，但状态设置失败：${draftResponse.message || '未知错误'}`)
        }
      } catch (statusError) {
        console.error('活动状态更新出错:', statusError)
        alert('草稿保存成功，但状态设置时出错')
      }
      
      // 如果有封面文件，则上传封面
      if (coverFile.value) {
        try {
          const coverResp = await activityAPI.uploadCover(activityId, coverFile.value)
          if (!coverResp.success) {
            console.warn('封面上传失败:', coverResp.message)
          } else if (coverResp && coverResp.data) {
            const d = coverResp.data
            const coverPath = d.url || d.path || d.filename || d.file || d.key || (d.data && (d.data.url || d.data.path)) || null
            if (coverPath) {
              const setResp = await activityAPI.setCoverImage(activityId, coverPath)
              if (!setResp.success) {
                console.warn('设置活动 cover_image 失败:', setResp.message)
              }
            } else {
              console.debug('封面上传返回但未找到路径字段，跳过 setCoverImage')
            }
          }
        } catch (err) {
          console.error('封面上传失败或设置 cover_image 时出错:', err)
        }
      }
      
      // 清除本地草稿
      localStorage.removeItem('activityDraft')
      
      // 成功提示并跳转到个人中心
      alert('草稿已保存！')
      router.push('/mycenter')
    } else {
      alert(`保存草稿失败：${response.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    alert('保存草稿失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 表单验证
const validateForm = () => {
  const errors = []
  
  if (!formData.title.trim()) {
    errors.push('活动名称不能为空')
  }
  
  if (!formData.organizer.trim()) {
    errors.push('发布人/组织不能为空')
  }
  
  if (!formData.location.trim()) {
    errors.push('活动地点不能为空')
  }
  
  if (!formData.start_time) {
    errors.push('活动时间不能为空')
  }
  
  if(!formData.end_time) {
    errors.push('结束时间不能为空')
  } else if (new Date(formData.end_time) <= new Date(formData.start_time)) {
    errors.push('结束时间必须晚于开始时间')
  }

  if (!formData.description.trim()) {
    errors.push('活动简介不能为空')
  }
  
  if (!formData.max_participants || formData.max_participants < 1) {
    errors.push('招募人数必须大于0')
  }
  
  if (!formData.target_audience || !Array.isArray(formData.target_audience.Targeted_people) || formData.target_audience.Targeted_people.length === 0) {
    errors.push('请选择面向人群')
  }
  
  if (!formData.category) {
    errors.push('请选择活动分类')
  }
  
  return errors
}

// 准备表单数据用于提交
const prepareFormData = () => {
  // 根据后端 ActivityBase 模型构造数据
  const toIso = (val) => {
    if (!val) return null
    try {
      // If it's already an ISO-like string that ends with Z or includes seconds, Date will handle it.
      const d = new Date(val)
      if (isNaN(d.getTime())) return null
      return d.toISOString()
    } catch (e) {
      return null
    }
  }

  const submitData = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    location: formData.location.trim(),
    cover_image: formData.cover_image || '',
    start_time: toIso(formData.start_time),
    end_time: toIso(formData.end_time),
    max_participants: parseInt(formData.max_participants) || 100,
    tags: formData.tags || [],
    target_audience: {
      Targeted_people: formData.target_audience.Targeted_people,
      Activity_class: formData.category ? [formData.category] : ['校园生活']
    },
    benefits: {
      benefit: formData.benefits.benefit || []
    }
  }
  
  return submitData
}

const submitForm = async () => {
  // 确保已登录
  const token = localStorage.getItem('token')
  if (!token) {
    alert('请先登录后发布活动')
    router.push('/auth')
    return
  }
  
  // 表单验证
  const errors = validateForm()
  if (errors.length > 0) {
    alert('请完善以下信息：\n' + errors.join('\n'))
    return
  }

  submitting.value = true

  try {
    // 先创建活动（使用 JSON 格式）
    const activityData = prepareFormData()
    // 补充额外字段（如果有）
    activityData.organizer = formData.organizer || activityData.organizer
    if (formData.benefits_details) activityData.benefits_details = formData.benefits_details

    console.log('Posting activity payload:', activityData)
    const response = await activityAPI.createActivity(activityData)
    
    if (response.success) {
      // 获取新创建的活动ID
      const activityId = response.data.id
      
      // 发布活动（更新状态为 published）
      try {
        console.debug('[activityout] 发布活动，activityId=', activityId)
        const publishResponse = await activityAPI.publishActivity(activityId)
        console.debug('[activityout] publishActivity 返回：', publishResponse)
        
        if (!publishResponse.success) {
          console.warn('活动状态更新失败:', publishResponse.message)
          alert(`活动创建成功，但发布状态更新失败：${publishResponse.message || '未知错误'}`)
        }
      } catch (statusError) {
        console.error('活动状态更新出错:', statusError)
        alert('活动创建成功，但发布状态更新时出错，请稍后手动发布')
      }
      
      // 如果有封面文件，则上传封面
      if (coverFile.value) {
        try {
          const coverResp = await activityAPI.uploadCover(activityId, coverFile.value)
          if (!coverResp.success) {
            console.warn('封面上传失败:', coverResp.message)
          } else if (coverResp && coverResp.data) {
            const d = coverResp.data
            const coverPath = d.url || d.path || d.filename || d.file || d.key || (d.data && (d.data.url || d.data.path)) || null
            if (coverPath) {
              const setResp = await activityAPI.setCoverImage(activityId, coverPath)
              if (!setResp.success) {
                console.warn('设置活动 cover_image 失败:', setResp.message)
              }
            } else {
              console.debug('封面上传返回但未找到路径字段，跳过 setCoverImage')
            }
          }
        } catch (err) {
          console.error('封面上传失败或设置 cover_image 时出错:', err)
        }
      }
      
      // 清除草稿
      localStorage.removeItem('activityDraft')
      
      // 跳出成功提示并跳转到活动详情页
      alert('发布成功！')
      router.push(`/activity/${activityId}`)
    } else {
      alert(`发布失败：${response.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 返回上一页
const goBack = () => {
  if (confirm('确定要离开吗？未保存的内容将会丢失。')) {
    router.back()
  }
}

// 组件挂载时检查是否有草稿
onMounted(() => {
  const draft = localStorage.getItem('activityDraft')
  if (draft) {
    if (confirm('检测到未保存的草稿，是否加载？')) {
      const draftData = JSON.parse(draft)
      Object.assign(formData, draftData)
    } else {
      localStorage.removeItem('activityDraft')
    }
  }
  
  // 设置默认时间
  setDefaultTime()
})
</script>

<style scoped>
.activity-create-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 40px;
}

/* 导航栏样式 */
.nav-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
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
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f8f9fa;
  border-color: #ced4da;
}

/* 图标样式 */
.icon-back::before { content: "←"; }
.icon-save::before { content: "💾"; }
.icon-info::before { content: "📝"; }
.icon-benefits::before { content: "🎁"; }
.icon-recruit::before { content: "👥"; }
.icon-category::before { content: "🏷️"; }
.icon-cover::before { content: "🖼️"; }
.icon-upload::before { content: "📤"; font-size: 32px; }

/* 容器样式 */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 8px;
}

.form-header p {
  color: #6c757d;
  font-size: 16px;
}

/* 表单区块样式 */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e9ecef;
}

.form-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 表单组样式 */
.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-row {
  display: flex;
  gap: 16px;
}

.half-width {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.required::after {
  content: "*";
  color: #ff4757;
  margin-left: 4px;
}

input, textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  background: white;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

/* 选项容器样式 */
.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.option-item input {
  width: auto;
  margin-right: 8px;
}

.benefit-label, .audience-label {
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
  transition: all 0.2s;
}

.option-item input:checked + .benefit-label,
.option-item input:checked + .audience-label {
  background: #e7f5ff;
  border-color: #4dabf7;
  color: #1971c2;
}

.benefits-description {
  margin-top: 16px;
}

/* 分类选项样式 */
.category-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.category-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.category-option input {
  width: auto;
  margin-right: 8px;
}

.category-label {
  padding: 10px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  transition: all 0.2s;
  flex: 1;
  text-align: center;
}

.category-option input:checked + .category-label {
  background: #e7f5ff;
  border-color: #4dabf7;
  color: #1971c2;
  font-weight: 500;
}

/* 封面图上传样式 */
.cover-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover-preview {
  width: 100%;
  max-width: 400px;
  height: 200px;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  background: #f8f9fa;
}

.cover-preview:hover {
  border-color: #4dabf7;
  background: #f1f3f5;
}

.cover-preview.has-image {
  border-style: solid;
  border-color: #e1e5e9;
}

.upload-placeholder {
  text-align: center;
  color: #6c757d;
}

.upload-placeholder p {
  margin: 8px 0 4px;
  font-weight: 500;
}

.upload-placeholder span {
  font-size: 14px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 32px 0;
}

.submit-btn, .btn-secondary, .btn-danger {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn {
  background: #ff7e5f;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #ff6b4a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 126, 95, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e1e5e9;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-danger {
  background: #fff5f5;
  color: #e03131;
  border: 1px solid #ffa8a8;
}

.btn-danger:hover {
  background: #ffe3e3;
}

.form-footer {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  margin-top: 24px;
}

.form-footer a {
  color: #4dabf7;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .category-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .nav-container {
    padding: 12px 16px;
  }
  
  .form-section {
    padding: 20px 16px;
  }
}
</style>