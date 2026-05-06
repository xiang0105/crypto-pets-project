import { computed, ref } from 'vue'

export type Locale = 'zh' | 'en'

export const locale = ref<Locale>('zh')

export const isZh = computed(() => locale.value === 'zh')

export function toggleLocale() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
}
