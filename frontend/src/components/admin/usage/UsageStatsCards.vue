<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div class="card p-4 flex items-center gap-3">
      <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30 text-blue-600">
        <Icon name="document" size="md" />
      </div>
      <div>
        <p class="text-xs font-medium text-gray-500">{{ t('usage.totalRequests') }}</p>
        <p class="text-xl font-bold">{{ normalizedStats.total_requests.toLocaleString() }}</p>
        <p class="text-xs text-gray-400">{{ t('usage.inSelectedRange') }}</p>
      </div>
    </div>
    <div class="card p-4 flex items-center gap-3">
      <div class="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30 text-amber-600"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg></div>
      <div>
        <p class="text-xs font-medium text-gray-500">{{ t('usage.totalTokens') }}</p>
        <p class="text-xl font-bold">{{ formatTokens(normalizedStats.total_tokens) }}</p>
        <p class="text-xs text-gray-500">
          {{ t('usage.in') }}: {{ formatTokens(normalizedStats.total_input_tokens) }} /
          {{ t('usage.out') }}: {{ formatTokens(normalizedStats.total_output_tokens) }}
        </p>
      </div>
    </div>
    <div class="card p-4 flex items-center gap-3">
      <div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/30 text-green-600">
        <Icon name="dollar" size="md" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-gray-500">{{ t('usage.totalCost') }}</p>
        <p class="text-xl font-bold text-green-600">
          ${{ normalizedStats.total_actual_cost.toFixed(4) }}
        </p>
        <p class="text-xs text-gray-400">
          <span class="text-orange-500">{{ t('usage.accountCost') }} ${{ normalizedStats.total_account_cost.toFixed(4) }}</span>
          <span> · </span>
          <span>{{ t('usage.standardCost') }} ${{ normalizedStats.total_cost.toFixed(4) }}</span>
        </p>
      </div>
    </div>
    <div class="card p-4 flex items-center gap-3">
      <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30 text-purple-600">
        <Icon name="clock" size="md" />
      </div>
      <div><p class="text-xs font-medium text-gray-500">{{ t('usage.avgDuration') }}</p><p class="text-xl font-bold">{{ formatDuration(normalizedStats.average_duration_ms) }}</p></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AdminUsageStatsResponse } from '@/api/admin/usage'
import Icon from '@/components/icons/Icon.vue'

const props = defineProps<{ stats: AdminUsageStatsResponse | null }>()

const { t } = useI18n()

const toFiniteNumber = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizedStats = computed(() => {
  const raw = props.stats
  const totalInputTokens = toFiniteNumber(raw?.total_input_tokens)
  const totalOutputTokens = toFiniteNumber(raw?.total_output_tokens)
  const totalCacheTokens = toFiniteNumber(raw?.total_cache_tokens)
  return {
    total_requests: toFiniteNumber(raw?.total_requests),
    total_input_tokens: totalInputTokens,
    total_output_tokens: totalOutputTokens,
    total_cache_tokens: totalCacheTokens,
    total_tokens: toFiniteNumber(raw?.total_tokens) || totalInputTokens + totalOutputTokens + totalCacheTokens,
    total_cost: toFiniteNumber(raw?.total_cost),
    total_actual_cost: toFiniteNumber(raw?.total_actual_cost),
    total_account_cost: toFiniteNumber(raw?.total_account_cost),
    average_duration_ms: toFiniteNumber(raw?.average_duration_ms)
  }
})

const formatDuration = (ms: number) =>
  ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`

const formatTokens = (value: number) => {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B'
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M'
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K'
  return value.toLocaleString()
}
</script>
