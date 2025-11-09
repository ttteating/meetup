<template>
  <div id="coze-chat-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let cozeClient = null

onMounted(() => {
  // 动态加载Coze SDK
  const script = document.createElement('script')
  script.src = 'https://your-coze-sdk-link.js' // 替换为实际的SDK链接
  script.onload = initCozeChat
  document.head.appendChild(script)
})

const initCozeChat = () => {
  if (window.CozeWebSDK) {
    cozeClient = new window.CozeWebSDK.WebChatClient({
      config: {
        bot_id: '7560716171197300771',
      },
      componentProps: {
        title: 'Coze',
      },
      auth: {
        type: 'token',
        token: 'pat_yliWGjGZHreymx4iGCaPmBkb0FcGATGYFbEEYAfq0eIyHi4qLRzMMB0a93zOgIY8',
        onRefreshToken: function () {
          // 这里应该从后端获取新的token，避免token暴露在前端
          return 'pat_yliWGjGZHreymx4iGCaPmBkb0FcGATGYFbEEYAfq0eIyHi4qLRzMMB0a93zOgIY8'
        }
      }
    })
  }
}

onUnmounted(() => {
  if (cozeClient) {
    cozeClient.destroy() // 清理资源
  }
})
</script>