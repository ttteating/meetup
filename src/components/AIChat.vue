<template>
  <div>
    <div class="ai-chat-floating" @click="toggleOpen" v-if="!open" title="客服">
      🤖
    </div>

    <transition name="slide-up">
      <div class="ai-chat-panel" v-if="open">
        <div class="ai-chat-header">
          <div>在线客服 · 扣子AI</div>
          <button class="close-btn" @click="toggleOpen">✕</button>
        </div>

        <div class="ai-chat-body">
          <div v-if="messages.length === 0" class="empty">您好！有什么可以帮您的吗？</div>
          <div class="messages">
            <div v-for="(m, i) in messages" :key="i" :class="['msg', m.role]">
              <div class="bubble">{{ m.text }}</div>
            </div>
            <div v-if="loading" class="msg bot">
              <div class="bubble">...</div>
            </div>
          </div>
        </div>

        <form class="ai-chat-input" @submit.prevent="onSend">
          <input v-model="input" placeholder="请输入问题，回车发送" />
          <button type="submit" :disabled="sending">发送</button>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { aiAPI } from '@/services/api'

const open = ref(false)
const input = ref('')
const messages = ref([])
const sending = ref(false)
const loading = ref(false)

function toggleOpen() {
  open.value = !open.value
}

async function onSend() {
  const text = input.value && input.value.trim()
  if (!text) return
  messages.value.push({ role: 'user', text })
  input.value = ''
  sending.value = true
  loading.value = true

  try {
    // call backend AI endpoint
    const res = await aiAPI.chat(text)
    if (res && res.success) {
      const reply = (res.data && (res.data.reply || res.data.text)) || '抱歉，未收到回复'
      messages.value.push({ role: 'bot', text: reply })
    } else {
      messages.value.push({ role: 'bot', text: res && res.message ? res.message : '服务暂时不可用' })
    }
  } catch (err) {
    console.error('AI chat error', err)
    messages.value.push({ role: 'bot', text: '网络错误，请稍后重试' })
  } finally {
    sending.value = false
    loading.value = false
  }
}
</script>

<style scoped>
.ai-chat-floating {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg,#4dabf7,#ff7e5f);
  border-radius: 50%;
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:24px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,0.12);
}
.ai-chat-panel {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 320px;
  height: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
  display:flex;flex-direction:column;overflow:hidden;
}
.ai-chat-header { padding:12px 14px;background:#f6f8fb;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;font-weight:600 }
.close-btn{background:transparent;border:none;cursor:pointer;font-size:16px}
.ai-chat-body{flex:1;padding:12px;overflow:auto}
.messages{display:flex;flex-direction:column;gap:8px}
.msg{display:flex}
.msg.user{justify-content:flex-end}
.msg.bot{justify-content:flex-start}
.bubble{max-width:78%;padding:8px 12px;border-radius:12px;background:#f1f3f5}
.msg.user .bubble{background:#4dabf7;color:white}
.ai-chat-input{display:flex;padding:10px;border-top:1px solid #eee}
.ai-chat-input input{flex:1;padding:8px 10px;border:1px solid #e6e9ee;border-radius:6px;margin-right:8px}
.ai-chat-input button{padding:8px 12px;background:#4dabf7;color:#fff;border:none;border-radius:6px}
.empty{color:#6c757d;padding:8px}
.slide-up-enter-active,.slide-up-leave-active{transition:all .18s ease}
.slide-up-enter-from{transform:translateY(10px);opacity:0}
.slide-up-enter-to{transform:none;opacity:1}
.slide-up-leave-from{transform:none;opacity:1}
.slide-up-leave-to{transform:translateY(10px);opacity:0}
</style>
