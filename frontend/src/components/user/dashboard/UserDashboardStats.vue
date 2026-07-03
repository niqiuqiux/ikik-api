<template>
  <!-- Row 1: Core Stats -->
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <!-- Balance -->
    <div v-if="!isSimple" class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-accent-100 p-2 dark:bg-accent-900/30">
          <svg class="h-5 w-5 text-accent-600 dark:text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('dashboard.balance') }}</p>
          <p class="text-xl font-bold text-accent-600 dark:text-accent-300">${{ formatBalance(totalBalance) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('common.available') }}</p>
        </div>
      </div>
    </div>

    <!-- API Keys -->
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
          <Icon name="key" size="md" class="text-primary-600 dark:text-primary-300" :stroke-width="2" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('dashboard.apiKeys') }}</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats?.total_api_keys || 0 }}</p>
          <p class="text-xs text-accent-600 dark:text-accent-300">{{ stats?.active_api_keys || 0 }} {{ t('common.active') }}</p>
        </div>
      </div>
    </div>

    <!-- Today Requests -->
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-accent-100 p-2 dark:bg-accent-900/30">
          <Icon name="chart" size="md" class="text-accent-600 dark:text-accent-300" :stroke-width="2" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('dashboard.todayRequests') }}</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats?.today_requests || 0 }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('common.total') }}: {{ formatNumber(stats?.total_requests || 0) }}</p>
        </div>
      </div>
    </div>

    <!-- Today Cost -->
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
          <Icon name="dollar" size="md" class="text-primary-600 dark:text-primary-300" :stroke-width="2" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('dashboard.todayCost') }}</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            <span class="text-primary-600 dark:text-primary-300" :title="t('dashboard.actual')">${{ formatCost(stats?.today_actual_cost || 0) }}</span>
            <span class="text-sm font-normal text-gray-400 dark:text-gray-500" :title="t('dashboard.standard')"> / ${{ formatCost(stats?.today_cost || 0) }}</span>
          </p>
          <p class="text-xs">
            <span class="text-gray-500 dark:text-gray-400">{{ t('common.total') }}: </span>
            <span class="text-primary-600 dark:text-primary-300" :title="t('dashboard.actual')">${{ formatCost(stats?.total_actual_cost || 0) }}</span>
            <span class="text-gray-400 dark:text-gray-500" :title="t('dashboard.standard')"> / ${{ formatCost(stats?.total_cost || 0) }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Today Platform Usage -->
  <div class="card overflow-hidden p-0">
    <div class="flex flex-col gap-3 border-b border-gray-200/70 px-5 py-4 dark:border-dark-700/70 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-[#f4ede3] p-2 dark:bg-[#2a231d]">
          <Icon name="grid" size="md" class="text-[#8a5a44] dark:text-[#d8b69b]" :stroke-width="2" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('dashboard.todayPlatformUsage') }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('dashboard.todayPlatformUsageHint') }}</p>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3 text-right sm:min-w-[360px]">
        <div>
          <p class="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{{ t('dashboard.requests') }}</p>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatNumber(stats?.today_requests || 0) }}</p>
        </div>
        <div>
          <p class="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{{ t('dashboard.tokens') }}</p>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatTokens(stats?.today_tokens || 0) }}</p>
        </div>
        <div>
          <p class="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{{ t('dashboard.actual') }}</p>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">${{ formatCost(stats?.today_actual_cost || 0) }}</p>
        </div>
      </div>
    </div>

    <div v-if="platformRows.length > 0" class="divide-y divide-gray-100 dark:divide-dark-700/70">
      <div
        v-for="row in platformRows"
        :key="row.platform"
        class="grid gap-3 px-5 py-4 md:grid-cols-[minmax(140px,1fr)_minmax(180px,1.3fr)_minmax(180px,1fr)] md:items-center"
      >
        <div class="flex min-w-0 items-center gap-3">
          <span :class="['h-2.5 w-2.5 shrink-0 rounded-full', platformDotClass(row.platform)]" />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">{{ platformLabel(row.platform) }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatNumber(row.requests) }} {{ t('dashboard.requests') }}</p>
          </div>
        </div>

        <div class="min-w-0">
          <div class="mb-1 flex items-center justify-between gap-3 text-xs">
            <span class="font-medium text-gray-600 dark:text-gray-300">{{ formatTokens(row.total_tokens) }}</span>
            <span class="text-gray-400 dark:text-gray-500">{{ formatPercent(platformShare(row.total_tokens)) }}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-dark-800">
            <div
              :class="['h-full rounded-full', platformAccentBarClass(row.platform)]"
              :style="{ width: `${platformBarWidth(row.total_tokens)}%` }"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-xs md:text-right">
          <div>
            <p class="text-gray-400 dark:text-gray-500">{{ t('dashboard.input') }}</p>
            <p class="font-medium text-gray-700 dark:text-gray-200">{{ formatTokens(row.input_tokens) }}</p>
          </div>
          <div>
            <p class="text-gray-400 dark:text-gray-500">{{ t('dashboard.output') }}</p>
            <p class="font-medium text-gray-700 dark:text-gray-200">{{ formatTokens(row.output_tokens) }}</p>
          </div>
          <div>
            <p class="text-gray-400 dark:text-gray-500">{{ t('dashboard.actual') }}</p>
            <p class="font-medium text-gray-700 dark:text-gray-200">${{ formatCost(row.actual_cost) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
      {{ t('dashboard.noDataAvailable') }}
    </div>
  </div>

  <!-- Row 2: Token Stats -->
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <!-- Today Tokens -->
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
          <Icon name="cube" size="md" class="text-primary-600 dark:text-primary-300" :stroke-width="2" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('dashboard.todayTokens') }}</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatTokens(stats?.today_tokens || 0) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('dashboard.input') }}: {{ formatTokens(stats?.today_input_tokens || 0) }} / {{ t('dashboard.output') }}: {{ formatTokens(stats?.today_output_tokens || 0) }}</p>
        </div>
      </div>
    </div>

    <!-- Total Tokens -->
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-gray-100 p-2 dark:bg-gray-900/30">
          <Icon name="database" size="md" class="text-gray-600 dark:text-gray-300" :stroke-width="2" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('dashboard.totalTokens') }}</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatTokens(stats?.total_tokens || 0) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('dashboard.input') }}: {{ formatTokens(stats?.total_input_tokens || 0) }} / {{ t('dashboard.output') }}: {{ formatTokens(stats?.total_output_tokens || 0) }}</p>
        </div>
      </div>
    </div>

    <!-- Performance (RPM/TPM) -->
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
          <Icon name="bolt" size="md" class="text-primary-600 dark:text-primary-300" :stroke-width="2" />
        </div>
        <div class="flex-1">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('dashboard.performance') }}</p>
          <div class="flex items-baseline gap-2">
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatTokens(stats?.rpm || 0) }}</p>
            <span class="text-xs text-gray-500 dark:text-gray-400">RPM</span>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-sm font-semibold text-primary-600 dark:text-primary-300">{{ formatTokens(stats?.tpm || 0) }}</p>
            <span class="text-xs text-gray-500 dark:text-gray-400">TPM</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Avg Response Time -->
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-accent-100 p-2 dark:bg-accent-900/30">
          <Icon name="clock" size="md" class="text-accent-600 dark:text-accent-300" :stroke-width="2" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ t('dashboard.avgResponse') }}</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatDuration(stats?.average_duration_ms || 0) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('dashboard.averageTime') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { platformAccentBarClass, platformLabel } from '@/utils/platformColors'
import type { UserDashboardPlatformUsage, UserDashboardStats as UserStatsType } from '@/api/usage'
import type { User } from '@/types'

const props = defineProps<{
  stats: UserStatsType
  user: User | null | undefined
  isSimple: boolean
}>()
const { t } = useI18n()

const totalBalance = computed(() => Number(props.user?.balance || 0))
const platformRows = computed<UserDashboardPlatformUsage[]>(() =>
  [...(props.stats?.today_platforms || [])].sort((a, b) => (b.total_tokens || 0) - (a.total_tokens || 0))
)
const platformTokenBase = computed(() => {
  const totalFromRows = platformRows.value.reduce((sum, row) => sum + (row.total_tokens || 0), 0)
  return props.stats?.today_tokens || totalFromRows || 0
})

const formatBalance = (b: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(b)

const formatNumber = (n: number) => n.toLocaleString()
const formatCost = (c: number) => c.toFixed(4)
const formatTokens = (t: number) => {
  if (t >= 1_000_000) return `${(t / 1_000_000).toFixed(1)}M`
  if (t >= 1000) return `${(t / 1000).toFixed(1)}K`
  return t.toString()
}
const formatDuration = (ms: number) => ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(0)}ms`
const formatPercent = (value: number) => `${value.toFixed(value >= 10 ? 0 : 1)}%`
const platformShare = (tokens: number) => {
  if (!platformTokenBase.value || tokens <= 0) return 0
  return Math.min(100, (tokens / platformTokenBase.value) * 100)
}
const platformBarWidth = (tokens: number) => {
  const share = platformShare(tokens)
  if (share <= 0) return 0
  return Math.max(3, share)
}
const platformDotClass = (platform: string) => {
  switch (platform) {
    case 'anthropic':
      return 'bg-orange-500'
    case 'openai':
      return 'bg-emerald-500'
    case 'antigravity':
      return 'bg-purple-500'
    case 'gemini':
      return 'bg-blue-500'
    case 'grok':
      return 'bg-slate-600 dark:bg-slate-300'
    case 'custom':
      return 'bg-stone-500'
    default:
      return 'bg-primary-500'
  }
}
</script>
