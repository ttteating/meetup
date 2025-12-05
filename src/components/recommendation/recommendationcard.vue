<template>
  <div class="recommendation-card" @click="goToDetails">
    <!-- 左侧活动封面图 -->
    <div class="card-image">
      <img 
        :src="activity.cover_image || '/placeholder-cover.jpg'"
        :alt="activity.title"
        class="cover-img"
        referrerpolicy="no-referrer"
      >
      <div class="image-overlay"></div>
    </div>

    <!-- 右侧：活动详情 -->
    <div class="card-content">
      <!-- 顶部：活动名称和介绍 -->
      <div class="content-header">
        <h3 class="activity-title">{{ activity.title }}</h3>
        <p class="activity-description">{{ truncateDescription(activity.description) }}</p>
      </div>

      <!-- 中部：活动信息 -->
      <div class="content-info">
        <!-- 招募人数 -->
        <div class="info-row">
          <span class="info-label">招募人数：</span>
          <span class="info-value">{{ activity.current_participants || 0 }}/{{ activity.max_participants }}</span>
        </div>

        <!-- 开始时间 -->
        <div class="info-row">
          <span class="info-label">开始时间：</span>
          <span class="info-value">{{ getActivityTime }}</span>
        </div>

        <!-- 参与收获 -->
        <div v-if="activity.benefits" class="info-row">
          <span class="info-label">参与收获：</span>
          <span class="info-value">{{ extractValue(activity.benefits) }}</span>
        </div>
      </div>

      <!-- 下方：标签区域（活动类型、面向人群） -->
      <div class="tags-area">
        <!-- 活动类型（从 target_audience.Activity_class 获取） -->
        <span v-if="getActivityClass" class="tag category-tag">
          {{ getActivityClass }}
        </span>

        <!-- 面向人群（从 target_audience.Targeted_people 获取） -->
        <span v-if="getTargetAudience" class="tag audience-tag">
          {{ getTargetAudience }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  activity: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

//最多显示100个字（美观）
const truncateDescription = (text) => {
  if (!text) return '暂无介绍'
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

// 获取活动时间（支持多个时间字段）
const getActivityTime = computed(() => {
  if (!props.activity) return '待定'
  
  const timeValue = props.activity.activity_time || props.activity.start_time || props.activity.begin_time
  if (!timeValue) return '待定'
  
  try {
    const date = new Date(timeValue)
    if (isNaN(date.getTime())) return '待定'
    
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hours}:${minutes}`
  } catch {
    return '待定'
  }
})

// 获取活动类型（从 target_audience.Activity_class 或 category 字段）
const getActivityClass = computed(() => {
  // 首先尝试从 target_audience.Activity_class 获取
  if (props.activity.target_audience && props.activity.target_audience.Activity_class) {
    const classArray = props.activity.target_audience.Activity_class
    if (Array.isArray(classArray) && classArray.length > 0) {
      return classArray[0]
    }
  }
  
  // 如果没有，尝试从 category 字段获取并映射
  if (props.activity.category) {
    return getCategoryLabel(props.activity.category)
  }
  
  return ''
})

// 获取面向人群（从 target_audience.Targeted_people 获取）
const getTargetAudience = computed(() => {
  if (props.activity.target_audience && props.activity.target_audience.Targeted_people) {
    const peopleArray = props.activity.target_audience.Targeted_people
    if (Array.isArray(peopleArray) && peopleArray.length > 0) {
      return peopleArray[0]
    }
  }
  
  return ''
})

// 提取值部分（处理 JSON 和键值对格式）
const extractValue = (data) => {
  if (!data) return ''
  
  //如果是字符串
  if (typeof data === 'string') {
    //尝试解析 JSON
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed[0] || ''
      } else if (typeof parsed === 'object') {
        const values = Object.values(parsed)
        //如果值本身是数组，取第一个元素
        if (Array.isArray(values[0])) {
          return values[0][0] || ''
        }
        return values[0] || ''
      }
    } catch (e) {
      //不是 JSON 格式，继续处理
    }
    
    // 处理 "key": ["value"] 或 "key": "value" 格式
    const match = data.match(/["']([^"']+)["']\s*:\s*\[?["']?([^"'\]]+)["']?\]?/)
    if (match && match[2]) {
      return match[2]
    }
    
    // 直接返回原始数据
    return data
  }
  
  // 如果是数组
  if (Array.isArray(data)) {
    return data[0] || ''
  }
  
  // 如果是对象
  if (typeof data === 'object') {
    const values = Object.values(data)
    // 如果值本身是数组，取第一个元素
    if (Array.isArray(values[0])) {
      return values[0][0] || ''
    }
    return values[0] || ''
  }
  
  return String(data)
}

// 跳转到活动详情页面
const goToDetails = () => {
  const activityId = props.activity.id
  
  //验证 ID 是否有效
  if (!activityId && activityId !== 0) {
    console.error('活动 ID 无效:', props.activity)
    alert('无法获取活动ID，请刷新重试')
    return
  }
  
  try {
    router.push({
      name: 'ActivityDetails',
      params: { id: String(activityId) }
    })
  } catch (error) {
    console.error('路由跳转失败:', error)
  }
}
</script>

<style scoped>
.recommendation-card {
  display: flex;
  gap: 50px;
  padding: 50px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  min-height: 580px;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(255, 133, 27, 0.2);
}

/* 左侧图片区域 */
.card-image {
  position: relative;
  width: 460px;
  height: 460px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recommendation-card:hover .cover-img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 133, 27, 0) 0%, rgba(0, 0, 0, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.recommendation-card:hover .image-overlay {
  opacity: 1;
}

/* 右侧内容区域 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 10px 0;
}

/* 内容头部 */
.content-header {
  margin-bottom: 20px;
}

.activity-title {
  margin: 0 0 16px 0;
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.activity-description {
  margin: 0;
  font-size: 18px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 信息行 */
.content-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 28px;
  font-size: 18px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  color: #999;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 100px;
}

.info-value {
  color: #333;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}

/* 标签区域 */
.tags-area {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: auto;
  padding-top: 20px;
  border-top: 2px solid #f5f5f5;
}

.tag {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.category-tag {
  background: linear-gradient(135deg, #FFE8D6 0%, #FFD9B3 100%);
  color: #D2691E;
  border: 1px solid rgba(210, 105, 30, 0.2);
}

.audience-tag {
  background: linear-gradient(135deg, #E8F5FF 0%, #D6ECFF 100%);
  color: #0066CC;
  border: 1px solid rgba(0, 102, 204, 0.2);
}

.benefit-tag {
  background: linear-gradient(135deg, #F0E8FF 0%, #E8D6FF 100%);
  color: #7C3AED;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .recommendation-card {
    gap: 20px;
    padding: 24px;
    min-height: 400px;
  }

  .card-image {
    width: 300px;
    height: 300px;
  }

  .activity-title {
    font-size: 24px;
  }

  .activity-description {
    font-size: 14px;
  }

  .content-info {
    font-size: 14px;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .recommendation-card {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    min-height: auto;
  }

  .card-image {
    width: 100%;
    height: 280px;
  }

  .activity-title {
    font-size: 20px;
  }

  .activity-description {
    font-size: 13px;
    -webkit-line-clamp: 2;
  }

  .content-info {
    gap: 10px;
    font-size: 13px;
  }

  .tags-area {
    gap: 8px;
  }

  .tag {
    padding: 6px 12px;
    font-size: 12px;
  }

  .info-label {
    min-width: 70px;
  }
}

@media (max-width: 480px) {
  .recommendation-card {
    gap: 12px;
    padding: 16px;
  }

  .card-image {
    height: 200px;
  }

  .activity-title {
    font-size: 18px;
  }

  .card-content {
    padding: 0;
  }

  .activity-description {
    font-size: 12px;
    -webkit-line-clamp: 2;
  }

  .content-info {
    gap: 8px;
    font-size: 12px;
  }

  .info-label {
    font-size: 12px;
  }

  .tags-area {
    gap: 6px;
  }

  .tag {
    padding: 4px 10px;
    font-size: 11px;
  }
}
</style>
