<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { isZh, locale, toggleLocale } from './i18n'
import readmeContent from '../README.md?raw'

const menuItems = computed(() => [
  { label: isZh.value ? '首頁' : 'Home', to: '/' },
  { label: isZh.value ? '寵物' : 'Pet', to: '/pet' },
  { label: isZh.value ? '商店' : 'Store', to: '/store' },
])

const actionItems = [
  { label: '說明', icon: 'circle-question' },
  { label: '錢包', icon: 'wallet' },
  { label: '顏色對調', icon: 'circle-half-stroke' },
]

const isMonoMode = ref(false)
const isHelpPanelOpen = ref(false)
const walletAddress = ref('')
const walletError = ref('')
const route = useRoute()
const router = useRouter()
const slideDirection = ref<'left' | 'right'>('left')
const pageOrder = ['/', '/pet', '/store']

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

const renderedReadme = computed(() => markdown.render(readmeContent))

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}

const visibleActionItems = computed(() => actionItems)

const shortWalletAddress = computed(() => {
  if (!walletAddress.value) {
    return ''
  }

  return `${walletAddress.value.slice(0, 6)}...${walletAddress.value.slice(-4)}`
})

const currentPageIndex = computed(() => {
  const index = pageOrder.indexOf(route.path)
  return index === -1 ? 0 : index
})

function goRelativePage(direction: -1 | 1) {
  const nextIndex = (currentPageIndex.value + direction + pageOrder.length) % pageOrder.length
  const nextPath = pageOrder[nextIndex] ?? '/'
  slideDirection.value = direction > 0 ? 'left' : 'right'
  router.push(nextPath)
}

function toggleMonoMode() {
  isMonoMode.value = !isMonoMode.value
}

function handleAction(icon: string) {
  if (icon === 'circle-half-stroke') {
    toggleMonoMode()
  }

  if (icon === 'wallet') {
    connectMetaMask()
  }

  if (icon === 'circle-question') {
    isHelpPanelOpen.value = true
  }

}

async function connectMetaMask() {
  walletError.value = ''

  if (!window.ethereum) {
    walletError.value = 'MetaMask is not installed'
    window.alert(isZh.value ? '找不到 MetaMask，請先安裝錢包。' : 'MetaMask is not installed.')
    return
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

    if (Array.isArray(accounts) && typeof accounts[0] === 'string') {
      walletAddress.value = accounts[0]
    }
  } catch (error) {
    walletError.value = error instanceof Error ? error.message : 'Wallet connection failed'
  }
}
</script>

<template>
  <header class="game-header" :class="{ 'is-mono-mode': isMonoMode }">
    <div class="nav-shell">
      <nav class="main-nav" aria-label="Primary navigation">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          class="nav-tab"
          :to="item.to"
          @click.prevent
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <RouterLink class="brand-log" to="/" aria-label="Capy's Big Adventure Log">
        <img src="@/assets/logo.png" alt="Capy's Big Adventure Log" />
      </RouterLink>

      <div class="quick-actions" aria-label="Quick actions">
        <button
          v-for="item in visibleActionItems"
          :key="item.label"
          class="action-button"
          :class="{
            active:
              (item.icon === 'circle-half-stroke' && isMonoMode) ||
              (item.icon === 'wallet' && walletAddress),
          }"
          type="button"
          :aria-label="item.icon === 'wallet' && walletAddress ? shortWalletAddress : item.label"
          :title="item.icon === 'wallet' && walletAddress ? shortWalletAddress : walletError || item.label"
          @click="handleAction(item.icon)"
        >
          <FontAwesomeIcon :icon="item.icon" aria-hidden="true" />
        </button>
        <button
          class="action-button locale-button"
          type="button"
          :aria-label="isZh ? '切換英文' : 'Switch to Chinese'"
          @click="toggleLocale"
        >
          {{ locale === 'zh' ? 'EN' : '中' }}
        </button>
      </div>
    </div>
  </header>

  <main class="page-content" :class="{ 'is-mono-mode': isMonoMode }">
    <button
      class="page-arrow page-arrow-left"
      type="button"
      :aria-label="isZh ? '上一頁' : 'Previous page'"
      @click="goRelativePage(-1)"
    >
      <FontAwesomeIcon icon="chevron-left" aria-hidden="true" />
    </button>

    <RouterView v-slot="{ Component, route: routedPage }">
      <Transition :name="slideDirection === 'left' ? 'slide-left' : 'slide-right'" mode="out-in">
        <component :is="Component" :key="routedPage.path" />
      </Transition>
    </RouterView>

    <button
      class="page-arrow page-arrow-right"
      type="button"
      :aria-label="isZh ? '下一頁' : 'Next page'"
      @click="goRelativePage(1)"
    >
      <FontAwesomeIcon icon="chevron-right" aria-hidden="true" />
    </button>
  </main>

  <div
    v-if="isHelpPanelOpen"
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="help-panel-title"
    @click.self="isHelpPanelOpen = false"
  >
    <section class="help-panel">
      <header>
        <h2 id="help-panel-title">{{ isZh ? '說明' : 'Help' }}</h2>
        <button type="button" aria-label="Close help" @click="isHelpPanelOpen = false">
          <FontAwesomeIcon icon="xmark" aria-hidden="true" />
        </button>
      </header>
      <div class="markdown-body" v-html="renderedReadme"></div>
    </section>
  </div>
</template>

<style scoped>
.game-header {
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  height: 75px;
  border-bottom: 6px solid #3f777e;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0 3px, transparent 3px 135px),
    linear-gradient(#8de0db, #66c2c2);
  box-shadow:
    inset 0 -3px 0 #caefe5,
    0 3px 0 rgba(41, 96, 106, 0.25);
}

.nav-shell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 12px;
}

.main-nav,
.quick-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
}

.main-nav {
  flex: 0 1 clamp(330px, 29vw, 430px);
  align-items: center;
  gap: 2px;
}

.quick-actions {
  flex: 0 1 clamp(330px, 29vw, 430px);
  justify-content: flex-end;
  gap: 8px;
}

.nav-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 108px;
  height: 49px;
  padding: 0 18px;
  color: #2f7180;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
  text-shadow: none;
  background: transparent;
  border: 4px solid transparent;
  border-bottom: 0;
  border-radius: 18px 18px 0 0;
  transition:
    transform 0.15s ease,
    filter 0.15s ease,
    background-color 0.15s ease;
}

.nav-tab:hover {
  color: #194f5f;
  background: rgba(255, 255, 255, 0.2);
}

.nav-tab.router-link-exact-active {
  z-index: 2;
  min-width: 154px;
  height: 62px;
  margin-bottom: -18px;
  color: #d9792f;
  background: #fff7df;
  border-color: #3f777e;
  border-bottom: 0;
  border-radius: 20px 20px 0 0;
  box-shadow: none;
  text-shadow: none;
}

.nav-tab.router-link-exact-active::after {
  position: absolute;
  right: 0;
  bottom: -6px;
  left: 0;
  height: 8px;
  content: '';
  background: #fff7df;
}

.brand-log {
  position: absolute;
  bottom: -50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(660px, 52vw);
  height: 108px;
  padding: 0;
  text-decoration: none;
  transform: translateX(-50%);
}

.brand-log:hover {
  background: transparent;
}

.brand-log img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 3px 0 rgba(76, 88, 77, 0.35));
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  color: #2f7180;
  font-family: 'Trebuchet MS', Verdana, 'Microsoft JhengHei', sans-serif;
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  background: #fff7df;
  border: 5px solid #3b7b89;
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    0 2px 0 rgba(39, 94, 107, 0.35);
}

.action-button svg {
  filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.45));
}

.action-button.active {
  color: #fff7df;
  background: #2f7180;
}

.locale-button {
  width: 56px;
  font-size: 17px;
}

.is-mono-mode {
  filter: grayscale(1) invert(1);
}

.page-content {
  position: relative;
  height: calc(100vh - 75px);
  overflow: hidden;
  padding: 28px 18px 18px;
  background:
    radial-gradient(circle at 11% 19%, rgba(242, 166, 76, 0.24) 0 18px, transparent 19px),
    radial-gradient(circle at 89% 18%, rgba(242, 166, 76, 0.24) 0 18px, transparent 19px),
    radial-gradient(circle at 8% 68%, rgba(126, 201, 226, 0.22) 0 20px, transparent 21px),
    radial-gradient(circle at 92% 70%, rgba(241, 167, 188, 0.22) 0 21px, transparent 22px),
    linear-gradient(135deg, rgba(216, 172, 91, 0.16) 0 10px, transparent 10px 42px),
    linear-gradient(45deg, rgba(142, 212, 207, 0.14) 0 8px, transparent 8px 36px),
    linear-gradient(90deg, transparent 0 24px, rgba(214, 179, 106, 0.4) 24px 26px, transparent 26px),
    linear-gradient(270deg, transparent 0 24px, rgba(214, 179, 106, 0.4) 24px 26px, transparent 26px),
    #fff7df;
  border-right: 8px solid #8ed4cf;
  border-left: 8px solid #8ed4cf;
}

.page-arrow {
  position: absolute;
  top: 50%;
  z-index: 8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 72px;
  color: #fff7df;
  cursor: pointer;
  background: rgba(63, 119, 126, 0.88);
  border: 4px solid #fff7df;
  border-radius: 18px;
  box-shadow: 0 4px 0 rgba(45, 79, 81, 0.28);
  transform: translateY(-50%);
}

.page-arrow:hover {
  background: #d9792f;
}

.page-arrow-left {
  left: 52px;
}

.page-arrow-right {
  right: 52px;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.34s ease,
    opacity 0.34s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(42px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-42px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-42px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(42px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 35;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(29, 61, 65, 0.55);
  backdrop-filter: blur(4px);
}

.help-panel {
  width: min(820px, 92vw);
  max-height: min(720px, 86vh);
  overflow: hidden;
  color: #513924;
  background: #fff7df;
  border: 6px solid #3b7b89;
  border-radius: 16px;
  box-shadow: 0 18px 0 rgba(45, 79, 81, 0.28);
}

.help-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: #72c5b4;
  border-bottom: 4px solid #3b7b89;
}

.help-panel h2 {
  margin: 0;
  color: #fff7df;
  font-size: 24px;
  font-weight: 900;
}

.help-panel header button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #fff7df;
  cursor: pointer;
  background: #d95c4e;
  border: 4px solid #3b7b89;
  border-radius: 11px;
}

.markdown-body {
  max-height: calc(min(720px, 86vh) - 70px);
  padding: 18px 22px 24px;
  margin: 0;
  overflow: auto;
  font-family: 'Microsoft JhengHei', 'Trebuchet MS', sans-serif;
  font-size: 14px;
  line-height: 1.55;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  color: #6f4228;
  font-weight: 900;
  line-height: 1.2;
}

.markdown-body :deep(h1) {
  margin: 0 0 16px;
  font-size: 28px;
}

.markdown-body :deep(h2) {
  margin: 22px 0 10px;
  font-size: 22px;
}

.markdown-body :deep(h3) {
  margin: 18px 0 8px;
  font-size: 18px;
}

.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 12px;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 22px;
}

.markdown-body :deep(hr) {
  height: 3px;
  margin: 20px 0;
  background: #d2a46d;
  border: 0;
  border-radius: 999px;
}

.markdown-body :deep(code) {
  padding: 2px 5px;
  background: #f8e8bd;
  border: 1px solid #d2a46d;
  border-radius: 5px;
}

.markdown-body :deep(pre) {
  padding: 12px;
  overflow: auto;
  background: #f8e8bd;
  border: 2px solid #d2a46d;
  border-radius: 8px;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background: transparent;
  border: 0;
}

@media (max-width: 900px) {
  .game-header {
    height: auto;
    min-height: 132px;
  }

  .nav-shell {
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 0;
    padding-top: 70px;
  }

  .brand-log {
    top: 2px;
    bottom: auto;
    width: min(520px, 82vw);
    height: 86px;
  }

  .main-nav {
    order: 2;
    width: calc(100% - 246px);
  }

  .nav-tab,
  .nav-tab.router-link-exact-active {
    min-width: auto;
    height: 51px;
    margin-bottom: 0;
    padding: 0 12px;
    font-size: 21px;
  }

  .nav-tab.router-link-exact-active::after {
    display: none;
  }

  .quick-actions {
    order: 3;
    margin-left: auto;
  }
}

@media (max-width: 620px) {
  .game-header {
    height: 118px;
    min-height: 118px;
  }

  .nav-shell {
    display: grid;
    grid-template-rows: 62px 48px;
    grid-template-columns: 1fr;
    align-content: start;
    padding: 4px 8px 0;
  }

  .brand-log {
    top: 2px;
    width: min(310px, 72vw);
    height: 60px;
  }

  .main-nav {
    order: 2;
    grid-row: 2;
    align-self: end;
    width: min(56vw, 230px);
    height: 48px;
    flex-wrap: nowrap;
    gap: 2px;
  }

  .quick-actions {
    grid-row: 2;
    justify-self: end;
    align-self: center;
    margin-left: 0;
    padding-bottom: 0;
    gap: 4px;
    height: 40px;
  }

  .nav-tab,
  .nav-tab.router-link-exact-active {
    min-width: 58px;
    height: 38px;
    padding: 0 7px;
    font-size: 16px;
    border-width: 3px;
    border-radius: 13px 13px 0 0;
  }

  .nav-tab.router-link-exact-active {
    min-width: 68px;
    height: 45px;
  }

  .action-button {
    width: 34px;
    height: 34px;
    border-width: 4px;
    border-radius: 10px;
    font-size: 15px;
  }

  .locale-button {
    width: 38px;
    font-size: 13px;
  }

  .page-content {
    height: calc(100dvh - 118px);
    overflow-y: auto;
    padding: 14px 10px 18px;
    -webkit-overflow-scrolling: touch;
  }

  .page-arrow {
    top: auto;
    bottom: 16px;
    width: 38px;
    height: 48px;
    border-width: 3px;
    border-radius: 14px;
    transform: none;
  }

  .page-arrow-left {
    left: 22px;
  }

  .page-arrow-right {
    right: 22px;
  }
}
</style>
