<template>
  <div
      class="app-wrapper"
      @click.self="handleBlur"
      @touchstart.self="handleBlur"
  >
    <SakuraBackground
        :currentTheme="currentTheme"
        :isDark="isDark"
    />
    <div :class="{ 'focused': isFocused }" class="servers-container">
      <div class="title-container">
        <i class="el-icon-connection"></i>
        <h2>服务器状态</h2>
        <el-button
            class="back-btn"
            text
            type="primary"
            @click="router.back()"
        >
          <el-icon>
            <Back/>
          </el-icon>
          返回
        </el-button>
      </div>

      <div class="description">
        以下为当前公开可查询的服务器运行状态。
      </div>

      <div class="servers-content">
        <div v-if="loading" class="loading-state">
          <el-icon class="loading-icon">
            <Loading/>
          </el-icon>
          <span>加载中...</span>
        </div>

        <template v-else>
          <div v-if="servers.length === 0" class="no-data">
            <el-empty description="暂无服务器数据"/>
          </div>

          <div v-else class="server-list">
            <div v-for="server in servers"
                 :key="server['连接地址'] + server['连接端口'] + (server['服务器名称'] || '')"
                 class="server-card animate-in">
              <div class="server-header">
                <div class="server-name">
                  <el-tag :type="server['在线状态'] === '在线' ? 'success' : 'danger'" size="small">
                    {{ server['在线状态'] === '在线' ? '运行中' : '离线' }}
                  </el-tag>
                  {{ server['服务器名称'] }}
                </div>
                <div class="server-version">
                  <el-tag size="small" type="info">{{ server['版本'] }}</el-tag>
                </div>
              </div>

              <div class="server-info">
                <div class="info-item">
                  <i class="el-icon-connection"></i>
                  <span class="label">地址：</span>
                  <span class="value">{{ server['连接地址'] }}:{{ server['连接端口'] }}</span>
                  <el-button
                      class="copy-btn"
                      size="small"
                      text
                      @click="copyToClipboard(`${server['连接地址']}:${server['连接端口']}`)"
                  >
                    <el-icon>
                      <CopyDocument/>
                    </el-icon>
                  </el-button>
                </div>

                <div class="info-item">
                  <i class="el-icon-cpu"></i>
                  <span class="label">核心：</span>
                  <span class="value">{{ server['核心'] }}</span>
                </div>

                <div class="info-item">
                  <i class="el-icon-cpu"></i>
                  <span class="label">Rcon：</span>
                  <span class="value">
                    <el-tag size="small" :type="server['Rcon连接'] === '成功' ? 'success' : 'danger'">
                      {{ server['Rcon连接'] }}
                    </el-tag>
                  </span>
                </div>

                <div class="info-item">
                  <i class="el-icon-timer"></i>
                  <span class="label">在线人数：</span>
                  <span class="value">{{ server['在线人数'] ?? '-' }} / {{ server['最大人数'] ?? '-' }}</span>
                </div>

                <div class="info-item">
                  <i class="el-icon-timer"></i>
                  <span class="label">延迟：</span>
                  <span class="value">{{ server['延迟(ms)'] ?? '-' }} ms</span>
                </div>

                <div class="info-item">
                  <i class="el-icon-cpu"></i>
                  <span class="label">指标：</span>
                  <span class="value">
                    <el-tag
                        size="small"
                        :type="server['指标'] === '服务正常' ? 'success' : (server['指标'] === '服务降级' ? 'warning' : 'danger')"
                    >
                      {{ server['指标'] }}
                    </el-tag>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {ElMessage} from 'element-plus';
import request from '../utils/request';
import {Back, CopyDocument, Loading} from '@element-plus/icons-vue';
import SakuraBackground from './common/SakuraBackground.vue';

const router = useRouter();

const loading = ref(false);
const servers = ref([]);
const isFocused = ref(false);
const currentTheme = ref(localStorage.getItem('theme') || 'default');
const isDark = ref(document.documentElement.classList.contains('dark'));

const handleBlur = () => {
  isFocused.value = false;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('已复制到剪贴板');
  } catch (err) {
    ElMessage.error('复制失败');
  }
};

const fetchServerStatus = async () => {
  loading.value = true;
  try {
    const response = await request.get('/api/v1/getServerStatus');
    // 后端返回为 List<Map<String, Object>>，直接赋值即可
    servers.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('获取服务器状态失败：', error);
    ElMessage.error('获取服务器状态失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchServerStatus();
});
</script>

<style scoped>
.app-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background-size: 400% 400%;
  background-image: var(--theme-gradient);
  animation: warmGradient 20s ease infinite;
  font-family: 'CustomFont', sans-serif;
}

.servers-container {
  background: var(--theme-bg);
  color: var(--theme-text);
  backdrop-filter: blur(8px);
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: min(100%, 1000px);
  transform: translateY(0);
  transition: all 0.3s ease;
}

.servers-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.title-container {
  text-align: center;
  margin-bottom: 25px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.title-container h2 {
  color: var(--theme-primary);
  font-size: 28px;
  margin: 10px 0;
  flex-grow: 0;
}

.description {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  font-size: 14px;
  font-weight: 500;
}

.back-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--theme-primary);
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 15px;
  background: rgba(var(--theme-primary-rgb), 0.1);
}

.back-btn:hover {
  color: var(--theme-secondary);
  transform: translateY(-50%) translateX(-2px);
  background: rgba(var(--theme-primary-rgb), 0.15);
}

.servers-content {
  min-height: 200px;
}

.server-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 10px;
}

.server-card {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.server-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
}

.server-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.server-name {
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.info-item i {
  margin-right: 8px;
  color: var(--theme-primary);
}

.info-item .label {
  color: #666;
  margin-right: 8px;
  min-width: 80px;
}

.info-item .value {
  color: #333;
  flex: 1;
}

.copy-btn {
  padding: 2px 4px;
  margin-left: 8px;
}

.copy-btn:hover {
  color: var(--theme-primary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 10px;
}

.loading-icon {
  font-size: 24px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Dark mode styles */
.dark .servers-container {
  background: rgba(35, 35, 45, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .description {
  color: rgba(255, 255, 255, 0.9);
}

.dark .server-card {
  background: rgba(35, 35, 45, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .server-card:hover {
  background: rgba(35, 35, 45, 0.9);
}

.dark .info-item .label {
  color: rgba(255, 255, 255, 0.6);
}

.dark .info-item .value {
  color: rgba(255, 255, 255, 0.9);
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .servers-container {
    padding: 20px;
    margin: 10px;
  }

  .server-list {
    grid-template-columns: 1fr;
  }

  .title-container h2 {
    font-size: 24px;
  }

  .back-btn {
    right: 10px;
    font-size: 13px;
    padding: 4px 10px;
  }
}

/* Animation */
.animate-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

