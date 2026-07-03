import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import checker from 'vite-plugin-checker'
import { resolve } from 'path'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

const mockUser = {
  id: 1,
  username: 'local-admin',
  email: 'admin@local.test',
  role: 'admin',
  balance: 1000,
  recharge_balance: 1000,
  invite_income_balance: 0,
  share_income_balance: 0,
  points_balance: 0,
  prefer_points_billing: false,
  concurrency: 10,
  rpm_limit: 0,
  status: 'active',
  allowed_groups: null,
  balance_notify_enabled: false,
  balance_notify_threshold: null,
  balance_notify_extra_emails: [],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  run_mode: 'standard'
}

const mockGroups = [
  {
    id: 1,
    name: 'OpenAI Local',
    description: 'Local mock OpenAI group',
    platform: 'openai',
    rate_multiplier: 1,
    rpm_limit: 0,
    is_exclusive: false,
    status: 'active',
    subscription_type: 'standard',
    daily_limit_usd: null,
    weekly_limit_usd: null,
    monthly_limit_usd: null,
    image_price_1k: null,
    image_price_2k: null,
    image_price_4k: null,
    claude_code_only: false,
    fallback_group_id: null,
    fallback_group_id_on_invalid_request: null,
    default_mapped_model: 'gpt-5.5',
    models_list_config: {
      enabled: true,
      models: ['gpt-5.5', 'gpt-5.4-mini', 'ik-auto-pro']
    },
    require_oauth_only: false,
    require_privacy_set: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Claude Local',
    description: 'Local mock Claude group',
    platform: 'anthropic',
    rate_multiplier: 1,
    rpm_limit: 0,
    is_exclusive: false,
    status: 'active',
    subscription_type: 'standard',
    daily_limit_usd: null,
    weekly_limit_usd: null,
    monthly_limit_usd: null,
    image_price_1k: null,
    image_price_2k: null,
    image_price_4k: null,
    claude_code_only: false,
    fallback_group_id: null,
    fallback_group_id_on_invalid_request: null,
    default_mapped_model: 'claude-sonnet-4.6',
    models_list_config: {
      enabled: true,
      models: ['claude-sonnet-4.6', 'claude-opus-4.7']
    },
    require_oauth_only: false,
    require_privacy_set: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
]

const mockPublicSettings = {
  registration_enabled: true,
  email_verify_enabled: false,
  force_email_on_third_party_signup: false,
  registration_email_suffix_whitelist: [],
  promo_code_enabled: true,
  password_reset_enabled: true,
  invitation_code_enabled: false,
  turnstile_enabled: false,
  turnstile_site_key: '',
  site_name: 'ikik-api Local',
  site_logo: '',
  site_subtitle: 'Local mock preview',
  api_base_url: '',
  contact_info: '',
  doc_url: '',
  home_content: '',
  hide_ccs_import_button: false,
  payment_enabled: false,
  purchase_subscription_enabled: false,
  purchase_subscription_url: '',
  risk_control_enabled: true,
  table_default_page_size: 20,
  table_page_size_options: [10, 20, 50, 100, 1000],
  custom_menu_items: [],
  custom_endpoints: [],
  linuxdo_oauth_enabled: false,
  wechat_oauth_enabled: false,
  wechat_oauth_open_enabled: false,
  wechat_oauth_mp_enabled: false,
  wechat_oauth_mobile_enabled: false,
  oidc_oauth_enabled: false,
  oidc_oauth_provider_name: 'OIDC',
  github_oauth_enabled: false,
  google_oauth_enabled: false,
  backend_mode_enabled: false,
  version: '1.0.1-local',
  balance_low_notify_enabled: false,
  account_quota_notify_enabled: false,
  balance_low_notify_threshold: 0,
  channel_monitor_enabled: true,
  channel_monitor_default_interval_seconds: 60,
  available_channels_enabled: true,
  carpool_enabled: true,
  carpool_base_service_fee_usd: 75,
  carpool_system_proxy_fee_usd: 10,
  carpool_risk_control_fee_usd: 15,
  affiliate_enabled: true
}

let mockAccountID = 1000
let mockProxyID = 100
let mockBatchTaskID = 1
const mockAccounts: Array<Record<string, unknown>> = []
const mockProxies: Array<Record<string, unknown>> = []

function nowISO(): string {
  return new Date().toISOString()
}

function localOrigin(req: IncomingMessage): string {
  const host = req.headers.host || '127.0.0.1:3000'
  const proto = req.headers['x-forwarded-proto'] || 'http'
  return `${proto}://${host}`
}

function localPublicSettings(req: IncomingMessage): Record<string, unknown> {
  return {
    ...mockPublicSettings,
    api_base_url: localOrigin(req)
  }
}

function parseJsonBody<T extends Record<string, unknown>>(body: string): T {
  try {
    return JSON.parse(body || '{}') as T
  } catch {
    return {} as T
  }
}

function paginateItems<T>(items: T[], url: URL): Record<string, unknown> {
  const page = Math.max(1, Number(url.searchParams.get('page') || 1))
  const pageSize = Math.max(1, Number(url.searchParams.get('page_size') || 20))
  const start = (page - 1) * pageSize
  const sliced = items.slice(start, start + pageSize)
  return {
    items: sliced,
    total: items.length,
    page,
    page_size: pageSize,
    pages: Math.max(1, Math.ceil(items.length / pageSize))
  }
}

function createMockAccount(payload: Record<string, unknown>): Record<string, unknown> {
  const createdAt = nowISO()
  const platform = String(payload.platform || 'openai')
  const type = String(payload.type || 'apikey')
  const account = {
    id: ++mockAccountID,
    name: String(payload.name || `${platform} local account`),
    notes: payload.notes ?? null,
    platform,
    account_level: payload.account_level || 'free',
    type,
    credentials: payload.credentials || {},
    extra: payload.extra || {},
    proxy_id: payload.proxy_id ?? null,
    proxy_fallback_origin_id: null,
    proxy_fallback_origin_name: null,
    owner_user_id: mockUser.id,
    share_mode: payload.share_mode || 'private',
    share_status: 'none',
    share_policy_id: null,
    concurrency: payload.concurrency || 1,
    load_factor: payload.load_factor ?? null,
    current_concurrency: 0,
    priority: payload.priority || 50,
    rate_multiplier: payload.rate_multiplier ?? 1,
    status: 'active',
    error_message: null,
    last_used_at: null,
    expires_at: payload.expires_at ?? null,
    auto_pause_on_expired: payload.auto_pause_on_expired ?? true,
    created_at: createdAt,
    updated_at: createdAt,
    proxy: null,
    group_ids: [],
    groups: [],
    schedulable: true,
    rate_limited_at: null,
    rate_limit_reset_at: null,
    overload_until: null,
    temp_unschedulable_until: null,
    temp_unschedulable_reason: null,
    session_window_start: null,
    session_window_end: null,
    session_window_status: null,
    window_cost_limit: null,
    window_cost_sticky_reserve: null,
    max_sessions: null,
    session_idle_timeout_minutes: null,
    base_rpm: null,
    rpm_strategy: null,
    rpm_sticky_buffer: null,
    user_msg_queue_mode: null,
    enable_tls_fingerprint: null,
    tls_fingerprint_profile_id: null,
    session_id_masking_enabled: null,
    cache_ttl_override_enabled: null
  }
  mockAccounts.unshift(account)
  return account
}

function mockUsageInfo(): Record<string, unknown> {
  return {
    source: 'passive',
    updated_at: nowISO(),
    five_hour: {
      used: 0,
      limit: 100,
      percentage: 0,
      reset_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
    },
    seven_day: {
      used: 0,
      limit: 100,
      percentage: 0,
      reset_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    seven_day_sonnet: null
  }
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function success(data: unknown): Record<string, unknown> {
  return { code: 0, message: 'success', data }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function localMockApiPlugin(enabled: boolean): Plugin {
  return {
    name: 'ikik-local-mock-api',
    enforce: 'pre',
    apply: 'serve',
    configureServer(server) {
      if (!enabled) return
      console.info('[vite] Local mock API enabled')

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? new URL(req.url, 'http://local.test') : null
        const path = url?.pathname || ''

        if (path === '/setup/status') {
          sendJson(res, 200, success({ needs_setup: false, step: 'done' }))
          return
        }

        if (path === '/api/v1/settings/public') {
          sendJson(res, 200, success(localPublicSettings(req)))
          return
        }

        if (path === '/api/v1/auth/login' && req.method === 'POST') {
          const body = await readBody(req)
          const credentials = parseJsonBody<{ email?: string; password?: string }>(body)
          if (credentials.email !== 'admin@local.test' || credentials.password !== 'admin123456') {
            sendJson(res, 401, { code: 401, message: 'invalid email or password' })
            return
          }
          sendJson(res, 200, success({
            access_token: 'local-mock-access-token',
            refresh_token: 'local-mock-refresh-token',
            expires_in: 2592000,
            token_type: 'Bearer',
            user: mockUser
          }))
          return
        }

        if (path === '/api/v1/auth/register' && req.method === 'POST') {
          const body = await readBody(req)
          const payload = parseJsonBody<{ email?: string; username?: string }>(body)
          const user = {
            ...mockUser,
            id: 2,
            username: payload.username || 'local-user',
            email: payload.email || 'user@local.test',
            role: 'user'
          }
          sendJson(res, 200, success({
            access_token: 'local-mock-access-token',
            refresh_token: 'local-mock-refresh-token',
            expires_in: 2592000,
            token_type: 'Bearer',
            user
          }))
          return
        }

        if (path === '/api/v1/auth/logout' && req.method === 'POST') {
          sendJson(res, 200, success({ message: 'logged out' }))
          return
        }

        if (path === '/api/v1/auth/me') {
          sendJson(res, 200, success(mockUser))
          return
        }

        if (path === '/api/v1/auth/session') {
          sendJson(res, 401, { code: 401, message: 'no local mock session' })
          return
        }

        if (path === '/api/v1/auth/refresh' && req.method === 'POST') {
          sendJson(res, 200, success({
            access_token: 'local-mock-access-token',
            refresh_token: 'local-mock-refresh-token',
            expires_in: 2592000,
            token_type: 'Bearer'
          }))
          return
        }

        if (path === '/api/v1/public/usage/today') {
          sendJson(res, 200, success({
            today_requests: 1280,
            today_tokens: 2480000,
            success_rate: 99.2,
            average_duration_ms: 5400,
            average_first_token_ms: 1.2
          }))
          return
        }

        if (path === '/api/v1/subscriptions/active') {
          sendJson(res, 200, success([]))
          return
        }

        if (path === '/api/v1/announcements') {
          sendJson(res, 200, success([]))
          return
        }

        if (path === '/api/v1/groups/available') {
          sendJson(res, 200, success(mockGroups))
          return
        }

        if (path === '/api/v1/groups/rates') {
          sendJson(res, 200, success({}))
          return
        }

        if (path === '/api/v1/channels/available') {
          sendJson(res, 200, success([
            {
              name: 'Local Mock Gateway',
              description: 'Local data for playground UI preview',
              platforms: [
                {
                  platform: 'openai',
                  groups: [mockGroups[0]],
                  supported_models: ['gpt-5.5', 'gpt-5.4-mini', 'ik-auto-pro'].map((name) => ({
                    name,
                    platform: 'openai',
                    pricing: {
                      billing_mode: 'token',
                      input_price: 2,
                      output_price: 8,
                      cache_write_price: 0.5,
                      cache_read_price: 0.1,
                      image_output_price: null,
                      per_request_price: null,
                      intervals: []
                    }
                  }))
                },
                {
                  platform: 'anthropic',
                  groups: [mockGroups[1]],
                  supported_models: ['claude-sonnet-4.6', 'claude-opus-4.7'].map((name) => ({
                    name,
                    platform: 'anthropic',
                    pricing: {
                      billing_mode: 'token',
                      input_price: 3,
                      output_price: 15,
                      cache_write_price: 3.75,
                      cache_read_price: 0.3,
                      image_output_price: null,
                      per_request_price: null,
                      intervals: []
                    }
                  }))
                }
              ]
            }
          ]))
          return
        }

        if (path === '/api/v1/accounts/quota-dashboard') {
          sendJson(res, 200, success({
            generated_at: nowISO(),
            totals: {
              account_count: mockAccounts.length,
              schedulable_account_count: mockAccounts.length,
              rate_limited_account_count: 0,
              error_account_count: 0,
              disabled_account_count: 0,
              daily: null,
              weekly: null,
              total: null,
              openai_windows: []
            },
            groups: [],
            issues: []
          }))
          return
        }

        if (path === '/api/v1/accounts/data') {
          sendJson(res, 200, success({
            type: 'ikik-api-data',
            version: 1,
            accounts: mockAccounts,
            proxies: mockProxies
          }))
          return
        }

        if (path === '/api/v1/accounts/import-credentials' && req.method === 'POST') {
          const body = await readBody(req)
          const payload = parseJsonBody<{ contents?: unknown[]; share_mode?: string }>(body)
          const contents = Array.isArray(payload.contents) ? payload.contents : []
          contents.forEach((content, index) => {
            createMockAccount({
              name: `Imported Local ${index + 1}`,
              platform: 'openai',
              type: 'oauth',
              share_mode: payload.share_mode || 'private',
              credentials: { imported: true, content }
            })
          })
          sendJson(res, 200, success({
            total: contents.length,
            created: contents.length,
            failed: 0,
            errors: []
          }))
          return
        }

        if (path === '/api/v1/accounts/import' && req.method === 'POST') {
          const body = await readBody(req)
          sendJson(res, 200, success(createMockAccount(parseJsonBody(body))))
          return
        }

        if (path === '/api/v1/accounts/today-stats/batch' && req.method === 'POST') {
          const body = await readBody(req)
          const payload = parseJsonBody<{ account_ids?: unknown[] }>(body)
          const stats = Object.fromEntries(
            (Array.isArray(payload.account_ids) ? payload.account_ids : []).map((id) => [
              String(id),
              { requests: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0, cost: 0 }
            ])
          )
          sendJson(res, 200, success({ stats }))
          return
        }

        if (path === '/api/v1/accounts/bulk-update' && req.method === 'POST') {
          const body = await readBody(req)
          const payload = parseJsonBody<{ account_ids?: unknown[] }>(body)
          const ids = Array.isArray(payload.account_ids) ? payload.account_ids.map(Number) : []
          const successIDs: number[] = []
          mockAccounts.forEach((account) => {
            if (ids.includes(Number(account.id))) {
              Object.assign(account, payload, { updated_at: nowISO() })
              delete account.account_ids
              successIDs.push(Number(account.id))
            }
          })
          sendJson(res, 200, success({
            success: successIDs.length,
            failed: 0,
            success_ids: successIDs,
            failed_ids: [],
            results: successIDs.map((id) => ({ account_id: id, success: true }))
          }))
          return
        }

        if (path === '/api/v1/accounts/bulk-delete' && req.method === 'POST') {
          const body = await readBody(req)
          const payload = parseJsonBody<{ account_ids?: unknown[] }>(body)
          const ids = Array.isArray(payload.account_ids) ? payload.account_ids.map(Number) : []
          const before = mockAccounts.length
          for (let index = mockAccounts.length - 1; index >= 0; index -= 1) {
            if (ids.includes(Number(mockAccounts[index].id))) {
              mockAccounts.splice(index, 1)
            }
          }
          const deleted = before - mockAccounts.length
          sendJson(res, 200, success({
            success: deleted,
            failed: 0,
            success_ids: ids,
            failed_ids: [],
            results: ids.map((id) => ({ account_id: id, success: true }))
          }))
          return
        }

        if (path === '/api/v1/accounts/batch-refresh/async' && req.method === 'POST') {
          sendJson(res, 200, success({
            id: ++mockBatchTaskID,
            scope: 'user',
            operation: 'refresh',
            status: 'succeeded',
            total: 0,
            processed: 0,
            success: 0,
            failed: 0,
            created_by: mockUser.id,
            items: []
          }))
          return
        }

        if (path === '/api/v1/accounts/batch-revalidate-public-share/async' && req.method === 'POST') {
          sendJson(res, 200, success({
            id: ++mockBatchTaskID,
            scope: 'user',
            operation: 'revalidate-public-share',
            status: 'succeeded',
            total: 0,
            processed: 0,
            success: 0,
            failed: 0,
            created_by: mockUser.id,
            items: []
          }))
          return
        }

        if (path.startsWith('/api/v1/accounts/batch-tasks/')) {
          sendJson(res, 200, success({
            id: Number(path.split('/').pop() || 1),
            scope: 'user',
            operation: 'mock',
            status: 'succeeded',
            total: 0,
            processed: 0,
            success: 0,
            failed: 0,
            created_by: mockUser.id,
            items: []
          }))
          return
        }

        if (path === '/api/v1/accounts' && req.method === 'GET') {
          sendJson(res, 200, success(paginateItems(mockAccounts, url)))
          return
        }

        if (path === '/api/v1/accounts' && req.method === 'POST') {
          const body = await readBody(req)
          sendJson(res, 200, success(createMockAccount(parseJsonBody(body))))
          return
        }

        const accountMatch = path.match(/^\/api\/v1\/accounts\/(\d+)(?:\/([^/]+))?$/)
        if (accountMatch) {
          const id = Number(accountMatch[1])
          const action = accountMatch[2] || ''
          const account = mockAccounts.find((item) => Number(item.id) === id)
          if (!account) {
            sendJson(res, 404, { code: 404, message: 'account not found' })
            return
          }

          if (!action && req.method === 'GET') {
            sendJson(res, 200, success(account))
            return
          }

          if (!action && req.method === 'PUT') {
            const body = await readBody(req)
            Object.assign(account, parseJsonBody(body), { updated_at: nowISO() })
            sendJson(res, 200, success(account))
            return
          }

          if (!action && req.method === 'DELETE') {
            mockAccounts.splice(mockAccounts.indexOf(account), 1)
            sendJson(res, 200, success({ message: 'deleted' }))
            return
          }

          if (action === 'usage') {
            sendJson(res, 200, success(mockUsageInfo()))
            return
          }

          if (action === 'stats') {
            sendJson(res, 200, success({
              history: [],
              summary: {
                total_requests: 0,
                total_tokens: 0,
                total_cost: 0,
                avg_daily_requests: 0,
                avg_daily_tokens: 0,
                avg_daily_cost: 0
              }
            }))
            return
          }

          if (action === 'today-stats') {
            sendJson(res, 200, success({ requests: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0, cost: 0 }))
            return
          }

          if (action === 'test' && req.method === 'POST') {
            sendJson(res, 200, success({
              status: 'success',
              message: 'Local mock test passed',
              response: 'pong',
              latency: 42
            }))
            return
          }

          if (action === 'refresh' && req.method === 'POST') {
            sendJson(res, 200, success({ account, message: 'Local mock refreshed' }))
            return
          }

          if (action === 'set-privacy' && req.method === 'POST') {
            account.share_mode = 'private'
            account.share_status = 'none'
            account.updated_at = nowISO()
            sendJson(res, 200, success(account))
            return
          }

          if (action === 'revalidate-public-share' && req.method === 'POST') {
            account.share_status = 'approved'
            account.updated_at = nowISO()
            sendJson(res, 200, success(account))
            return
          }
        }

        if (path === '/api/v1/account-proxies' && req.method === 'GET') {
          sendJson(res, 200, success(mockProxies))
          return
        }

        if (path === '/api/v1/account-proxies' && req.method === 'POST') {
          const body = await readBody(req)
          const payload = parseJsonBody(body)
          const proxy = {
            id: ++mockProxyID,
            ...payload,
            created_at: nowISO(),
            updated_at: nowISO()
          }
          mockProxies.unshift(proxy)
          sendJson(res, 200, success(proxy))
          return
        }

        const proxyMatch = path.match(/^\/api\/v1\/account-proxies\/(\d+)(?:\/([^/]+))?$/)
        if (proxyMatch) {
          const id = Number(proxyMatch[1])
          const action = proxyMatch[2] || ''
          const proxy = mockProxies.find((item) => Number(item.id) === id)
          if (!proxy) {
            sendJson(res, 404, { code: 404, message: 'proxy not found' })
            return
          }

          if (!action && req.method === 'PUT') {
            const body = await readBody(req)
            Object.assign(proxy, parseJsonBody(body), { updated_at: nowISO() })
            sendJson(res, 200, success(proxy))
            return
          }

          if (!action && req.method === 'DELETE') {
            mockProxies.splice(mockProxies.indexOf(proxy), 1)
            sendJson(res, 200, success({ message: 'deleted' }))
            return
          }

          if (action === 'test' && req.method === 'POST') {
            sendJson(res, 200, success({
              success: true,
              message: 'Local mock proxy test passed',
              latency_ms: 42,
              ip_address: '127.0.0.1',
              country: 'Local',
              country_code: 'LO'
            }))
            return
          }

          if (action === 'quality-check' && req.method === 'POST') {
            sendJson(res, 200, success({
              overall_score: 100,
              success: true,
              message: 'Local mock quality check passed'
            }))
            return
          }
        }

        if (path === '/api/v1/playground/chat/completions' && req.method === 'POST') {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
          res.setHeader('Cache-Control', 'no-cache')
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { reasoning_content: '本地 mock 正在组织回答。' } }] })}\n\n`)
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: '这是本地 mock 的流式回复。\\n\\n- 支持 **Markdown**\\n- 支持代码块\\n- 支持图片 Markdown 预览\\n\\n```ts\\nconsole.log(\"ikik playground\")\\n```' } }] })}\n\n`)
          res.write(`data: ${JSON.stringify({ usage: { prompt_tokens: 32, completion_tokens: 58, total_tokens: 90, reasoning_tokens: 12 }, choices: [{ delta: {} }] })}\n\n`)
          res.write('data: [DONE]\n\n')
          res.end()
          return
        }

        next()
      })
    }
  }
}

/**
 * Vite 插件：开发模式下注入公开配置到 index.html
 * 与生产模式的后端注入行为保持一致，消除闪烁
 */
function injectPublicSettings(backendUrl: string, localSettings?: unknown): Plugin {
  return {
    name: 'inject-public-settings',
    apply: 'serve',
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (localSettings) {
          const settingsJson = JSON.stringify(localSettings).replace(/</g, '\\u003c')
          const script = `<script>window.__APP_CONFIG__=${settingsJson};window.__APP_CONFIG__.api_base_url=window.location.origin;</script>`
          return html.replace('</head>', `${script}\n</head>`)
        }

        try {
          const response = await fetch(`${backendUrl}/api/v1/settings/public`, {
            signal: AbortSignal.timeout(2000)
          })
          if (response.ok) {
            const data = await response.json()
            if (data.code === 0 && data.data) {
              const script = `<script>window.__APP_CONFIG__=${JSON.stringify(data.data)};</script>`
              return html.replace('</head>', `${script}\n</head>`)
            }
          }
        } catch (e) {
          console.warn('[vite] 无法获取公开配置，将回退到 API 调用:', (e as Error).message)
        }
        return html
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = process.env.VITE_DEV_PROXY_TARGET || env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080'
  const devPort = Number(process.env.VITE_DEV_PORT || env.VITE_DEV_PORT || 3000)
  const useLocalMocks = process.env.VITE_USE_LOCAL_MOCKS === 'true' || env.VITE_USE_LOCAL_MOCKS === 'true'

  return {
    plugins: [
      localMockApiPlugin(useLocalMocks),
      vue(),
      checker({
        typescript: true,
        vueTsc: true
      }),
      injectPublicSettings(backendUrl, useLocalMocks ? mockPublicSettings : undefined)
    ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 使用 vue-i18n 运行时版本，避免 CSP unsafe-eval 问题
      'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
    }
  },
  define: {
    // 启用 vue-i18n JIT 编译，在 CSP 环境下处理消息插值
    // JIT 编译器生成 AST 对象而非 JS 代码，无需 unsafe-eval
    __INTLIFY_JIT_COMPILATION__: true
  },
  build: {
    outDir: '../backend/internal/web/dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        /**
         * 手动分包配置
         * 分离第三方库并按功能合并应用代码，避免循环依赖
         */
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Vue 核心库
            if (
              id.includes('/vue/') ||
              id.includes('/vue-router/') ||
              id.includes('/pinia/') ||
              id.includes('/@vue/')
            ) {
              return 'vendor-vue'
            }

            // UI 工具库（较大，单独分离）
            if (id.includes('/@vueuse/')) {
              return 'vendor-ui'
            }

            // 图表库
            if (id.includes('/chart.js/') || id.includes('/vue-chartjs/')) {
              return 'vendor-chart'
            }

            // 国际化
            if (id.includes('/vue-i18n/') || id.includes('/@intlify/')) {
              return 'vendor-i18n'
            }

            // 其他小型第三方库合并
            return 'vendor-misc'
          }

          // 应用代码：按入口点自动分包，不手动干预
          // 这样可以避免循环依赖，同时保持合理的 chunk 数量
        }
      }
    }
  },
    server: {
      host: '0.0.0.0',
      port: devPort,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true
        },
        '/v1': {
          target: backendUrl,
          changeOrigin: true
        },
        '/setup': {
          target: backendUrl,
          changeOrigin: true
        }
      }
    }
  }
})
