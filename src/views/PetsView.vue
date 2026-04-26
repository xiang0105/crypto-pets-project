<script setup lang="ts">
import { computed } from 'vue'
import { isZh } from '@/i18n'

const text = computed(() => ({
  title: isZh.value ? '寵物' : 'Pet',
  body: isZh.value ? '寵物頁面' : 'Pet area',
}))
</script>

<template>
  <section class="tab-page">
    <h1>{{ text.title }}</h1>
    <p>{{ text.body }}</p>
  </section>
</template>

<style scoped>
.tab-page {
  color: #345f66;
  font-family: 'Trebuchet MS', Verdana, 'Microsoft JhengHei', sans-serif;
}

h1 {
  margin-bottom: 8px;
  font-size: 42px;
  font-weight: 800;
}
</style>
