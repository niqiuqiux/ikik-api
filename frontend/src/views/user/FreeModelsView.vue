<template>
  <AppLayout>
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold tracking-tight text-[var(--app-text)]">
            {{ t('freeModels.title') }}
          </h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-text-muted)]">
            {{ t('freeModels.description') }}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-secondary btn-icon h-10 w-10 flex-none p-0"
          :disabled="loading"
          :title="t('common.refresh')"
          @click="loadAccounts"
        >
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
        </button>
      </div>

      <section class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FreeModelProviderCard
          v-for="provider in providers"
          :key="provider.code"
          :provider="provider"
          :accounts="providerAccounts(provider)"
          :connection-label="connectionLabel(provider)"
          :connection-badge-class="connectionBadgeClass(provider)"
          :health-label="healthLabel(provider)"
          :health-badge-class="healthBadgeClass(provider)"
          :connected-summary="connectedSummary(provider)"
          @status="openStatusDialog(provider)"
          @connect="openConnectDialog(provider)"
        />
      </section>

      <FreeModelConnectDialog
        v-model:account-name="accountName"
        v-model:base-url-input="baseUrlInput"
        v-model:api-keys-input="apiKeysInput"
        v-model:models-input="modelsInput"
        :show="connectDialogOpen"
        :provider="connectProvider"
        :creating="creating"
        :api-key-count="apiKeyCount"
        @close="closeConnectDialog"
        @create="createFreeModelAccount"
      />

      <FreeModelStatusDialog
        :show="statusDialogOpen"
        :provider="statusProvider"
        :accounts="statusProvider ? providerAccounts(statusProvider) : []"
        :test-results="testResults"
        :testing-account-id="testingAccountID"
        :testing-provider="testingProvider"
        @close="closeStatusDialog"
        @connect="statusProvider && openConnectDialog(statusProvider)"
        @test-all="statusProvider && testProviderAccounts(statusProvider)"
        @test-account="openTestDialog"
        @delete-account="deleteAccount"
      />

      <AccountTestModal
        :show="testDialogOpen"
        :account="testDialogAccount"
        account-scope="user"
        @close="closeTestDialog"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { accountsAPI } from '@/api'
import { buildApiUrl } from '@/api/client'
import AccountTestModal from '@/components/account/AccountTestModal.vue'
import FreeModelConnectDialog from '@/components/free-models/FreeModelConnectDialog.vue'
import FreeModelProviderCard from '@/components/free-models/FreeModelProviderCard.vue'
import FreeModelStatusDialog from '@/components/free-models/FreeModelStatusDialog.vue'
import type { FreeModelAccount, FreeModelProvider, FreeModelTestState } from '@/components/free-models/types'
import Icon from '@/components/icons/Icon.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAppStore } from '@/stores/app'
import type { CreateAccountRequest } from '@/types'
import { extractApiErrorMessage } from '@/utils/apiError'

const { t } = useI18n()
const appStore = useAppStore()

const providers = computed<FreeModelProvider[]>(() => [
  {
    code: 'groq',
    name: t('freeModels.providers.groq'),
    initials: 'GQ',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'llama-4-scout-17b-16e-instruct'],
    note: t('freeModels.providerNotes.groq'),
    keyUrl: 'https://console.groq.com/keys',
    docsUrl: 'https://console.groq.com/docs/quickstart'
  },
  {
    code: 'cerebras',
    name: t('freeModels.providers.cerebras'),
    initials: 'CB',
    baseUrl: 'https://api.cerebras.ai/v1',
    models: ['qwen-3-coder-480b', 'gpt-oss-120b'],
    note: t('freeModels.providerNotes.cerebras'),
    keyUrl: 'https://cloud.cerebras.ai',
    docsUrl: 'https://inference-docs.cerebras.ai'
  },
  {
    code: 'openrouter',
    name: t('freeModels.providers.openrouter'),
    initials: 'OR',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['deepseek/deepseek-v3.1:free', 'qwen/qwen3-coder:free', 'z-ai/glm-4.5-air:free'],
    note: t('freeModels.providerNotes.openrouter'),
    keyUrl: 'https://openrouter.ai/keys',
    docsUrl: 'https://openrouter.ai/docs/quickstart'
  },
  {
    code: 'github',
    name: t('freeModels.providers.github'),
    initials: 'GH',
    baseUrl: 'https://models.github.ai/inference',
    models: ['openai/gpt-5'],
    note: t('freeModels.providerNotes.github'),
    keyUrl: 'https://github.com/settings/tokens',
    docsUrl: 'https://docs.github.com/en/github-models'
  },
  {
    code: 'gemini_openai',
    name: t('freeModels.providers.gemini'),
    initials: 'GM',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
    note: t('freeModels.providerNotes.gemini'),
    keyUrl: 'https://aistudio.google.com/apikey',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/openai'
  },
  {
    code: 'cloudflare_workers_ai',
    name: t('freeModels.providers.cloudflare'),
    initials: 'CF',
    baseUrl: 'https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/v1',
    baseUrlEditable: true,
    models: ['@cf/meta/llama-3.1-8b-instruct', '@cf/openai/gpt-oss-120b', '@cf/baai/bge-large-en-v1.5'],
    note: t('freeModels.providerNotes.cloudflare'),
    keyUrl: 'https://dash.cloudflare.com/profile/api-tokens',
    docsUrl: 'https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/'
  },
  {
    code: 'cohere',
    name: t('freeModels.providers.cohere'),
    initials: 'CO',
    baseUrl: 'https://api.cohere.ai/compatibility/v1',
    models: ['command-a-plus-05-2026', 'command-a-03-2025', 'command-r-plus-08-2024'],
    note: t('freeModels.providerNotes.cohere'),
    keyUrl: 'https://dashboard.cohere.com/api-keys',
    docsUrl: 'https://docs.cohere.com/docs/compatibility-api'
  },
  {
    code: 'ovh_ai_endpoints',
    name: t('freeModels.providers.ovh'),
    initials: 'OV',
    baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
    models: ['Meta-Llama-3_3-70B-Instruct', 'Mistral-Small-3.2-24B-Instruct-2506', 'gpt-oss-120b'],
    note: t('freeModels.providerNotes.ovh'),
    keyUrl: 'https://endpoints.ai.cloud.ovh.net/',
    docsUrl: 'https://docs.ovhcloud.com/en/guides/public-cloud/ai-machine-learning/ai-endpoints-getting-started'
  },
  {
    code: 'mistral',
    name: t('freeModels.providers.mistral'),
    initials: 'MI',
    baseUrl: 'https://api.mistral.ai/v1',
    models: ['mistral-large-latest', 'magistral-medium-latest', 'codestral-latest'],
    note: t('freeModels.providerNotes.mistral'),
    keyUrl: 'https://console.mistral.ai/api-keys/',
    docsUrl: 'https://docs.mistral.ai/api/'
  },
  {
    code: 'huggingface',
    name: t('freeModels.providers.huggingface'),
    initials: 'HF',
    baseUrl: 'https://router.huggingface.co/v1',
    models: ['accounts/fireworks/models/llama-v3p3-70b-instruct'],
    note: t('freeModels.providerNotes.huggingface'),
    keyUrl: 'https://huggingface.co/settings/tokens',
    docsUrl: 'https://huggingface.co/docs/inference-providers/index'
  },
  {
    code: 'zhipu',
    name: t('freeModels.providers.zai'),
    initials: 'ZA',
    baseUrl: 'https://api.z.ai/api/paas/v4',
    models: ['glm-4.5-flash', 'glm-4.7-flash'],
    note: t('freeModels.providerNotes.zai'),
    keyUrl: 'https://z.ai/manage-apikey/apikey-list',
    docsUrl: 'https://docs.z.ai/guides/overview/quick-start'
  },
  {
    code: 'qwen_intl',
    name: t('freeModels.providers.qwenIntl'),
    initials: 'QW',
    baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-flash', 'qwen-plus', 'qwen3-coder-plus'],
    note: t('freeModels.providerNotes.qwenIntl'),
    keyUrl: 'https://modelstudio.console.alibabacloud.com/',
    docsUrl: 'https://help.aliyun.com/en/model-studio/base-url'
  },
  {
    code: 'siliconflow_global',
    name: t('freeModels.providers.siliconflowGlobal'),
    initials: 'SF',
    baseUrl: 'https://api.siliconflow.com/v1',
    models: ['Qwen/Qwen3-8B', 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B', 'Qwen/Qwen3-Coder-30B-A3B-Instruct'],
    note: t('freeModels.providerNotes.siliconflowGlobal'),
    keyUrl: 'https://cloud.siliconflow.com/account/ak',
    docsUrl: 'https://docs.siliconflow.com/en/usercases/use-siliconcloud-in-cline'
  },
  {
    code: 'nvidia_nim',
    name: t('freeModels.providers.nvidiaNim'),
    initials: 'NV',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    models: ['nvidia/nemotron-3-ultra-550b-a55b', 'nvidia/nemotron-3-super-120b-a12b'],
    note: t('freeModels.providerNotes.nvidiaNim'),
    keyUrl: 'https://build.nvidia.com/',
    docsUrl: 'https://build.nvidia.com/models'
  },
  {
    code: 'ollama',
    name: t('freeModels.providers.ollama'),
    initials: 'OL',
    baseUrl: 'https://ollama.com/v1',
    models: ['gpt-oss:120b', 'qwen3-coder:480b', 'glm-4.7'],
    note: t('freeModels.providerNotes.ollama'),
    keyUrl: 'https://ollama.com/settings/keys',
    docsUrl: 'https://ollama.com'
  },
  {
    code: 'opencode',
    name: t('freeModels.providers.opencode'),
    initials: 'OC',
    baseUrl: 'https://opencode.ai/zen/v1',
    models: ['deepseek-v4-flash-free', 'mimo-v2.5-free', 'minimax-m3-free'],
    note: t('freeModels.providerNotes.opencode'),
    keyUrl: 'https://opencode.ai/auth',
    docsUrl: 'https://opencode.ai'
  }
])

const accounts = ref<FreeModelAccount[]>([])
const loading = ref(false)
const creating = ref(false)
const testingAccountID = ref<number | null>(null)
const testResults = ref<Record<number, FreeModelTestState>>({})

const connectDialogOpen = ref(false)
const connectProvider = ref<FreeModelProvider | null>(null)
const statusDialogOpen = ref(false)
const statusProvider = ref<FreeModelProvider | null>(null)
const testDialogOpen = ref(false)
const testDialogAccount = ref<FreeModelAccount | null>(null)

const accountName = ref('')
const baseUrlInput = ref('')
const apiKeysInput = ref('')
const modelsInput = ref('')

const apiKeyCount = computed(() => parseApiKeys(apiKeysInput.value).length)
const testingProvider = computed(() => testingAccountID.value != null)

function parseModels(input: string): string[] {
  const seen = new Set<string>()
  for (const raw of input.split(/[\n,]+/)) {
    const model = raw.trim()
    if (model) seen.add(model)
  }
  return [...seen]
}

function parseApiKeys(input: string): string[] {
  const seen = new Set<string>()
  for (const raw of input.split(/\r?\n/)) {
    const key = raw.trim()
    if (key) seen.add(key)
  }
  return [...seen]
}

function buildModelMapping(models: string[]): Record<string, string> {
  return models.reduce<Record<string, string>>((mapping, model) => {
    mapping[model] = model
    return mapping
  }, {})
}

function parseFutureTime(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null
  const time = new Date(value)
  if (Number.isNaN(time.getTime())) return null
  return time.getTime() > Date.now() ? time : null
}

function isFreeModelAccount(account: FreeModelAccount): boolean {
  return account.platform === 'openai' && account.type === 'apikey' && account.extra?.free_model_provider != null
}

function providerAccounts(provider: FreeModelProvider): FreeModelAccount[] {
  return accounts.value.filter((account) => account.extra?.free_model_provider === provider.code)
}

function accountModelIDs(account: FreeModelAccount): string[] {
  const mapping = account.credentials?.model_mapping
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) return []
  return Object.keys(mapping as Record<string, unknown>)
}

function connectionLabel(provider: FreeModelProvider): string {
  return providerAccounts(provider).length > 0 ? t('freeModels.connected') : t('freeModels.notConnected')
}

function connectionBadgeClass(provider: FreeModelProvider): string {
  return providerAccounts(provider).length > 0
    ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
    : 'bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]'
}

function accountHasActiveLimit(account: FreeModelAccount): boolean {
  if (parseFutureTime(account.rate_limit_reset_at)) return true
  if (parseFutureTime(account.temp_unschedulable_until)) return true
  if (parseFutureTime(account.overload_until)) return true
  const modelLimits = account.extra?.model_rate_limits
  if (!modelLimits || typeof modelLimits !== 'object' || Array.isArray(modelLimits)) return false
  return Object.values(modelLimits as Record<string, { rate_limit_reset_at?: string }>).some((item) => parseFutureTime(item.rate_limit_reset_at))
}

function providerHealth(provider: FreeModelProvider): 'normal' | 'limited' | 'error' | 'not_connected' {
  const items = providerAccounts(provider)
  if (items.length === 0) return 'not_connected'
  if (items.some((account) => accountHasActiveLimit(account))) return 'limited'
  if (items.some((account) => account.status === 'error')) return 'error'
  if (items.some((account) => account.status === 'active')) return 'normal'
  return 'error'
}

function healthLabel(provider: FreeModelProvider): string {
  return t(`freeModels.health.${providerHealth(provider)}`)
}

function healthBadgeClass(provider: FreeModelProvider): string {
  const health = providerHealth(provider)
  if (health === 'normal') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  if (health === 'limited') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  if (health === 'error') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  return 'bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]'
}

function connectedSummary(provider: FreeModelProvider): string {
  const items = providerAccounts(provider)
  const normal = items.filter((account) => account.status === 'active' && !accountHasActiveLimit(account)).length
  const limited = items.filter(accountHasActiveLimit).length
  const errored = items.filter((account) => account.status === 'error').length
  return t('freeModels.connectedSummary', {
    count: items.length,
    normal,
    limited,
    error: errored
  })
}

function openConnectDialog(provider: FreeModelProvider) {
  statusDialogOpen.value = false
  connectProvider.value = provider
  accountName.value = t('freeModels.accountNamePlaceholder', { provider: provider.name })
  baseUrlInput.value = provider.baseUrl
  apiKeysInput.value = ''
  modelsInput.value = provider.models.join('\n')
  connectDialogOpen.value = true
}

function closeConnectDialog() {
  if (creating.value) return
  connectDialogOpen.value = false
}

function openStatusDialog(provider: FreeModelProvider) {
  statusProvider.value = provider
  statusDialogOpen.value = true
}

function closeStatusDialog() {
  if (testingAccountID.value != null) return
  statusDialogOpen.value = false
}

async function loadAccounts() {
  loading.value = true
  try {
    const response = await accountsAPI.list(1, 1000, {
      platform: 'openai',
      type: 'apikey',
      sort_by: 'created_at',
      sort_order: 'desc'
    })
    accounts.value = response.items.filter(isFreeModelAccount)
  } catch (err: unknown) {
    appStore.showError(extractApiErrorMessage(err, t('freeModels.loadFailed')))
  } finally {
    loading.value = false
  }
}

async function createFreeModelAccount() {
  const provider = connectProvider.value
  if (!provider) return

  const models = parseModels(modelsInput.value)
  if (models.length === 0) {
    appStore.showError(t('freeModels.requireModels'))
    return
  }
  const apiKeys = parseApiKeys(apiKeysInput.value)
  if (apiKeys.length === 0) {
    appStore.showError(t('freeModels.requireApiKey'))
    return
  }
  const baseUrl = (provider.baseUrlEditable ? baseUrlInput.value : provider.baseUrl).trim().replace(/\/+$/, '')
  if (!baseUrl) {
    appStore.showError(t('freeModels.requireBaseUrl'))
    return
  }
  if (provider.baseUrlEditable && /\bYOUR_|[{}]/.test(baseUrl)) {
    appStore.showError(t('freeModels.replaceBaseUrlPlaceholder'))
    return
  }

  const baseName = accountName.value.trim() || t('freeModels.accountNamePlaceholder', { provider: provider.name })
  const buildPayload = (apiKey: string, index: number): CreateAccountRequest => ({
    name: apiKeys.length > 1 ? `${baseName} #${index + 1}` : baseName,
    platform: 'openai',
    account_level: 'unknown',
    type: 'apikey',
    share_mode: 'private',
    credentials: {
      api_key: apiKey,
      base_url: baseUrl,
      model_mapping: buildModelMapping(models)
    },
    extra: {
      free_model_provider: provider.code,
      free_model_provider_name: provider.name,
      free_model_enabled: true,
      openai_responses_supported: false,
      openai_apikey_responses_websockets_v2_mode: 'off',
      openai_apikey_responses_websockets_v2_enabled: false,
      openai_passthrough: false,
      openai_oauth_passthrough: false,
      codex_cli_only: false,
      openai_compact_mode: 'force_on'
    }
  })

  creating.value = true
  try {
    let successCount = 0
    const failures: string[] = []
    for (const [index, key] of apiKeys.entries()) {
      try {
        await accountsAPI.create(buildPayload(key, index))
        successCount += 1
      } catch (err: unknown) {
        failures.push(extractApiErrorMessage(err, t('freeModels.createFailed')))
      }
    }

    if (successCount > 0) {
      appStore.showSuccess(t('freeModels.createSuccessCount', { count: successCount }))
      closeConnectDialog()
      await loadAccounts()
    }
    if (failures.length > 0) {
      appStore.showError(t('freeModels.createPartial', {
        success: successCount,
        failed: failures.length,
        reason: failures[0]
      }))
    }
  } catch (err: unknown) {
    appStore.showError(extractApiErrorMessage(err, t('freeModels.createFailed')))
  } finally {
    creating.value = false
  }
}

function openTestDialog(account: FreeModelAccount) {
  testDialogAccount.value = account
  testDialogOpen.value = true
}

async function closeTestDialog() {
  testDialogOpen.value = false
  testDialogAccount.value = null
  await loadAccounts()
}

interface AccountTestEvent {
  type: string
  text?: string
  model?: string
  success?: boolean
  error?: string
}

async function runAccountTest(account: FreeModelAccount) {
  const model = accountModelIDs(account)[0]
  if (!model) {
    const message = t('freeModels.requireModels')
    testResults.value = {
      ...testResults.value,
      [account.id]: { status: 'error', message }
    }
    appStore.showError(message)
    return
  }

  testingAccountID.value = account.id
  const startedAt = Date.now()
  try {
    const response = await fetch(buildApiUrl(`/api/v1/accounts/${account.id}/test`), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model_id: model,
        prompt: '',
        mode: 'default'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let result: FreeModelTestState = {
      status: 'error',
      message: t('freeModels.testFailed')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6).trim()
        if (!jsonStr) continue
        try {
          const event = JSON.parse(jsonStr) as AccountTestEvent
          if (event.type === 'test_complete') {
            result = {
              status: event.success ? 'success' : 'error',
              message: event.success ? t('freeModels.testSuccess') : event.error || t('freeModels.testFailed'),
              latency: Date.now() - startedAt
            }
          } else if (event.type === 'error') {
            result = {
              status: 'error',
              message: event.error || t('freeModels.testFailed'),
              latency: Date.now() - startedAt
            }
          }
        } catch {
          // Ignore partial or malformed SSE lines.
        }
      }
    }

    testResults.value = {
      ...testResults.value,
      [account.id]: result
    }
    if (result.status === 'success') {
      appStore.showSuccess(result.message)
    } else {
      appStore.showError(result.message)
    }
    await loadAccounts()
  } catch (err: unknown) {
    const message = extractApiErrorMessage(err, t('freeModels.testFailed'))
    testResults.value = {
      ...testResults.value,
      [account.id]: { status: 'error', message }
    }
    appStore.showError(message)
    await loadAccounts()
  } finally {
    testingAccountID.value = null
  }
}

async function testProviderAccounts(provider: FreeModelProvider) {
  for (const account of providerAccounts(provider)) {
    await runAccountTest(account)
  }
}

async function deleteAccount(account: FreeModelAccount) {
  if (!window.confirm(t('freeModels.deleteConfirm'))) return
  try {
    await accountsAPI.delete(account.id)
    accounts.value = accounts.value.filter((item) => item.id !== account.id)
    const next = { ...testResults.value }
    delete next[account.id]
    testResults.value = next
    appStore.showSuccess(t('freeModels.deleteSuccess'))
  } catch (err: unknown) {
    appStore.showError(extractApiErrorMessage(err, t('freeModels.deleteFailed')))
  }
}

onMounted(loadAccounts)
</script>
