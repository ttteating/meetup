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
            <div class="char-count">{{ (formData.title || '').length }}/50</div>
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
                v-model="formData.activity_time" 
                required
              >
            </div>

          <div class="form-group half-width">
            <label for="activity-end-time" class="required">结束时间</label>
            <input 
              type="datetime-local" 
              id="activity-end-time" 
              v-model="formData.end_time" 
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
            <div class="char-count">{{ (formData.description || '').length }}/500</div>
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
                  v-model="formData.benefits"
                >
                <span class="benefit-label">{{ benefit.label }}</span>
              </label>
            </div>
            <div class="benefits-description">
              <textarea 
                v-model="formData.benefits_details" 
                rows="2" 
                placeholder="请具体说明参与活动的收获，例如：可获得志愿时10小时、综测加分2分..."
                maxlength="200"
              ></textarea>
              <div class="char-count">{{ (formData.benefits?.details || '').length }}/200</div>
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
                  v-model="formData.target_audience.Activity_class" 
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
import { useRouter } from 'vue-router'
import { activityAPI } from '@/services/api'

const router = useRouter()

// 表单数据 - 根据后端ActivityBase模型调整
const formData = reactive({
  title: '',
  description: '',
  location: '华南农业大学',
  activity_time: '', // 使用 activity_time，后端会以此作为 start_time
  end_time: '',
  max_participants: 100,
  organizer: '', // 活动发起人
  tags: [], // 活动标签
  target_audience: {
    Targeted_people: [], // 年级
    Activity_class: [] // 活动类别，注意这里是数组
  },
  benefits: {
    benefit: [], // 活动收益
    details: '' // 收益详情
  },
  cover_image: '', // 本地预览用
  coverFile: null // 实际文件对象
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
  { value: '研究生', label: '研究生' },
  { value: 'all', label: '不限年级' }
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
const coverFile = ref(null)

// 处理面向人群选择
const handleAudienceChange = (value) => {
  if (value === 'all') {
    formData.target_audience.Targeted_people = ['大一', '大二', '大三', '大四', '研究生']
  } else {
    const allGrades = ['大一', '大二', '大三', '大四', '研究生']
    if (allGrades.includes(value)) {
      const index = formData.target_audience.Targeted_people.indexOf(value)
      if (index > -1) {
        formData.target_audience.Targeted_people.splice(index, 1)
      } else {
        formData.target_audience.Targeted_people.push(value)
      }
    }
  }
}

// 触发文件输入
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理封面图上传 - 现在只做本地预览
const handleCoverUpload = (event) => {
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
}

// 移除封面图
const removeCover = () => {
  // 撤销blob URL
  try {
    if (formData.cover_image && formData.cover_image.startsWith('blob:')) {
      URL.revokeObjectURL(formData.cover_image)
    }
  } catch (e) {
    // ignore
  }

  formData.cover_image = ''
  formData.cover_image_id = null
  coverFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// 重置表单
const resetForm = () => {
  if (confirm('是否重置表单？所有已填写的内容将被清空。')) {
    Object.keys(formData).forEach(key => {
      if (key === 'target_audience') {
        formData[key] = { Targeted_people: [], Activity_class: '' }
      } else if (key === 'benefits') {
        formData[key] = { benefit: [], details: '' }
      } else if (Array.isArray(formData[key])) {
        formData[key] = []
      } else {
        formData[key] = ''
      }
    })
    removeCover()
    setDefaultTime()
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

// 保存草稿
const saveDraft = () => {
  const draftData = { ...formData }
  // 移除预览URL
  if (draftData.cover_image && draftData.cover_image.startsWith('blob:')) {
    draftData.cover_image = ''
  }
  
  localStorage.setItem('activityDraft', JSON.stringify(draftData))
  alert('草稿已保存')
}

// 表单验证
const validateForm = () => {
  const errors = []
  
  if (!formData.title.trim()) {
    errors.push('活动名称不能为空')
  }
  
  if (!formData.location.trim()) {
    errors.push('活动地点不能为空')
  }
  
  if (!formData.start_time) {
    errors.push('活动开始时间不能为空')
  }
  
  if (!formData.end_time) {
    errors.push('活动结束时间不能为空')
  } else if (new Date(formData.end_time) <= new Date(formData.start_time)) {
    errors.push('结束时间必须晚于开始时间')
  }

  if (!formData.description.trim()) {
    errors.push('活动简介不能为空')
  }
  
  if (!formData.max_participants || formData.max_participants < 1) {
    errors.push('招募人数必须大于0')
  }
  
  if (formData.target_audience.Targeted_people.length === 0) {
    errors.push('请选择面向人群')
  }
  
  if (!formData.target_audience.Activity_class || formData.target_audience.Activity_class.length === 0) {
    errors.push('请选择活动分类')
  }
  
  return errors
}

// 准备表单数据用于提交
const prepareFormData = () => {
  // 根据后端ActivityBase模型构造数据
  const submitData = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    location: formData.location.trim(),
    start_time: formData.activity_time, // 使用 activity_time 作为 start_time
    end_time: formData.end_time,
    max_participants: parseInt(formData.max_participants) || 100,
    tags: formData.tags || [],
    target_audience: {
      Targeted_people: formData.target_audience.Targeted_people,
      Activity_class: formData.target_audience.Activity_class.length > 0 
        ? [formData.target_audience.Activity_class] 
        : ["校园生活"] // 提供默认值
    },
    benefits: {
      benefit: formData.benefits.benefit || []
    }
  }
  
  return submitData
}

// 提交表单
const submitForm = async () => {
  // 确保已登录
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('user_id')
  if (!token || !userId) {
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
    // 1. 先创建活动
    const activityData = prepareFormData()
    const response = await activityAPI.createActivity(activityData)
    
    if (response.success && response.data) {
      const activityId = response.data.id
      
      // 2. 如果有封面图片，上传封面
      if (coverFile.value) {
        try {
          const formData = new FormData()
          formData.append('activity_id', activityId)
          formData.append('file', coverFile.value)
          
          const coverResponse = await activityAPI.uploadCover(activityId, formData)
          if (coverResponse.success) {
            console.log('封面上传成功:', coverResponse.filename)
          } else {
            console.warn('封面上传失败:', coverResponse.message)
          }
        } catch (err) {
          console.error('封面上传失败:', err)
          // 封面上传失败不影响活动创建，只记录错误
        }
      }
      
      // 3. 清除草稿
      localStorage.removeItem('activityDraft')
      
      // 4. 跳转到活动详情页
      router.push(`/activities/${activityId}`)
      alert('活动发布成功！')
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