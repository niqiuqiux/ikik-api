<template>
  <div class="space-y-3 md:hidden">
    <div v-if="loading" class="flex min-h-40 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <Icon name="refresh" size="lg" class="animate-spin text-[var(--app-muted)]" />
    </div>

    <div v-else-if="rows.length === 0" class="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-center">
      <Icon name="inbox" size="xl" class="mb-3 h-12 w-12 text-[var(--app-muted)]" />
      <p class="text-sm text-[var(--app-muted-strong)]">{{ emptyLabel }}</p>
    </div>

    <template v-else>
      <article
        v-for="(channel, chIdx) in rows"
        :key="`mobile-${channelCardKey(channel, chIdx)}`"
        class="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-none"
      >
        <button
          type="button"
          class="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--app-surface-muted)]"
          :aria-expanded="isChannelExpanded(channelCardKey(channel, chIdx))"
          @click="toggleChannel(channelCardKey(channel, chIdx))"
        >
          <div class="min-w-0 flex-1 space-y-2">
            <div class="min-w-0">
              <h3 class="truncate text-sm font-semibold text-[var(--app-text)]">
                {{ channel.name }}
              </h3>
              <p
                v-if="channel.description"
                class="mt-0.5 line-clamp-2 text-xs text-[var(--app-muted-strong)]"
              >
                {{ channel.description }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--app-muted-strong)]">
              <span class="rounded-full bg-[var(--app-surface-muted)] px-2 py-0.5">
                {{ channel.platforms.length }} {{ columns.platform }}
              </span>
              <span class="rounded-full bg-[var(--app-surface-muted)] px-2 py-0.5">
                {{ channelModelCount(channel) }} {{ columns.supportedModels }}
              </span>
              <span class="rounded-full bg-[var(--app-surface-muted)] px-2 py-0.5">
                {{ channelGroupCount(channel) }} {{ columns.groups }}
              </span>
            </div>
          </div>
          <Icon
            :name="isChannelExpanded(channelCardKey(channel, chIdx)) ? 'chevronUp' : 'chevronDown'"
            size="sm"
            class="mt-1 flex-shrink-0 text-[var(--app-muted)]"
          />
        </button>

        <div
          v-if="isChannelExpanded(channelCardKey(channel, chIdx))"
          class="space-y-3 border-t border-[var(--app-border)] px-4 py-3"
        >
          <section
            v-for="section in channel.platforms"
            :key="`mobile-section-${channel.name}-${section.platform}`"
            class="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3"
          >
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span
                :class="[
                  'inline-flex min-h-7 items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium',
                  platformBadgeClass(section.platform),
                ]"
              >
                <PlatformIcon :platform="section.platform as GroupPlatform" size="xs" />
                {{ section.platform }}
              </span>
              <span class="text-xs text-[var(--app-muted-strong)]">
                {{ section.supported_models.length }} {{ columns.supportedModels }}
              </span>
            </div>

            <div class="mb-3 space-y-2">
              <div
                v-if="exclusiveGroups(section).length > 0"
                class="flex flex-wrap items-center gap-1.5"
              >
                <span
                  class="inline-flex items-center gap-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400"
                  :title="t('availableChannels.exclusiveTooltip')"
                >
                  <Icon name="shield" size="xs" class="h-3 w-3" />
                  {{ t('availableChannels.exclusive') }}
                </span>
                <GroupBadge
                  v-for="g in exclusiveGroups(section)"
                  :key="`mobile-ex-${channel.name}-${section.platform}-${g.id}`"
                  :name="g.name"
                  :platform="g.platform as GroupPlatform"
                  :subscription-type="(g.subscription_type || 'standard') as SubscriptionType"
                  :rate-multiplier="g.rate_multiplier"
                  :user-rate-multiplier="userGroupRates[g.id] ?? null"
                  always-show-rate
                />
              </div>

              <div
                v-if="publicGroups(section).length > 0"
                class="flex flex-wrap items-center gap-1.5"
              >
                <span
                  class="inline-flex items-center gap-0.5 text-[10px] font-medium text-[var(--app-muted-strong)]"
                  :title="t('availableChannels.publicTooltip')"
                >
                  <Icon name="globe" size="xs" class="h-3 w-3" />
                  {{ t('availableChannels.public') }}
                </span>
                <GroupBadge
                  v-for="g in publicGroups(section)"
                  :key="`mobile-pub-${channel.name}-${section.platform}-${g.id}`"
                  :name="g.name"
                  :platform="g.platform as GroupPlatform"
                  :subscription-type="(g.subscription_type || 'standard') as SubscriptionType"
                  :rate-multiplier="g.rate_multiplier"
                  :user-rate-multiplier="userGroupRates[g.id] ?? null"
                  always-show-rate
                />
              </div>
            </div>

            <div class="grid gap-2">
              <AvailableModelDisclosure
                v-for="m in section.supported_models"
                :key="`mobile-model-${section.platform}-${m.name}`"
                :model="m"
                :groups="section.groups"
                :user-group-rates="userGroupRates"
                :pricing-key-prefix="pricingKeyPrefix"
                :no-pricing-label="noPricingLabel"
                :platform-hint="section.platform"
              />
              <span v-if="section.supported_models.length === 0" class="text-xs text-[var(--app-muted)]">
                {{ noModelsLabel }}
              </span>
            </div>
          </section>
        </div>
      </article>
    </template>
  </div>

  <div class="hidden md:grid md:gap-3">
    <div
      v-if="loading"
      class="flex min-h-40 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]"
    >
      <Icon name="refresh" size="lg" class="animate-spin text-[var(--app-muted)]" />
    </div>

    <div
      v-else-if="rows.length === 0"
      class="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 text-center"
    >
      <Icon name="inbox" size="xl" class="mb-3 h-12 w-12 text-[var(--app-muted)]" />
      <p class="text-sm text-[var(--app-muted)]">{{ emptyLabel }}</p>
    </div>

    <article
      v-else
      v-for="(channel, chIdx) in rows"
      :key="`desktop-${channel.name}-${chIdx}`"
      class="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-none"
    >
      <div class="flex flex-wrap items-start justify-between gap-4 px-4 py-4">
        <div class="min-w-0">
          <h3 class="truncate text-base font-semibold text-[var(--app-text)]">
            {{ channel.name }}
          </h3>
          <p
            v-if="channel.description"
            class="mt-1 max-w-2xl text-sm leading-6 text-[var(--app-muted-strong)]"
          >
            {{ channel.description }}
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-2 text-xs text-[var(--app-muted-strong)]">
          <span class="rounded-full bg-[var(--app-surface-muted)] px-2.5 py-1">
            {{ channel.platforms.length }} {{ columns.platform }}
          </span>
          <span class="rounded-full bg-[var(--app-surface-muted)] px-2.5 py-1">
            {{ channelModelCount(channel) }} {{ columns.supportedModels }}
          </span>
          <span class="rounded-full bg-[var(--app-surface-muted)] px-2.5 py-1">
            {{ channelGroupCount(channel) }} {{ columns.groups }}
          </span>
        </div>
      </div>

      <div class="grid gap-0 border-t border-[var(--app-border)]">
        <section
          v-for="section in channel.platforms"
          :key="`desktop-section-${channel.name}-${section.platform}`"
          class="grid gap-4 border-b border-[var(--app-border)] px-4 py-4 last:border-b-0 lg:grid-cols-[160px_minmax(200px,0.7fr)_minmax(420px,1.35fr)]"
        >
          <div class="flex items-start">
            <span
              :class="[
                'inline-flex min-h-8 items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium',
                platformBadgeClass(section.platform),
              ]"
            >
              <PlatformIcon :platform="section.platform as GroupPlatform" size="xs" />
              {{ section.platform }}
            </span>
          </div>

          <div class="space-y-2">
            <div
              v-if="exclusiveGroups(section).length > 0"
              class="flex flex-wrap items-center gap-1.5"
            >
              <span
                class="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--app-muted-strong)]"
                :title="t('availableChannels.exclusiveTooltip')"
              >
                <Icon name="shield" size="xs" class="h-3 w-3" />
                {{ t('availableChannels.exclusive') }}
              </span>
              <GroupBadge
                v-for="g in exclusiveGroups(section)"
                :key="`desktop-ex-${g.id}`"
                :name="g.name"
                :platform="g.platform as GroupPlatform"
                :subscription-type="(g.subscription_type || 'standard') as SubscriptionType"
                :rate-multiplier="g.rate_multiplier"
                :user-rate-multiplier="userGroupRates[g.id] ?? null"
                always-show-rate
              />
            </div>
            <div
              v-if="publicGroups(section).length > 0"
              class="flex flex-wrap items-center gap-1.5"
            >
              <span
                class="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--app-muted-strong)]"
                :title="t('availableChannels.publicTooltip')"
              >
                <Icon name="globe" size="xs" class="h-3 w-3" />
                {{ t('availableChannels.public') }}
              </span>
              <GroupBadge
                v-for="g in publicGroups(section)"
                :key="`desktop-pub-${g.id}`"
                :name="g.name"
                :platform="g.platform as GroupPlatform"
                :subscription-type="(g.subscription_type || 'standard') as SubscriptionType"
                :rate-multiplier="g.rate_multiplier"
                :user-rate-multiplier="userGroupRates[g.id] ?? null"
                always-show-rate
              />
            </div>
            <span v-if="section.groups.length === 0" class="text-xs text-[var(--app-muted)]">-</span>
          </div>

          <div class="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
            <AvailableModelDisclosure
              v-for="m in section.supported_models"
              :key="`desktop-model-${section.platform}-${m.name}`"
              :model="m"
              :groups="section.groups"
              :user-group-rates="userGroupRates"
              :pricing-key-prefix="pricingKeyPrefix"
              :no-pricing-label="noPricingLabel"
              :platform-hint="section.platform"
            />
            <span v-if="section.supported_models.length === 0" class="text-xs text-[var(--app-muted)]">
              {{ noModelsLabel }}
            </span>
          </div>
        </section>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import PlatformIcon from '@/components/common/PlatformIcon.vue'
import GroupBadge from '@/components/common/GroupBadge.vue'
import AvailableModelDisclosure from './AvailableModelDisclosure.vue'
import type { UserAvailableChannel, UserAvailableGroup, UserChannelPlatformSection } from '@/api/channels'
import type { GroupPlatform, SubscriptionType } from '@/types'
import { platformBadgeClass } from '@/utils/platformColors'

const props = defineProps<{
  columns: {
    name: string
    description: string
    platform: string
    groups: string
    supportedModels: string
  }
  rows: UserAvailableChannel[]
  loading: boolean
  pricingKeyPrefix: string
  noPricingLabel: string
  noModelsLabel: string
  emptyLabel: string
  /** 用户专属倍率（group_id → multiplier）；无专属时由 GroupBadge 仅显示默认倍率。 */
  userGroupRates: Record<number, number>
}>()

// Suppress unused warning — props is accessed via template automatically but
// the explicit reference here keeps the linter from flagging userGroupRates.
void props.userGroupRates

const { t } = useI18n()
const expandedChannelKeys = ref<Set<string>>(new Set())

function exclusiveGroups(section: UserChannelPlatformSection): UserAvailableGroup[] {
  return section.groups.filter((g) => g.is_exclusive)
}

function publicGroups(section: UserChannelPlatformSection): UserAvailableGroup[] {
  return section.groups.filter((g) => !g.is_exclusive)
}

function channelCardKey(channel: UserAvailableChannel, index: number): string {
  return `${channel.name}-${index}`
}

function isChannelExpanded(key: string): boolean {
  return expandedChannelKeys.value.has(key)
}

function toggleChannel(key: string) {
  const next = new Set(expandedChannelKeys.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  expandedChannelKeys.value = next
}

function channelModelCount(channel: UserAvailableChannel): number {
  return channel.platforms.reduce((sum, section) => sum + section.supported_models.length, 0)
}

function channelGroupCount(channel: UserAvailableChannel): number {
  return channel.platforms.reduce((sum, section) => sum + section.groups.length, 0)
}
</script>
