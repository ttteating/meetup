import { createApp } from 'vue'
import App from './APP.vue'
import router from './router'
import { userStore } from './stores/userstore'
import './assets/styles.css'

userStore.initUser() // 初始化用户状态

const app = createApp(App)

app.use(router)

app.mount('#app')
