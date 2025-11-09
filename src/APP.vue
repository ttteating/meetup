<template>
  <!-- App 根组件：渲染路由匹配的视图 -->
  <router-view />
  <AIChat />
</template>

<script setup>
import AIChat from '@/components/AIChat.vue'
// router-view 不需要显式导入，Vue Router 会处理渲染
</script>