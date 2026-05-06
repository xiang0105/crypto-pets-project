<script setup lang="ts">
import { computed, ref } from 'vue'
import { goodies } from '@/data/goodies'
import type { GoodieSft } from '@/data/goodies'
import { isZh } from '@/i18n'
import boboImage from '@/assets/capybaras/bobo.png'
import capySanImage from '@/assets/capybaras/capy-san.png'
import kokoImage from '@/assets/capybaras/koko.png'
import yuzuBoyImage from '@/assets/capybaras/yuzu-boy.png'
import marketMap from '@/assets/map/market.png'

const text = computed(() => ({
  previousArea: isZh.value ? '上一區商品' : 'Previous goods area',
  nextArea: isZh.value ? '下一區商品' : 'Next goods area',
  animation: isZh.value ? '動畫' : 'Animation',
  listItem: isZh.value ? '上架商品' : 'LIST ITEM FOR SALE',
  sellGoodies: isZh.value ? '出售你的道具' : 'SELL YOUR GOODIES',
  overview: isZh.value ? '我的市場總覽' : 'MY MARKETPLACE OVERVIEW',
  activeListings: isZh.value ? '上架中商品' : 'MY ACTIVE LISTINGS',
  transactions: isZh.value ? '近期交易' : 'RECENT TRANSACTIONS',
  reputation: isZh.value ? '市場評價' : 'MARKETPLACE REPUTATION',
  buy: isZh.value ? '購買' : 'Buy',
  bought: isZh.value ? '買入' : 'Bought',
  sold: isZh.value ? '售出' : 'Sold',
  coins: isZh.value ? '金幣' : 'Coins',
}))

const shelfPage = ref(0)
const shelfDirection = ref<'prev' | 'next'>('next')
const shelfSwitching = ref(false)
const removedListingIds = ref<string[]>([])
const pendingRemoval = ref<GoodieSft | null>(null)
let shelfSwitchTimer: number | undefined
const shelfPageSize = 16
const defaultStoreItemCount = 36
const marketCapybaras = [
  { id: 'capy-san-a', src: capySanImage, name: 'Capy-San', motion: 'walk-right' },
  { id: 'koko-a', src: kokoImage, name: 'Koko', motion: 'walk-left' },
  { id: 'bobo-a', src: boboImage, name: 'Bobo', motion: 'linger' },
  { id: 'yuzu-boy-a', src: yuzuBoyImage, name: 'Yuzu Boy', motion: 'walk-right' },
  { id: 'koko-b', src: kokoImage, name: 'Koko', motion: 'linger' },
  { id: 'capy-san-b', src: capySanImage, name: 'Capy-San', motion: 'walk-left' },
  { id: 'bobo-b', src: boboImage, name: 'Bobo', motion: 'walk-right' },
]
const storeGoodies = computed<GoodieSft[]>(() =>
  Array.from({ length: defaultStoreItemCount }, (_, index) => {
    const goodie = goodies[index % goodies.length] ?? goodies[0]

    if (!goodie) {
      return null
    }

    return {
      ...goodie,
      id: `${goodie.id}-store-${index + 1}`,
    }
  }).filter((goodie): goodie is GoodieSft => goodie !== null),
)
const shelfTotalPages = computed(() => Math.max(1, Math.ceil(storeGoodies.value.length / shelfPageSize)))
const hasPreviousShelfPage = computed(() => shelfPage.value > 0)
const hasNextShelfPage = computed(() => shelfPage.value < shelfTotalPages.value - 1)
const shelfSlots = computed<(GoodieSft | null)[]>(() => {
  const start = shelfPage.value * shelfPageSize
  const visibleGoodies = storeGoodies.value.slice(start, start + shelfPageSize)
  const emptySlotCount = Math.max(0, shelfPageSize - visibleGoodies.length)

  return [...visibleGoodies, ...Array.from({ length: emptySlotCount }, (): null => null)]
})
const overviewListingSlots = computed(() => {
  const listings = goodies
    .filter((goodie) => goodie.status === 'active' && !removedListingIds.value.includes(goodie.id))
    .slice(0, 40)

  return [...listings, ...Array.from({ length: Math.max(0, 40 - listings.length) }, () => null)]
})

const transactions = computed(() => [
  { action: text.value.bought, name: isZh.value ? '柿醬' : 'Jam', amount: -150 },
  { action: text.value.sold, name: isZh.value ? '柚果' : 'Yuzu', amount: 100 },
  { action: text.value.bought, name: isZh.value ? '圍巾' : 'Scarf', amount: 100 },
])

function displayName(goodie: GoodieSft) {
  return isZh.value ? goodie.name.zh : goodie.name.en
}

function shouldMarquee(name: string) {
  return isZh.value ? name.length > 5 : name.length > 9
}

function gradeLabel(grade: string) {
  return grade
}

function coinAmount(amount: number) {
  return `${amount > 0 ? '+' : ''}${amount} ${text.value.coins}`
}

function removeListingLabel() {
  return isZh.value ? '下架' : 'Remove'
}

function modalText() {
  return {
    title: isZh.value ? '確認下架商品' : 'Remove listing?',
    body: isZh.value ? '下架後此商品會從上架清單移除。' : 'This item will be removed from your active listings.',
    cancel: isZh.value ? '取消' : 'Cancel',
    confirm: isZh.value ? '確認下架' : 'Remove',
  }
}

function requestRemoveListing(goodie: GoodieSft) {
  pendingRemoval.value = goodie
}

function cancelRemoveListing() {
  pendingRemoval.value = null
}

function confirmRemoveListing() {
  if (!pendingRemoval.value) {
    return
  }

  removedListingIds.value = [...removedListingIds.value, pendingRemoval.value.id]
  pendingRemoval.value = null
}

function goShelfArea(direction: -1 | 1) {
  const nextPage = shelfPage.value + direction

  if (nextPage < 0 || nextPage >= shelfTotalPages.value) {
    return
  }

  shelfDirection.value = direction > 0 ? 'next' : 'prev'
  shelfSwitching.value = false
  shelfPage.value = nextPage

  window.clearTimeout(shelfSwitchTimer)
  window.requestAnimationFrame(() => {
    shelfSwitching.value = true
    shelfSwitchTimer = window.setTimeout(() => {
      shelfSwitching.value = false
    }, 360)
  })
}
</script>

<template>
  <div class="store-view-root">
    <section class="market-page">
    <section
      class="store-shelf"
      :class="[`switch-${shelfDirection}`, { 'is-switching': shelfSwitching }]"
      :data-page="shelfPage"
      aria-label="Goodies store shelf"
    >
      <button
        v-if="hasPreviousShelfPage"
        class="shelf-nav shelf-nav-prev"
        type="button"
        :aria-label="text.previousArea"
        @click="goShelfArea(-1)"
      >
        <FontAwesomeIcon icon="chevron-left" aria-hidden="true" />
      </button>

      <article
        v-for="(goodie, index) in shelfSlots"
        :key="goodie ? `${goodie.id}-${index}` : `empty-${index}`"
        class="goodie-card"
        :class="{ empty: !goodie }"
      >
        <template v-if="goodie">
          <header>
            <strong :class="{ marquee: shouldMarquee(displayName(goodie)) }">
              <span>{{ displayName(goodie) }}</span>
              <span aria-hidden="true">{{ displayName(goodie) }}</span>
            </strong>
            <span class="grade-corner" :class="`grade-${goodie.grade.toLowerCase()}`">
              {{ gradeLabel(goodie.grade) }}
            </span>
          </header>
          <div class="image-slot" aria-label="Product image placeholder"></div>
          <footer>
            <div class="price-line">
              <i aria-hidden="true"></i>
              <span>{{ goodie.price }}</span>
            </div>
            <button type="button">
              <i aria-hidden="true"></i>
              <span>{{ text.buy }}</span>
            </button>
          </footer>
        </template>
        <div v-else class="empty-product-slot" aria-label="Empty product slot"></div>
      </article>

      <button
        v-if="hasNextShelfPage"
        class="shelf-nav shelf-nav-next"
        type="button"
        :aria-label="text.nextArea"
        @click="goShelfArea(1)"
      >
        <FontAwesomeIcon icon="chevron-right" aria-hidden="true" />
      </button>

      <div class="shelf-page-indicator" aria-live="polite">{{ shelfPage + 1 }} / {{ shelfTotalPages }}</div>
    </section>

    <section class="market-workspace">
      <div class="stage-wrap">
        <div class="animation-slot" aria-label="Marketplace animation">
          <div class="market-town" :style="{ '--market-map': `url(${marketMap})` }" aria-hidden="true">
            <div class="crowd">
              <div
                v-for="capybara in marketCapybaras"
                :key="capybara.id"
                class="crowd-walker"
                :class="`motion-${capybara.motion}`"
              >
                <img
                  class="crowd-capy"
                  :src="capybara.src"
                  :alt="`${capybara.name} browsing the market`"
                  draggable="false"
                />
              </div>
            </div>
          </div>
        </div>

        <button class="sell-banner" type="button">
          <span class="basket" aria-hidden="true"></span>
          <span>
            <strong>{{ text.listItem }}</strong>
            <small>{{ text.sellGoodies }}</small>
          </span>
        </button>
      </div>

      <section class="overview-panel" aria-label="Marketplace overview">
        <header>
          <h2>{{ text.overview }}</h2>
        </header>

        <div class="overview-grid">
          <section class="active-panel">
            <h3>{{ text.activeListings }}</h3>
            <div class="listing-grid">
              <article
                v-for="(goodie, index) in overviewListingSlots"
                :key="goodie ? goodie.id : `overview-empty-${index}`"
                class="mini-listing"
                :class="{ empty: !goodie }"
              >
                <template v-if="goodie">
                  <header>
                    <strong :class="{ marquee: shouldMarquee(displayName(goodie)) }">
                      <span>{{ displayName(goodie) }}</span>
                      <span aria-hidden="true">{{ displayName(goodie) }}</span>
                    </strong>
                    <span class="grade-corner" :class="`grade-${goodie.grade.toLowerCase()}`">
                      {{ gradeLabel(goodie.grade) }}
                    </span>
                  </header>
                  <div class="mini-image" aria-hidden="true"></div>
                  <footer>
                    <span class="mini-price"><i aria-hidden="true"></i>{{ goodie.price }}</span>
                    <button type="button" @click="requestRemoveListing(goodie)">{{ removeListingLabel() }}</button>
                  </footer>
                </template>
              </article>
            </div>
          </section>

          <section class="activity-panel">
            <div class="transaction-list">
              <h3>{{ text.transactions }}</h3>
              <p v-for="item in transactions" :key="`${item.action}-${item.name}`">
                <strong>{{ item.action }}: {{ item.name }}</strong>
                <span :class="{ gain: item.amount > 0 }">
                  {{ coinAmount(item.amount) }}
                </span>
              </p>
            </div>

            <div class="reputation-box">
              <h3>{{ text.reputation }}</h3>
              <div class="reputation-row">
                <span class="pet-mark" aria-hidden="true"></span>
                <div class="reputation-meter" aria-label="Marketplace reputation">
                  <i></i>
                </div>
                <span class="flower-mark" aria-hidden="true"></span>
              </div>
            </div>
          </section>
        </div>
      </section>
    </section>
  </section>

    <div
      v-if="pendingRemoval"
      class="remove-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-listing-title"
      @click.self="cancelRemoveListing"
    >
      <section class="remove-modal">
        <h2 id="remove-listing-title">{{ modalText().title }}</h2>
        <p>{{ modalText().body }}</p>
        <strong>{{ displayName(pendingRemoval) }}</strong>
        <div class="remove-modal-actions">
          <button type="button" @click="cancelRemoveListing">{{ modalText().cancel }}</button>
          <button class="danger" type="button" @click="confirmRemoveListing">{{ modalText().confirm }}</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.store-view-root {
  width: 100%;
  height: 100%;
  min-width: 0;
}

.market-page {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(520px, 690px) minmax(0, 1fr);
  gap: 24px;
  width: min(1500px, 100%);
  height: 100%;
  min-width: 0;
  margin: 0 auto;
  color: #583720;
  font-family: 'Trebuchet MS', Verdana, 'Microsoft JhengHei', sans-serif;
}

.market-page::before {
  position: fixed;
  inset: 75px 0 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  background:
    linear-gradient(135deg, rgba(216, 172, 91, 0.14) 0 10px, transparent 10px 42px),
    linear-gradient(45deg, rgba(142, 212, 207, 0.12) 0 8px, transparent 8px 36px),
    linear-gradient(90deg, transparent 0 24px, rgba(214, 179, 106, 0.36) 24px 26px, transparent 26px),
    linear-gradient(270deg, transparent 0 24px, rgba(214, 179, 106, 0.36) 24px 26px, transparent 26px),
    #fff7df;
}

.store-shelf,
.market-workspace {
  position: relative;
}

.store-shelf {
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 10px;
  min-height: 0;
  padding: 22px 34px 13px;
  overflow: visible;
  background:
    linear-gradient(90deg, #6f3f22 0 8px, transparent 8px calc(100% - 8px), #6f3f22 calc(100% - 8px)),
    linear-gradient(90deg, transparent 0 calc(25% - 3px), rgba(83, 45, 24, 0.72) calc(25% - 3px) calc(25% + 3px), transparent calc(25% + 3px)),
    linear-gradient(90deg, transparent 0 calc(50% - 3px), rgba(83, 45, 24, 0.72) calc(50% - 3px) calc(50% + 3px), transparent calc(50% + 3px)),
    linear-gradient(90deg, transparent 0 calc(75% - 3px), rgba(83, 45, 24, 0.72) calc(75% - 3px) calc(75% + 3px), transparent calc(75% + 3px)),
    linear-gradient(180deg, transparent 0 calc(25% - 3px), rgba(83, 45, 24, 0.76) calc(25% - 3px) calc(25% + 3px), transparent calc(25% + 3px)),
    linear-gradient(180deg, transparent 0 calc(50% - 3px), rgba(83, 45, 24, 0.76) calc(50% - 3px) calc(50% + 3px), transparent calc(50% + 3px)),
    linear-gradient(180deg, transparent 0 calc(75% - 3px), rgba(83, 45, 24, 0.76) calc(75% - 3px) calc(75% + 3px), transparent calc(75% + 3px)),
    repeating-linear-gradient(90deg, rgba(255, 224, 150, 0.08) 0 2px, transparent 2px 26px),
    linear-gradient(#a1663a, #7f4727);
  border: 5px solid #5b311a;
  border-radius: 8px;
  box-shadow:
    inset 0 0 0 3px #bd8654,
    inset 0 0 18px rgba(61, 31, 16, 0.5),
    0 3px 0 rgba(79, 45, 23, 0.24);
}

.shelf-page-indicator {
  position: absolute;
  right: 18px;
  bottom: 12px;
  z-index: 4;
  min-width: 58px;
  padding: 4px 10px 5px;
  color: #fff7df;
  font-size: 15px;
  font-weight: 1000;
  line-height: 1;
  text-align: center;
  background: #5b311a;
  border: 3px solid #bd8654;
  border-radius: 999px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 2px 0 rgba(55, 33, 23, 0.25);
}

.shelf-nav {
  position: absolute;
  top: 26%;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 82px;
  color: #fff7df;
  cursor: pointer;
  background: linear-gradient(#b97843, #8f552e);
  border: 5px solid #6e3d23;
  border-radius: 14px;
  box-shadow:
    inset 0 0 0 3px rgba(255, 225, 166, 0.45),
    0 4px 0 rgba(55, 33, 23, 0.24);
  transform: translateY(-50%);
}

.shelf-nav svg {
  font-size: 35px;
  filter: drop-shadow(0 2px 0 rgba(74, 43, 25, 0.55));
}

.shelf-nav-prev {
  left: -33px;
}

.shelf-nav-next {
  right: -33px;
}

.goodie-card {
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto auto auto;
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  padding: 6px 8px 7px;
  overflow: hidden;
  background: linear-gradient(#fff1c8, #ffd889);
  border: 4px solid #6e3d23;
  border-radius: 10px;
  box-shadow:
    inset 0 0 0 2px #fff8de,
    0 3px 0 rgba(55, 33, 23, 0.22);
}

.goodie-card.empty {
  display: grid;
  grid-template-rows: auto 1fr auto;
  align-items: center;
  justify-items: center;
  background: rgba(255, 216, 137, 0.42);
}

.goodie-card header {
  position: static;
  display: flex;
  align-items: flex-start;
  min-height: 23px;
  padding-right: 18px;
  overflow: hidden;
  color: #4d2d1d;
  font-size: 20px;
  font-weight: 1000;
  font-stretch: expanded;
  line-height: 1.05;
  text-shadow:
    1.4px 0 #fff7df,
    -1.4px 0 #fff7df,
    0 1px #fff7df,
    0 -1px #fff7df;
}

.goodie-card header strong {
  display: block;
  min-width: 0;
  max-width: calc(100% - 2px);
  overflow: hidden;
  font-weight: 1000;
  transform: scaleX(1.08);
  transform-origin: left center;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0;
  -webkit-text-stroke: 0;
}

.goodie-card header strong span {
  display: inline-block;
}

.goodie-card header strong span + span {
  display: none;
}

.goodie-card header strong.marquee {
  text-overflow: clip;
}

.goodie-card header strong.marquee span {
  padding-right: 22px;
  animation: product-name-marquee 5.8s linear infinite;
  transform-origin: left center;
}

.goodie-card header strong.marquee span + span {
  display: inline-block;
}

.grade-corner {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: start end;
  width: 31px;
  height: 31px;
  padding: 3px 4px 0 0;
  overflow: hidden;
  color: #fff7df;
  font-size: 10px;
  font-weight: 1000;
  line-height: 1;
  text-align: right;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(76, 43, 24, 0.5);
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}

.grade-a {
  background: #d95c4e;
}

.grade-b {
  background: #4b9fc2;
}

.grade-c {
  background: #eec95d;
  color: #6d361e;
  text-shadow: 0 1px 0 rgba(255, 247, 223, 0.75);
}

.grade-d {
  background: #777;
}

.image-slot,
.empty-product-slot,
.mini-image {
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 42%),
    #767676;
  border: 3px solid #fff0c4;
  box-shadow: inset 0 0 0 2px rgba(75, 75, 75, 0.22);
}

.image-slot,
.empty-product-slot {
  width: min(76px, 72%);
  aspect-ratio: 1;
  justify-self: center;
  margin: 2px 0 6px;
  border-radius: 7px;
}

.empty-product-slot {
  width: min(82px, 78%);
  opacity: 0.58;
  border-style: dashed;
  grid-row: 2;
  align-self: center;
}

.goodie-card footer {
  display: grid;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
}

.price-line,
.goodie-card button,
.mini-listing span {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 1000;
}

.price-line {
  color: #4f3324;
  font-size: 15px;
}

.price-line i,
.goodie-card button i,
.mini-listing span i {
  width: 14px;
  height: 14px;
  background: radial-gradient(circle at 35% 30%, #ffe58c 0 21%, #e9a73c 22% 58%, #a76820 59% 100%);
  border: 1px solid #985e1f;
  border-radius: 999px;
}

.goodie-card button {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 25px;
  padding: 0 8px;
  overflow: hidden;
  color: #6a321c;
  font-size: 13px;
  font-weight: 1000;
  line-height: 1;
  cursor: pointer;
  background: linear-gradient(#ffe794, #f7b746);
  border: 3px solid #b8702b;
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  justify-self: stretch;
}

.market-workspace {
  z-index: 1;
  display: grid;
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  gap: 52px;
  min-width: 0;
  min-height: 0;
}

.stage-wrap {
  position: relative;
  min-height: 0;
  margin-left: -52px;
  width: calc(100% + 52px);
}

.animation-slot {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #d6b07e;
}

.market-town {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 190px;
  overflow: hidden;
  background: var(--market-map) center / cover no-repeat #d6b07e;
}

.crowd {
  position: absolute;
  right: 0;
  bottom: 5%;
  left: 0;
  z-index: 2;
  height: 45%;
  pointer-events: none;
}

.crowd-walker {
  --from-x: -18%;
  --mid-x: 47%;
  --to-x: 112%;
  --lane-y: 0px;
  --scale: 1;
  --face: 1;
  --walk-duration: 13s;
  position: absolute;
  bottom: var(--lane-y);
  left: var(--from-x);
  display: grid;
  place-items: end center;
  opacity: 0;
  transform-origin: center bottom;
  animation: market-walk var(--walk-duration) linear infinite;
}

.crowd-walker.motion-walk-left {
  --from-x: 112%;
  --to-x: -18%;
  --face: 1;
}

.crowd-walker.motion-linger {
  --face: 1;
  --linger-forward-face: -1;
  --linger-back-face: 1;
  opacity: 1;
  animation-name: market-linger;
  animation-timing-function: ease-in-out;
}

.crowd-walker:nth-child(1) {
  --lane-y: 12px;
  --scale: 0.86;
  --mid-x: 42%;
  --walk-duration: 15s;
  animation-delay: -1.4s;
}

.crowd-walker:nth-child(2) {
  --lane-y: 42px;
  --scale: 0.94;
  --mid-x: 48%;
  --walk-duration: 17s;
  animation-delay: -8.2s;
}

.crowd-walker:nth-child(3) {
  --from-x: 12%;
  --mid-x: 18%;
  --to-x: 23%;
  --lane-y: 18px;
  --scale: 0.82;
  --walk-duration: 5.8s;
  animation-delay: -1.1s;
}

.crowd-walker:nth-child(4) {
  --lane-y: 64px;
  --scale: 1;
  --mid-x: 54%;
  --walk-duration: 18s;
  animation-delay: -12.5s;
}

.crowd-walker:nth-child(5) {
  --from-x: 72%;
  --mid-x: 66%;
  --to-x: 60%;
  --lane-y: 28px;
  --scale: 0.88;
  --face: 1;
  --linger-forward-face: 1;
  --linger-back-face: -1;
  --walk-duration: 6.2s;
  animation-delay: -3s;
}

.crowd-walker:nth-child(6) {
  --lane-y: 78px;
  --scale: 0.9;
  --mid-x: 50%;
  --walk-duration: 16s;
  animation-delay: -5.6s;
}

.crowd-walker:nth-child(7) {
  --lane-y: 0;
  --scale: 0.78;
  --mid-x: 40%;
  --walk-duration: 13s;
  animation-delay: -10.1s;
}

.crowd-capy {
  --sprite-face: 1;
  width: clamp(78px, 11vw, 118px);
  height: auto;
  object-fit: contain;
  user-select: none;
  filter: drop-shadow(0 3px 0 rgba(64, 43, 36, 0.15));
  animation: market-waddle 760ms ease-in-out infinite alternate;
}

.crowd-walker.motion-walk-right .crowd-capy {
  --sprite-face: -1;
}

.crowd-walker:nth-child(2n) .crowd-capy {
  width: clamp(86px, 12.2vw, 128px);
  animation-delay: -0.25s;
}

.crowd-walker:nth-child(3n) .crowd-capy {
  animation-delay: -0.45s;
}

.sell-banner {
  position: absolute;
  bottom: -38px;
  right: 0;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: min(360px, 92%);
  min-height: 76px;
  padding: 6px 28px 8px;
  color: #6d361e;
  cursor: pointer;
  background: #fff2c9;
  border: 5px solid #36291f;
  border-radius: 999px;
  box-shadow:
    inset 0 0 0 4px #f0a85d,
    inset 0 0 0 7px #fff7df,
    0 4px 0 rgba(83, 52, 31, 0.25);
  transform: none;
}

.store-shelf.is-switching .goodie-card {
  animation-duration: 0.34s;
  animation-timing-function: cubic-bezier(0.2, 0.74, 0.2, 1);
  animation-fill-mode: both;
}

.store-shelf.is-switching.switch-next .goodie-card {
  animation-name: shelf-card-next;
}

.store-shelf.is-switching.switch-prev .goodie-card {
  animation-name: shelf-card-prev;
}

.store-shelf.is-switching .goodie-card:nth-of-type(2),
.store-shelf.is-switching .goodie-card:nth-of-type(6),
.store-shelf.is-switching .goodie-card:nth-of-type(10),
.store-shelf.is-switching .goodie-card:nth-of-type(14) {
  animation-delay: 0.03s;
}

.store-shelf.is-switching .goodie-card:nth-of-type(3),
.store-shelf.is-switching .goodie-card:nth-of-type(7),
.store-shelf.is-switching .goodie-card:nth-of-type(11),
.store-shelf.is-switching .goodie-card:nth-of-type(15) {
  animation-delay: 0.06s;
}

.store-shelf.is-switching .goodie-card:nth-of-type(4),
.store-shelf.is-switching .goodie-card:nth-of-type(8),
.store-shelf.is-switching .goodie-card:nth-of-type(12),
.store-shelf.is-switching .goodie-card:nth-of-type(16) {
  animation-delay: 0.09s;
}

.sell-banner strong,
.sell-banner small {
  display: block;
  color: #6d361e;
  font-weight: 1000;
  line-height: 1.05;
  text-align: left;
  text-shadow:
    1px 0 #fff7df,
    -1px 0 #fff7df,
    0 1px #fff7df,
    0 -1px #fff7df;
}

.sell-banner strong {
  font-size: 19px;
}

.sell-banner small {
  font-size: 15px;
}

.basket {
  position: relative;
  width: 54px;
  height: 42px;
  background:
    radial-gradient(circle at 23px 9px, #f8a74c 0 8px, transparent 9px),
    radial-gradient(circle at 36px 12px, #f27d48 0 8px, transparent 9px),
    linear-gradient(#f1aa58, #df743f);
  border: 4px solid #8c4b2e;
  border-radius: 12px 12px 16px 16px;
}

.basket::before {
  position: absolute;
  top: -16px;
  left: 11px;
  width: 26px;
  height: 22px;
  content: '';
  border: 4px solid #8c4b2e;
  border-bottom: 0;
  border-radius: 24px 24px 0 0;
}

.overview-panel {
  min-height: 0;
  overflow: hidden;
  background: #f9d59b;
  border: 4px solid #8b5735;
  border-radius: 8px;
}

.overview-panel > header {
  position: relative;
  min-height: 35px;
  padding: 5px 42px 4px;
  text-align: center;
  background: linear-gradient(#c88452, #b77545);
  border-bottom: 3px solid #8b5735;
}

.overview-panel h2 {
  margin: 0;
  color: #5d3223;
  font-size: 22px;
  font-weight: 1000;
  line-height: 1.05;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 9px;
  padding: 8px 12px 10px;
  height: calc(100% - 35px);
  min-height: 0;
}

.overview-panel h3 {
  margin: 0 0 5px;
  color: #6d361e;
  font-size: 16px;
  font-weight: 1000;
  line-height: 1;
  text-align: center;
}

.active-panel,
.activity-panel {
  min-width: 0;
  min-height: 0;
}

.listing-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 132px;
  gap: 5px;
  max-height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-color: #b8702b rgba(255, 238, 196, 0.72);
  scrollbar-width: thin;
}

.listing-grid::-webkit-scrollbar {
  width: 8px;
}

.listing-grid::-webkit-scrollbar-track {
  background: rgba(255, 238, 196, 0.72);
  border-radius: 999px;
}

.listing-grid::-webkit-scrollbar-thumb {
  background: #b8702b;
  border-radius: 999px;
}

.mini-listing,
.empty-listing {
  min-height: 0;
  background: linear-gradient(#fff1c8, #ffd889);
  border: 3px solid #6e3d23;
  border-radius: 8px;
  box-shadow:
    inset 0 0 0 2px #fff8de,
    0 2px 0 rgba(55, 33, 23, 0.18);
}

.mini-listing {
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto auto auto;
  min-width: 0;
  overflow: hidden;
  padding: 5px 7px 6px;
}

.mini-listing.empty {
  display: block;
  background: rgba(255, 216, 137, 0.45);
  border-color: rgba(255, 247, 223, 0.82);
}

.mini-listing header {
  position: static;
  display: flex;
  align-items: flex-start;
  min-height: 19px;
  padding-right: 18px;
  overflow: hidden;
  color: #4d2d1d;
  font-size: 14px;
  font-weight: 1000;
  font-stretch: expanded;
  line-height: 1.05;
  text-shadow:
    1px 0 #fff7df,
    -1px 0 #fff7df,
    0 1px #fff7df,
    0 -1px #fff7df;
}

.mini-listing .grade-corner {
  top: -2px;
  right: -2px;
  width: 32px;
  height: 32px;
  padding: 5px 0 0 10px;
  font-size: 9px;
  place-items: start end;
}

.mini-listing strong {
  display: block;
  min-width: 0;
  max-width: calc(100% - 2px);
  overflow: hidden;
  color: #4d2d1d;
  font-weight: 1000;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-listing strong span {
  display: inline-block;
}

.mini-listing strong span + span {
  display: none;
}

.mini-listing strong.marquee {
  text-overflow: clip;
}

.mini-listing strong.marquee span {
  padding-right: 18px;
  animation: product-name-marquee 5.8s linear infinite;
}

.mini-listing strong.marquee span + span {
  display: inline-block;
}

.mini-image {
  justify-self: center;
  width: min(48px, 68%);
  aspect-ratio: 1;
  margin: 2px 0 4px;
  border-width: 2px;
  border-radius: 5px;
}

.mini-listing footer {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3px;
  min-width: 0;
  overflow: hidden;
}

.mini-price {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;
  color: #4f3324;
  font-size: 11px;
  font-weight: 1000;
}

.mini-price i {
  width: 11px;
  height: 11px;
  flex: 0 0 auto;
  background: radial-gradient(circle at 35% 30%, #ffe58c 0 21%, #e9a73c 22% 58%, #a76820 59% 100%);
  border: 1px solid #985e1f;
  border-radius: 999px;
}

.mini-listing button {
  width: 100%;
  min-width: 0;
  height: 21px;
  color: #fff7df;
  font-size: 10px;
  font-weight: 1000;
  line-height: 1;
  cursor: pointer;
  background: linear-gradient(#d46d52, #b54a38);
  border: 2px solid #7a3f2a;
  border-radius: 7px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.activity-panel {
  display: grid;
  grid-template-rows: 7fr 3fr;
  gap: 9px;
}

.transaction-list,
.reputation-box {
  padding: 8px 10px;
  background: rgba(255, 238, 196, 0.82);
  border-radius: 7px;
}

.reputation-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.transaction-list p {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 5px;
  color: #5e3a23;
  font-size: 13px;
  font-weight: 1000;
  line-height: 1.2;
}

.transaction-list span {
  flex: 0 0 auto;
  color: #a83e3a;
}

.transaction-list span.gain {
  color: #159548;
}

.reputation-row {
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  align-items: center;
  gap: 8px;
}

.pet-mark,
.flower-mark {
  display: block;
  width: 30px;
  height: 25px;
  background: #c9793e;
  border-radius: 50% 50% 44% 44%;
}

.pet-mark {
  box-shadow:
    -7px -5px 0 -2px #c9793e,
    7px -5px 0 -2px #c9793e;
}

.flower-mark {
  width: 27px;
  height: 27px;
  background:
    radial-gradient(circle, #e07f42 0 35%, transparent 36%),
    radial-gradient(circle at 50% 0, #f4c04f 0 24%, transparent 25%),
    radial-gradient(circle at 100% 50%, #f4c04f 0 24%, transparent 25%),
    radial-gradient(circle at 50% 100%, #f4c04f 0 24%, transparent 25%),
    radial-gradient(circle at 0 50%, #f4c04f 0 24%, transparent 25%);
}

.reputation-meter {
  height: 16px;
  overflow: hidden;
  background: #6c5f55;
  border: 3px solid #5c3f2b;
  border-radius: 999px;
}

.reputation-meter i {
  display: block;
  width: 35%;
  height: 100%;
  background: linear-gradient(90deg, #ffcb64, #f08b38);
}

.remove-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(43, 27, 18, 0.45);
}

.remove-modal {
  width: min(390px, 92vw);
  padding: 18px 20px 20px;
  color: #5d3223;
  font-family: 'Trebuchet MS', Verdana, 'Microsoft JhengHei', sans-serif;
  background: #fff2c9;
  border: 5px solid #36291f;
  border-radius: 14px;
  box-shadow:
    inset 0 0 0 4px #f0a85d,
    inset 0 0 0 7px #fff7df,
    0 12px 0 rgba(83, 52, 31, 0.25);
}

.remove-modal h2 {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 1000;
  line-height: 1.1;
  text-align: center;
}

.remove-modal p {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.35;
  text-align: center;
}

.remove-modal > strong {
  display: block;
  margin-bottom: 14px;
  color: #4d2d1d;
  font-size: 19px;
  font-weight: 1000;
  text-align: center;
  text-shadow:
    1px 0 #fff7df,
    -1px 0 #fff7df,
    0 1px #fff7df,
    0 -1px #fff7df;
}

.remove-modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.remove-modal-actions button {
  min-height: 38px;
  color: #6a321c;
  font-size: 15px;
  font-weight: 1000;
  cursor: pointer;
  background: linear-gradient(#ffe794, #f7b746);
  border: 3px solid #b8702b;
  border-radius: 9px;
}

.remove-modal-actions button.danger {
  color: #fff7df;
  background: linear-gradient(#d46d52, #b54a38);
  border-color: #7a3f2a;
}

@keyframes product-name-marquee {
  0%,
  18% {
    transform: translateX(0);
  }

  82%,
  100% {
    transform: translateX(-50%);
  }
}

@keyframes shelf-card-next {
  from {
    opacity: 0;
    transform: translateX(28px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes shelf-card-prev {
  from {
    opacity: 0;
    transform: translateX(-28px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes market-walk {
  0% {
    left: var(--from-x);
    opacity: 0;
    transform: translateY(0) scale(var(--scale));
  }

  8%,
  92% {
    opacity: 1;
  }

  45% {
    left: var(--mid-x);
    transform: translateY(-6px) scale(var(--scale));
  }

  100% {
    left: var(--to-x);
    opacity: 0;
    transform: translateY(2px) scale(var(--scale));
  }
}

@keyframes market-linger {
  0% {
    left: var(--from-x);
    transform: translateY(0) scale(var(--scale)) scaleX(var(--linger-forward-face));
  }

  38% {
    left: var(--to-x);
    transform: translateY(-5px) scale(var(--scale)) scaleX(var(--linger-forward-face));
  }

  39% {
    left: var(--to-x);
    transform: translateY(-5px) scale(var(--scale)) scaleX(var(--linger-back-face));
  }

  70% {
    left: var(--mid-x);
    transform: translateY(1px) scale(var(--scale)) scaleX(var(--linger-back-face));
  }

  100% {
    left: var(--from-x);
    transform: translateY(0) scale(var(--scale)) scaleX(var(--linger-back-face));
  }
}

@keyframes market-waddle {
  from {
    transform: scaleX(var(--sprite-face)) translateY(0) rotate(-2deg);
  }

  to {
    transform: scaleX(var(--sprite-face)) translateY(-5px) rotate(2.5deg);
  }
}

@media (min-width: 1200px) {
  .store-view-root {
    height: 100%;
    overflow: hidden;
  }

  .market-page {
    grid-template-columns: clamp(520px, 46vw, 690px) minmax(0, 1fr);
    align-items: stretch;
  }

  .store-shelf {
    min-height: 620px;
  }

  .overview-panel {
    min-height: 300px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .store-view-root {
    height: auto;
    min-height: 100%;
    overflow: visible;
  }

  .market-page {
    display: flex;
    flex-direction: column;
    grid-template-columns: 1fr;
    gap: 22px;
    width: min(760px, calc(100% - 56px));
    height: auto;
    min-height: 100%;
    overflow: visible;
  }

  .market-workspace {
    order: 1;
    display: grid;
    grid-template-rows: auto auto;
    gap: 54px;
    overflow: visible;
  }

  .store-shelf {
    order: 2;
  }

  .store-shelf {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: none;
    grid-auto-rows: minmax(132px, auto);
    min-height: 0;
    padding: 22px 34px 18px;
  }

  .goodie-card header {
    font-size: 16px;
  }

  .mini-listing header {
    font-size: 12px;
  }

  .stage-wrap {
    width: 100%;
    height: 320px;
    margin-left: 0;
  }

  .sell-banner {
    right: 18px;
  }

  .overview-panel {
    min-height: 0;
    overflow: visible;
  }

  .overview-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    height: auto;
    min-height: 0;
    align-items: start;
  }

  .listing-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: 130px;
    max-height: none;
  }

  .mini-listing.empty {
    display: none;
  }

  .active-panel,
  .activity-panel,
  .transaction-list,
  .reputation-box {
    height: auto;
    min-height: 0;
    overflow: visible;
  }

  .activity-panel {
    grid-template-rows: auto auto;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
  }

}

@media (max-width: 767px) {
  .store-view-root {
    height: auto;
    min-height: 100%;
    overflow: visible;
  }

  .market-page {
    display: flex;
    flex-direction: column;
    grid-template-columns: 1fr;
    width: 100%;
    gap: 16px;
    height: auto;
    min-height: 100%;
    padding-bottom: 76px;
    overflow: visible;
  }

  .market-workspace {
    order: 1;
    display: grid;
    grid-template-rows: auto auto;
    gap: 16px;
    overflow: visible;
  }

  .store-shelf {
    order: 2;
  }

  .store-shelf {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
    grid-auto-rows: minmax(138px, auto);
    gap: 8px;
    min-height: auto;
    padding: 16px 18px 42px;
    border-width: 4px;
  }

  .shelf-page-indicator {
    right: 50%;
    bottom: 10px;
    min-width: 52px;
    font-size: 13px;
    transform: translateX(50%);
  }

  .listing-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: 126px;
    max-height: none;
  }

  .mini-listing.empty {
    display: none;
  }

  .goodie-card header {
    min-height: 18px;
    padding-right: 15px;
    font-size: 13px;
  }

  .mini-listing header {
    font-size: 11px;
  }

  .shelf-nav {
    width: 42px;
    height: 58px;
    border-width: 4px;
  }

  .shelf-nav-prev {
    left: -18px;
  }

  .shelf-nav-next {
    right: -18px;
  }

  .goodie-card {
    min-height: 138px;
    padding: 5px 6px 6px;
    border-width: 3px;
    border-radius: 8px;
  }

  .grade-corner {
    width: 27px;
    height: 27px;
    font-size: 9px;
  }

  .image-slot,
  .empty-product-slot {
    width: min(58px, 66%);
    margin-bottom: 4px;
    border-width: 2px;
  }

  .price-line {
    font-size: 12px;
  }

  .price-line i,
  .goodie-card button i {
    width: 11px;
    height: 11px;
  }

  .goodie-card button {
    height: 22px;
    padding-inline: 5px;
    font-size: 11px;
    border-width: 2px;
  }

  .stage-wrap {
    width: 100%;
    height: auto;
    margin-left: 0;
  }

  .animation-slot {
    height: 230px;
  }

  .crowd {
    bottom: 0;
    height: 52%;
  }

  .crowd-capy {
    width: clamp(64px, 21vw, 94px);
  }

  .crowd-walker:nth-child(2n) .crowd-capy {
    width: clamp(70px, 23vw, 104px);
  }

  .sell-banner {
    position: static;
    justify-content: center;
    width: 100%;
    min-width: 0;
    min-height: 64px;
    margin-top: 10px;
    padding-inline: 14px;
    border-radius: 18px;
  }

  .sell-banner strong {
    font-size: 15px;
  }

  .sell-banner small {
    font-size: 12px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
    align-items: start;
    padding: 8px;
  }

  .overview-panel {
    overflow: visible;
  }

  .overview-panel h2 {
    font-size: 18px;
  }

  .overview-panel > header {
    padding-inline: 16px;
  }

  .activity-panel {
    grid-template-rows: auto auto;
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
    overflow: visible;
  }

  .active-panel,
  .transaction-list,
  .reputation-box {
    height: auto;
    min-height: 0;
    overflow: visible;
  }

  .transaction-list p {
    flex-wrap: wrap;
    font-size: 12px;
  }

  .remove-modal-overlay {
    padding: 16px;
  }

  .remove-modal {
    width: min(360px, 94vw);
    padding: 16px;
  }
}
</style>
