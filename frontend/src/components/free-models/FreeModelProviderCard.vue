<template>
  <article class="group flex min-h-[320px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--app-primary)] hover:shadow-md">
    <div class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-sm font-semibold text-[var(--app-text)]">
          {{ provider.initials }}
        </div>
          <div class="min-w-0 flex-1">
          <h2 class="truncate text-base font-semibold text-[var(--app-text)]">
            {{ provider.name }}
          </h2>
          <p class="mt-0.5 truncate font-mono text-xs text-[var(--app-text-muted)]">
            {{ provider.baseUrl }}
          </p>
        </div>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-1.5">
        <span :class="connectionBadgeClass" class="rounded-full px-2.5 py-1 text-xs font-medium">
          {{ connectionLabel }}
        </span>
        <span :class="healthBadgeClass" class="rounded-full px-2.5 py-1 text-xs font-medium">
          {{ healthLabel }}
        </span>
      </div>
    </div>

    <p class="mt-4 min-h-[48px] text-sm leading-6 text-[var(--app-text-muted)]">
      {{ provider.note }}
    </p>

    <div class="mt-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <span class="text-xs font-medium uppercase tracking-wide text-[var(--app-text-muted)]">
          {{ t('freeModels.modelIds') }}
        </span>
              <span v-if="accounts.length > 0" class="shrink-0 text-xs text-[var(--app-text-muted)]">
          {{ t('freeModels.keyCount', { count: accounts.length }) }}
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="model in provider.models"
          :key="model"
          class="max-w-full truncate rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2.5 py-1 font-mono text-[11px] text-[var(--app-text)]"
          :title="model"
        >
          {{ model }}
        </span>
      </div>
    </div>

    <div v-if="accounts.length > 0" class="mt-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2">
      <div class="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
        <Icon name="key" size="xs" />
        <span class="min-w-0 truncate">{{ connectedSummary }}</span>
      </div>
    </div>

    <div class="mt-auto flex flex-wrap items-center justify-end gap-2 pt-5">
      <button
        v-if="accounts.length > 0"
        type="button"
        class="btn btn-secondary btn-sm"
        @click="emit('status')"
      >
        <Icon name="shield" size="xs" />
        {{ t('freeModels.keyStatus') }}
      </button>
      <button type="button" class="btn btn-primary btn-sm" @click="emit('connect')">
        <Icon name="plus" size="xs" />
        {{ t('freeModels.connect') }}
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import type { FreeModelAccount, FreeModelProvider } from './types'

defineProps<{
  provider: FreeModelProvider
  accounts: FreeModelAccount[]
  connectionLabel: string
  connectionBadgeClass: string
  healthLabel: string
  healthBadgeClass: string
  connectedSummary: string
}>()

const emit = defineEmits<{
  status: []
  connect: []
}>()

const { t } = useI18n()
</script>
