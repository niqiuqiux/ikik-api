<template>
  <!-- Custom Home Content: Full Page Mode -->
  <div v-if="homeContent" class="min-h-screen">
    <!-- iframe mode -->
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <div v-else v-html="sanitizedHomeContent"></div>
  </div>

  <!-- Default Home Page -->
  <div v-else class="home-page">
    <header class="home-shell home-nav">
      <router-link class="brand" to="/home" aria-label="Home">
        <span class="brand-mark" aria-hidden="true">
          <img v-if="siteLogo" :src="siteLogo" alt="" />
          <svg v-else viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="homeLogoLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#e2ae8c" />
                <stop offset="100%" stop-color="#c66f4a" />
              </linearGradient>
              <linearGradient id="homeLogoDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#c66f4a" />
                <stop offset="100%" stop-color="#33251e" />
              </linearGradient>
            </defs>
            <path d="M 33 41 L 59 41 L 52 56 L 33 56 Z" fill="url(#homeLogoLight)" />
            <path d="M 33 56 L 52 56 L 43 83 L 33 83 Z" fill="url(#homeLogoDark)" />
            <rect x="16" y="19" width="20" height="64" rx="9" fill="url(#homeLogoLight)" />
            <path
              d="M 71 29 L 87 29 Q 91.5 29 89 34 L 61 90 Q 58.5 95 53.5 95 L 38 95 Q 33.5 95 36 90 L 64 34 Q 66.5 29 71 29 Z"
              fill="url(#homeLogoLight)"
            />
          </svg>
        </span>
        <span>{{ siteName }}</span>
      </router-link>

      <nav class="home-nav-links" aria-label="Home navigation">
        <router-link to="/home">{{ t('home.nav.home') }}</router-link>
        <router-link to="/key-usage">{{ t('home.nav.usage') }}</router-link>
      </nav>

      <div class="home-actions">
        <LocaleSwitcher />

        <button
          type="button"
          class="icon-action"
          :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          @click="toggleTheme"
        >
          <Icon v-if="isDark" name="sun" size="md" />
          <Icon v-else name="moon" size="md" />
        </button>

        <router-link
          v-if="isAuthenticated"
          :to="dashboardPath"
          class="button primary nav-cta"
        >
          <span class="user-dot">{{ userInitial }}</span>
          <span>{{ t('home.dashboard') }}</span>
        </router-link>
        <router-link v-else to="/login" class="button primary nav-cta">
          {{ t('home.login') }}
        </router-link>
      </div>
    </header>

    <main class="home-shell hero">
      <section class="copy">
        <span class="eyebrow">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <path
              d="M12 2v4m0 12v4M2 12h4m12 0h4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          {{ t('home.hero.eyebrow') }}
        </span>

        <i18n-t keypath="home.hero.title" tag="h1" class="home-title">
          <template #flow><span class="flow-text">{{ t('home.hero.titleHighlight') }}</span></template>
        </i18n-t>

        <p class="lead">
          {{ t('home.hero.lead', { siteName }) }}
        </p>

        <div class="hero-actions">
          <router-link :to="isAuthenticated ? dashboardPath : '/login'" class="button primary">
            {{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}
          </router-link>
          <router-link class="button secondary" to="/key-usage">{{ t('home.hero.viewUsage') }}</router-link>
        </div>
      </section>

      <aside class="visual" :aria-label="t('home.hero.consoleAria')">
        <div class="sphere sphere-one"></div>
        <div class="sphere sphere-two"></div>
        <div class="sphere sphere-three"></div>

        <div class="console-card">
          <div class="console-inner">
            <div class="side-rail">
              <div class="rail-logo">
                <img v-if="siteLogo" :src="siteLogo" alt="" />
                <svg v-else viewBox="0 0 100 100" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="railLogoLight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#e2ae8c" />
                      <stop offset="100%" stop-color="#c66f4a" />
                    </linearGradient>
                    <linearGradient id="railLogoDark" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#c66f4a" />
                      <stop offset="100%" stop-color="#33251e" />
                    </linearGradient>
                  </defs>
                  <path d="M 33 41 L 59 41 L 52 56 L 33 56 Z" fill="url(#railLogoLight)" />
                  <path d="M 33 56 L 52 56 L 43 83 L 33 83 Z" fill="url(#railLogoDark)" />
                  <rect x="16" y="19" width="20" height="64" rx="9" fill="url(#railLogoLight)" />
                  <path
                    d="M 71 29 L 87 29 Q 91.5 29 89 34 L 61 90 Q 58.5 95 53.5 95 L 38 95 Q 33.5 95 36 90 L 64 34 Q 66.5 29 71 29 Z"
                    fill="url(#railLogoLight)"
                  />
                </svg>
              </div>
              <i class="active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
              </i>
              <i>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </i>
              <i>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </i>
              <i>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  ></path>
                </svg>
              </i>
            </div>

            <div class="dashboard-board">
              <div class="metrics">
                <article class="metric center-align">
                  <span class="metric-icon">
                    <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                    </svg>
                  </span>
                  <b>{{ todayRequestsText }}</b>
                  <span>{{ t('home.console.todayRequests') }}</span>
                </article>

                <article class="metric">
                  <span class="metric-icon">
                    <svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </span>
                  <b>{{ todayTokensText }}</b>
                  <span>{{ t('home.console.todayTokens') }}</span>
                </article>

                <article class="metric">
                  <span class="metric-icon">
                    <svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      <polyline points="9 12 11 14 15 10"></polyline>
                    </svg>
                  </span>
                  <b>{{ successRateText }}</b>
                  <span>{{ t('home.console.successRate') }}</span>
                </article>

                <article class="metric center-align">
                  <span class="metric-icon">
                    <svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </span>
                  <b>{{ averageLatencyText }}</b>
                  <span>{{ t('home.console.avgLatency') }}</span>
                </article>
              </div>

              <div class="chart-card">
                <div class="chart-head">
                  <div class="chart-title">{{ t('home.console.requestTrend') }}</div>
                  <div class="chart-legends">
                    <span class="legend-one">{{ t('home.console.legendRequests') }}</span>
                    <span class="legend-two">{{ t('home.console.legendTokens') }}</span>
                  </div>
                </div>

                <svg viewBox="0 0 520 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="homeFadeDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#33251e" stop-opacity="0.2" />
                      <stop offset="100%" stop-color="#33251e" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient id="homeFadeBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#c66f4a" stop-opacity="0.2" />
                      <stop offset="100%" stop-color="#c66f4a" stop-opacity="0" />
                    </linearGradient>
                  </defs>

                  <path d="M0 30H520M0 70H520M0 110H520M0 150H520" stroke="#ede7dc" stroke-dasharray="4 4" stroke-width="1.5" />
                  <path d="M 0 145 C 40 145, 80 80, 120 80 C 160 80, 200 140, 240 140 C 290 140, 310 135, 350 135 C 390 135, 400 120, 440 120 C 480 120, 500 135, 520 135 L 520 160 L 0 160 Z" fill="url(#homeFadeBlue)" />
                  <path d="M 0 130 C 30 130, 50 115, 90 115 C 130 115, 170 140, 210 140 C 240 140, 255 45, 280 45 C 305 45, 320 130, 360 130 C 400 130, 420 110, 460 110 C 490 110, 500 125, 520 125 L 520 160 L 0 160 Z" fill="url(#homeFadeDark)" />
                  <path d="M 0 145 C 40 145, 80 80, 120 80 C 160 80, 200 140, 240 140 C 290 140, 310 135, 350 135 C 390 135, 400 120, 440 120 C 480 120, 500 135, 520 135" fill="none" stroke="#c66f4a" stroke-width="3" stroke-linecap="round" />
                  <path d="M 0 130 C 30 130, 50 115, 90 115 C 130 115, 170 140, 210 140 C 240 140, 255 45, 280 45 C 305 45, 320 130, 360 130 C 400 130, 420 110, 460 110 C 490 110, 500 125, 520 125" fill="none" stroke="#33251e" stroke-width="3" stroke-linecap="round" />
                  <circle cx="120" cy="80" r="4.5" fill="#fffaf3" stroke="#c66f4a" stroke-width="2.5" />
                  <circle cx="240" cy="140" r="4.5" fill="#fffaf3" stroke="#c66f4a" stroke-width="2.5" />
                  <circle cx="440" cy="120" r="4.5" fill="#fffaf3" stroke="#c66f4a" stroke-width="2.5" />
                  <circle cx="90" cy="115" r="4.5" fill="#fffaf3" stroke="#33251e" stroke-width="2.5" />
                  <circle cx="280" cy="45" r="4.5" fill="#fffaf3" stroke="#33251e" stroke-width="2.5" />
                  <circle cx="360" cy="130" r="4.5" fill="#fffaf3" stroke="#33251e" stroke-width="2.5" />
                  <circle cx="460" cy="110" r="4.5" fill="#fffaf3" stroke="#33251e" stroke-width="2.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="stack-3d">
          <svg viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 140L10 115L60 90L110 115L60 140Z" fill="rgba(198,111,74,0.2)" filter="blur(8px)" />
            <path d="M60 130L10 105V115L60 140L110 115V105L60 130Z" fill="#e6ddd0" />
            <path d="M60 130L10 105L60 80L110 105L60 130Z" fill="#fbf7ef" />
            <path d="M10 105L60 130V140L10 115V105Z" fill="#cfc2b3" />
            <circle cx="85" cy="118" r="2" fill="#c66f4a" />
            <circle cx="92" cy="115" r="2" fill="#c66f4a" />
            <path d="M60 100L10 75V85L60 110L110 85V75L60 100Z" fill="#e6ddd0" />
            <path d="M60 100L10 75L60 50L110 75L60 100Z" fill="#fffaf3" />
            <path d="M10 75L60 100V110L10 85V75Z" fill="#cfc2b3" />
            <circle cx="85" cy="88" r="2" fill="#c66f4a" />
            <circle cx="92" cy="85" r="2" fill="#c66f4a" />
            <path d="M60 70L10 45V55L60 80L110 55V45L60 70Z" fill="#e6ddd0" />
            <path d="M60 70L10 45L60 20L110 45L60 70Z" fill="#fffaf3" />
            <path d="M10 45L60 70V80L10 55V45Z" fill="#cfc2b3" />
            <path d="M60 35L45 42L52 46L60 41L68 46L75 42L60 35Z" fill="#c66f4a" opacity="0.86" />
          </svg>
        </div>
      </aside>
    </main>

    <section class="home-shell step-strip" :aria-label="t('home.steps.ariaLabel')">
      <i18n-t keypath="home.steps.heading" tag="h2">
        <template #steps><span class="flow-text">3</span></template>
        <template #minutes><span class="flow-text">2</span></template>
      </i18n-t>

      <div class="steps">
        <article class="step-card">
          <span class="step-num">1</span>
          <span class="step-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 19a6 6 0 0 0-12 0" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
              <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2.2" />
              <path d="M19 8v6M16 11h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            </svg>
          </span>
          <div>
            <h3>{{ t('home.steps.register.title') }}</h3>
            <p>{{ t('home.steps.register.desc') }}</p>
          </div>
        </article>

        <span class="step-arrow" aria-hidden="true"></span>

        <article class="step-card">
          <span class="step-num">2</span>
          <span class="step-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 7a5 5 0 0 1-6.8 4.7L6.5 19.4 3 21l1.6-3.5 7.7-7.7A5 5 0 1 1 21 7Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
              <path d="M17.5 6.5h.01" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
            </svg>
          </span>
          <div>
            <h3>{{ t('home.steps.apiKey.title') }}</h3>
            <p>{{ t('home.steps.apiKey.desc') }}</p>
          </div>
        </article>

        <span class="step-arrow" aria-hidden="true"></span>

        <article class="step-card">
          <span class="step-num">3</span>
          <span class="step-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="m8 16-4-4 4-4M16 8l4 4-4 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <div>
            <h3>{{ t('home.steps.baseUrl.title') }}</h3>
            <p>{{ t('home.steps.baseUrl.desc') }}</p>
          </div>
        </article>
      </div>
    </section>

    <footer class="home-shell home-footer">
      <section class="footer-intro">
        <div>
          <span class="footer-kicker">{{ t('home.footer.kicker') }}</span>
          <h2>{{ t('home.footer.title', { siteName }) }}</h2>
          <p>{{ t('home.footer.description') }}</p>
        </div>
        <router-link :to="isAuthenticated ? dashboardPath : '/login'" class="button primary footer-cta">
          {{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}
        </router-link>
      </section>

      <section class="footer-info-grid" :aria-label="t('home.footer.infoAria')">
        <article v-for="item in footerInfoItems" :key="item.title" class="footer-info-card">
          <span class="footer-info-icon" aria-hidden="true">
            <Icon :name="item.icon" size="md" />
          </span>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </article>
      </section>

      <section class="footer-meta">
        <div class="footer-meta-group">
          <span>{{ t('home.footer.baseUrlLabel') }}</span>
          <code>{{ publicBaseUrl }}</code>
        </div>
        <div class="footer-meta-links">
          <router-link to="/key-usage">{{ t('home.nav.usage') }}</router-link>
          <router-link :to="isAuthenticated ? '/models' : '/login'">{{ t('nav.modelMarket') }}</router-link>
          <router-link :to="isAuthenticated ? '/purchase' : '/login'">{{ t('nav.buySubscription') }}</router-link>
        </div>
      </section>

      <div class="footer-legal">
        <span>&copy; {{ currentYear }} {{ siteName }}. {{ t('home.footer.allRightsReserved') }}</span>
        <span>{{ t('home.footer.serviceNotice') }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DOMPurify from 'dompurify'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { getPublicTodayStats } from '@/api/usage'

const { t } = useI18n()

const authStore = useAuthStore()
const appStore = useAppStore()

// Site settings - directly from appStore (already initialized from injected config)
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'ikik-api')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const sanitizedHomeContent = computed(() => DOMPurify.sanitize(homeContent.value))

// Check if homeContent is a URL (for iframe display)
const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

// Theme
const isDark = ref(document.documentElement.classList.contains('dark'))

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => isAdmin.value ? '/admin/dashboard' : '/dashboard')
const userInitial = computed(() => {
  const user = authStore.user
  if (!user || !user.email) return ''
  return user.email.charAt(0).toUpperCase()
})
const publicBaseUrl = computed(() => {
  if (typeof window === 'undefined') return 'https://ikik.net'
  return window.location.origin
})
type FooterInfoIcon = 'bolt' | 'creditCard' | 'shield'
const footerInfoItems = computed<Array<{
  icon: FooterInfoIcon
  title: string
  description: string
}>>(() => [
  {
    icon: 'bolt',
    title: t('home.footer.cards.access.title'),
    description: t('home.footer.cards.access.desc')
  },
  {
    icon: 'creditCard',
    title: t('home.footer.cards.billing.title'),
    description: t('home.footer.cards.billing.desc')
  },
  {
    icon: 'shield',
    title: t('home.footer.cards.reliability.title'),
    description: t('home.footer.cards.reliability.desc')
  }
])

// Current year for footer
const currentYear = computed(() => new Date().getFullYear())

const publicTodayStats = ref<{
  today_requests: number
  today_tokens: number
  success_rate: number | null
  average_duration_ms: number | null
  average_first_token_ms: number | null
} | null>(null)

const todayRequestsText = computed(() => {
  if (!publicTodayStats.value) return '--'
  return formatInteger(publicTodayStats.value.today_requests)
})

const todayTokensText = computed(() => {
  if (!publicTodayStats.value) return '--'
  return formatCompactNumber(publicTodayStats.value.today_tokens)
})

const successRateText = computed(() => {
  const successRate = publicTodayStats.value?.success_rate
  if (typeof successRate !== 'number' || !Number.isFinite(successRate)) return '--'
  return `${successRate.toFixed(1).replace(/\.0$/, '')}%`
})

const averageLatencyText = computed(() => {
  const averageFirstTokenMs = publicTodayStats.value?.average_first_token_ms
  if (typeof averageFirstTokenMs !== 'number' || !Number.isFinite(averageFirstTokenMs)) return '--'
  const seconds = averageFirstTokenMs / 1000
  return `${seconds.toFixed(seconds >= 10 ? 1 : 2).replace(/\.?0+$/, '')}s`
})

function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return '--'
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 0
  }).format(value)
}

function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '--'

  const absValue = Math.abs(value)
  const units = [
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'K' }
  ]
  const unit = units.find((item) => absValue >= item.value)

  if (!unit) {
    return formatInteger(value)
  }

  return `${(value / unit.value).toFixed(2).replace(/\.?0+$/, '')}${unit.suffix}`
}

async function fetchPublicTodayStats() {
  try {
    publicTodayStats.value = await getPublicTodayStats()
  } catch (error) {
    publicTodayStats.value = null
    console.error('Failed to fetch public today usage stats:', error)
  }
}

// Toggle theme
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

onMounted(() => {
  initTheme()

  // Check auth state
  authStore.checkAuth()

  // Ensure public settings are loaded (will use cache if already loaded from injected config)
  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }

  fetchPublicTodayStats()
})
</script>

<style scoped>
.home-page {
  --bg: #f7f3ea;
  --surface: rgba(255, 250, 243, 0.84);
  --surface-strong: #fffaf3;
  --text: #26211c;
  --muted: #7c7167;
  --line: rgba(64, 48, 38, 0.1);
  --accent: #c66f4a;
  --accent-2: #e2ae8c;
  --accent-soft: rgba(198, 111, 74, 0.12);
  --shadow: 0 24px 70px rgba(70, 49, 35, 0.1);
  --serif: var(--font-home-display);

  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: var(--text);
  background:
    linear-gradient(180deg, rgba(255, 250, 243, 0.96), rgba(247, 243, 234, 0.98) 42%, #efe7dc),
    radial-gradient(circle at 72% 26%, rgba(198, 111, 74, 0.14), transparent 34%);
  font-family: var(--font-app);
  letter-spacing: 0;
}

.home-page::before {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(circle at 14% 20%, rgba(198, 111, 74, 0.14), transparent 28%),
    radial-gradient(circle at 84% 82%, rgba(127, 147, 98, 0.12), transparent 28%);
  animation: ambient-shift 18s ease-in-out infinite alternate;
  content: "";
  pointer-events: none;
}

:global(html.dark .home-page) {
  --surface: rgba(35, 29, 24, 0.78);
  --surface-strong: #241c18;
  --text: #f4efe7;
  --muted: #b8aa9a;
  --line: rgba(232, 218, 201, 0.14);
  --accent: #d58b65;
  --accent-2: #e8b090;
  --accent-soft: rgba(213, 139, 101, 0.16);
  --shadow: 0 28px 82px rgba(0, 0, 0, 0.36);

  background:
    linear-gradient(180deg, #171310 0%, #211915 44%, #2a201b 100%),
    radial-gradient(circle at 72% 26%, rgba(213, 139, 101, 0.18), transparent 34%);
}

:global(html.dark .home-page)::before {
  background:
    radial-gradient(circle at 14% 20%, rgba(213, 139, 101, 0.18), transparent 30%),
    radial-gradient(circle at 84% 82%, rgba(127, 147, 98, 0.12), transparent 30%),
    radial-gradient(circle at 42% 88%, rgba(198, 111, 74, 0.1), transparent 28%);
  opacity: 0.88;
}

.home-shell {
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 36px));
  margin: 0 auto;
}

.home-nav {
  display: flex;
  min-height: 82px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  font-size: 1.15rem;
  font-weight: 640;
}

.brand-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(198, 111, 74, 0.14);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(198, 111, 74, 0.12);
  backdrop-filter: blur(16px);
}

:global(html.dark .home-page .brand-mark) {
  border-color: rgba(232, 218, 201, 0.16);
  background: rgba(35, 29, 24, 0.72);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.26);
}

.brand-mark img,
.brand-mark svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.home-nav-links {
  display: none;
  align-items: center;
  gap: 42px;
  color: var(--muted);
  font-size: 0.95rem;
  font-weight: 650;
}

.home-nav-links a {
  position: relative;
  transition: color 180ms ease;
}

.home-nav-links a:hover,
.home-nav-links a.router-link-active {
  color: var(--accent);
}

.home-nav-links a.router-link-active::after {
  position: absolute;
  right: 0;
  bottom: -30px;
  left: 0;
  height: 2px;
  border-radius: 99px;
  background: var(--accent);
  content: "";
}

.home-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-action {
  display: inline-flex;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(198, 111, 74, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.56);
  color: var(--muted);
  transition:
    color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
  backdrop-filter: blur(14px);
}

:global(html.dark .home-page .icon-action) {
  border-color: rgba(232, 218, 201, 0.16);
  background: rgba(35, 29, 24, 0.7);
  color: #e8b090;
}

.icon-action:hover {
  transform: translateY(-1px);
  color: var(--accent);
  background: rgba(255, 255, 255, 0.78);
}

.button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0 22px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button.primary {
  background: #33251e;
  color: #fffaf3;
  box-shadow: 0 10px 24px rgba(51, 37, 30, 0.16);
}

.button.secondary {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.72);
  color: var(--text);
  backdrop-filter: blur(14px);
}

:global(html.dark .home-page .button.primary) {
  background: #f4efe7;
  color: #171310;
  box-shadow: 0 18px 44px rgba(244, 239, 231, 0.16);
}

:global(html.dark .home-page .button.secondary) {
  border-color: rgba(232, 218, 201, 0.16);
  background: rgba(35, 29, 24, 0.62);
  color: #f4efe7;
}

.user-dot {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 0.72rem;
}

.hero {
  display: grid;
  min-height: 570px;
  align-items: center;
  gap: 52px;
  padding: 52px 0 34px;
}

.copy {
  max-width: 640px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  padding: 9px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  animation: rise 620ms ease both;
}

.eyebrow svg {
  width: 16px;
  height: 16px;
}

.home-title {
  max-width: 660px;
  margin: 30px 0 22px;
  font-family: var(--serif);
  font-size: clamp(2.85rem, 7vw, 4.5rem);
  font-weight: 540;
  line-height: 1.08;
  letter-spacing: -0.018em;
  animation: rise 700ms 80ms ease both;
}

.home-title span {
  display: inline-block;
}

.flow-text {
  background: linear-gradient(100deg, #c66f4a 0%, #e2ae8c 28%, #33251e 56%, #c66f4a 100%);
  background-size: 260% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: text-flow 4.8s ease-in-out infinite;
}

:global(html.dark .home-page .flow-text) {
  background-image: linear-gradient(100deg, #f1c5a9 0%, #f8e6d5 28%, #d58b65 56%, #e8b090 100%);
}

.lead {
  max-width: 560px;
  margin: 0 0 34px;
  color: var(--muted);
  font-size: clamp(1rem, 1.8vw, 1.22rem);
  font-weight: 440;
  line-height: 1.82;
  animation: rise 760ms 150ms ease both;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  animation: rise 820ms 220ms ease both;
}

.visual {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 480px;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  animation: rise 780ms 160ms ease both;
}

.sphere {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fffaf3, #ead9c8 60%, #c98a62);
  box-shadow: 0 10px 20px rgba(198, 111, 74, 0.15), inset 0 -5px 15px rgba(198, 111, 74, 0.1);
}

.sphere-one {
  top: 10%;
  right: 15%;
  width: 40px;
  height: 40px;
  filter: blur(1px);
}

.sphere-two {
  top: 25%;
  right: 5%;
  width: 18px;
  height: 18px;
}

.sphere-three {
  right: -2%;
  bottom: 35%;
  width: 28px;
  height: 28px;
  background: radial-gradient(circle at 30% 30%, #fffaf3, #e6ddd0 60%, #cfc2b3);
}

.console-card {
  width: min(100%, 720px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.75);
  box-shadow:
    -25px 35px 65px rgba(70, 49, 35, 0.08),
    -10px 15px 25px rgba(198, 111, 74, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  transform: rotateX(12deg) rotateY(-16deg) rotateZ(4deg);
  transform-style: preserve-3d;
  transition: transform 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(20px);
}

:global(html.dark .home-page .console-card) {
  border-color: rgba(232, 218, 201, 0.16);
  background: rgba(35, 29, 24, 0.74);
  box-shadow:
    -25px 35px 70px rgba(0, 0, 0, 0.34),
    -10px 15px 28px rgba(213, 139, 101, 0.08),
    inset 0 0 0 1px rgba(232, 218, 201, 0.08);
}

.console-card:hover {
  transform: rotateX(8deg) rotateY(-10deg) rotateZ(2deg) translateY(-10px);
}

.console-inner {
  display: grid;
  grid-template-columns: 78px 1fr;
  min-height: 420px;
}

.side-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border-right: 1px solid rgba(64, 48, 38, 0.06);
  border-radius: 28px 0 0 28px;
  background: rgba(255, 255, 255, 0.4);
  padding: 24px 0;
}

:global(html.dark .home-page .side-rail) {
  border-right-color: rgba(232, 218, 201, 0.1);
  background: rgba(23, 19, 16, 0.34);
}

.rail-logo {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  overflow: hidden;
  margin-bottom: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 10px 24px rgba(198, 111, 74, 0.12);
}

.rail-logo img,
.rail-logo svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

:global(html.dark .home-page .rail-logo) {
  background: rgba(35, 29, 24, 0.72);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
}

.side-rail i {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: var(--muted);
}

.side-rail i.active {
  background: var(--accent-soft);
  color: var(--accent);
  box-shadow: 0 4px 12px rgba(198, 111, 74, 0.1);
}

.side-rail svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.dashboard-board {
  padding: 32px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric {
  position: relative;
  display: flex;
  min-height: 116px;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(64, 48, 38, 0.05);
  border-radius: 20px;
  background: #fffaf3;
  padding: 16px 14px;
  box-shadow: 0 10px 30px rgba(70, 49, 35, 0.04);
  transition: transform 300ms ease;
}

:global(html.dark .home-page .metric),
:global(html.dark .home-page .chart-card),
:global(html.dark .home-page .step-card) {
  border-color: rgba(232, 218, 201, 0.12);
  background: rgba(35, 29, 24, 0.82);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.18);
}

.metric:hover {
  transform: translateY(-3px);
}

.metric.center-align {
  align-items: center;
  text-align: center;
}

.metric-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  margin-bottom: 12px;
  border-radius: 10px;
}

.metric:nth-child(1) .metric-icon {
  background: #f7e8db;
  color: #c66f4a;
}

.metric:nth-child(2) .metric-icon {
  background: #f4efe4;
  color: #a85a3c;
}

.metric:nth-child(3) .metric-icon {
  background: #e8eddc;
  color: #64754d;
}

.metric:nth-child(4) .metric-icon {
  background: #f0e5d9;
  color: #7a7066;
}

.metric-icon svg {
  width: 16px;
  height: 16px;
}

.metric b {
  color: var(--text);
  font-size: 1.25rem;
  line-height: 1.1;
}

.metric span:last-child {
  margin-top: 6px;
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 650;
  white-space: nowrap;
}

:global(html.dark .home-page .metric:nth-child(1) .metric-icon) {
  background: rgba(213, 139, 101, 0.18);
  color: #f1c5a9;
}

:global(html.dark .home-page .metric:nth-child(2) .metric-icon) {
  background: rgba(198, 111, 74, 0.16);
  color: #e8b090;
}

:global(html.dark .home-page .metric:nth-child(3) .metric-icon) {
  background: rgba(127, 147, 98, 0.18);
  color: #cdd9b0;
}

:global(html.dark .home-page .metric:nth-child(4) .metric-icon) {
  background: rgba(232, 218, 201, 0.12);
  color: #d8cec0;
}

.chart-card {
  border: 1px solid rgba(64, 48, 38, 0.05);
  border-radius: 20px;
  background: #fffaf3;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(70, 49, 35, 0.04);
}

.chart-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.chart-title {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 800;
}

.chart-legends {
  display: flex;
  gap: 16px;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 650;
}

.chart-legends span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-legends span::before {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  content: "";
}

.legend-one::before {
  background: var(--accent);
}

.legend-two::before {
  background: #33251e;
}

.chart-card svg {
  display: block;
  width: 100%;
  height: 140px;
}

:global(html.dark .home-page .chart-card path[stroke="#ede7dc"]) {
  stroke: rgba(232, 218, 201, 0.14);
}

:global(html.dark .home-page .chart-card path[stroke="#33251e"]),
:global(html.dark .home-page .chart-card circle[stroke="#33251e"]) {
  stroke: #e8b090;
}

:global(html.dark .home-page .legend-two)::before {
  background: #e8b090;
}

.stack-3d {
  position: absolute;
  right: -10px;
  bottom: -30px;
  z-index: 10;
  width: 140px;
  height: 180px;
  transform: translateZ(80px);
  transition: transform 400ms ease;
}

.stack-3d:hover {
  transform: translateZ(100px) translateY(-5px);
}

.stack-3d svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(-10px 20px 20px rgba(198, 111, 74, 0.22));
}

.step-strip {
  margin: 20px auto 72px;
  border: 1px solid var(--line);
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.66);
  padding: 40px 32px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

:global(html.dark .home-page .step-strip) {
  border-color: rgba(232, 218, 201, 0.14);
  background: rgba(35, 29, 24, 0.58);
}

.step-strip h2 {
  margin: 0 0 32px;
  text-align: center;
  font-family: var(--serif);
  font-size: clamp(1.4rem, 2.4vw, 1.75rem);
  font-weight: 520;
  letter-spacing: -0.01em;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.step-card {
  position: relative;
  display: flex;
  min-height: 104px;
  flex: 1;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(64, 48, 38, 0.05);
  border-radius: 20px;
  background: #fffaf3;
  padding: 20px 24px;
  box-shadow: 0 10px 30px rgba(70, 49, 35, 0.04);
  transition: transform 300ms ease;
}

.step-card:hover {
  transform: translateY(-3px);
}

.step-num {
  position: absolute;
  top: -12px;
  left: 52px;
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px #ffffff;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  transform: translateX(-50%);
}

:global(html.dark .home-page .step-num) {
  box-shadow: 0 0 0 4px #241c18;
}

.step-icon {
  display: grid;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 16px;
  background: var(--accent-soft);
  color: var(--accent);
}

.step-icon svg {
  width: 28px;
  height: 28px;
}

.step-card h3 {
  margin: 0 0 6px;
  color: var(--text);
  font-size: 1.06rem;
  font-weight: 620;
}

.step-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.5;
}

.step-arrow {
  position: relative;
  width: 32px;
  height: 2px;
  flex-shrink: 0;
  background-image: linear-gradient(to right, #cfc2b3 50%, transparent 50%);
  background-size: 8px 100%;
}

.step-arrow::after {
  position: absolute;
  top: 50%;
  right: -4px;
  border-width: 4px 0 4px 6px;
  border-style: solid;
  border-color: transparent transparent transparent #cfc2b3;
  content: "";
  transform: translateY(-50%);
}

.home-footer {
  display: grid;
  gap: 20px;
  padding: 34px 0 24px;
  color: #9a8d80;
  font-size: 0.88rem;
}

:global(html.dark .home-page .home-footer) {
  color: #b8aa9a;
}

.footer-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(64, 48, 38, 0.06);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255, 250, 243, 0.96), rgba(247, 239, 228, 0.86)),
    radial-gradient(circle at 12% 20%, rgba(198, 111, 74, 0.12), transparent 36%);
  padding: 26px;
  box-shadow: 0 18px 44px rgba(70, 49, 35, 0.06);
}

:global(html.dark .home-page .footer-intro) {
  border-color: rgba(244, 239, 231, 0.08);
  background:
    linear-gradient(135deg, rgba(38, 30, 25, 0.94), rgba(29, 23, 20, 0.9)),
    radial-gradient(circle at 12% 20%, rgba(198, 111, 74, 0.18), transparent 38%);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.16);
}

.footer-kicker {
  display: inline-flex;
  margin-bottom: 10px;
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.footer-intro h2 {
  margin: 0;
  color: var(--text);
  font-size: clamp(1.45rem, 2vw, 2.15rem);
  font-weight: 720;
  letter-spacing: 0;
}

.footer-intro p {
  max-width: 720px;
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 0.96rem;
  line-height: 1.7;
}

.footer-cta {
  flex-shrink: 0;
  white-space: nowrap;
}

.footer-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.footer-info-card {
  display: flex;
  gap: 14px;
  min-width: 0;
  border: 1px solid rgba(64, 48, 38, 0.05);
  border-radius: 18px;
  background: rgba(255, 250, 243, 0.72);
  padding: 18px;
}

:global(html.dark .home-page .footer-info-card) {
  border-color: rgba(244, 239, 231, 0.08);
  background: rgba(36, 28, 24, 0.72);
}

.footer-info-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border-radius: 12px;
  background: rgba(198, 111, 74, 0.1);
  color: var(--accent);
}

.footer-info-card h3 {
  margin: 0;
  color: var(--text);
  font-size: 0.98rem;
  font-weight: 680;
  letter-spacing: 0;
}

.footer-info-card p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.62;
}

.footer-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-top: 1px solid rgba(64, 48, 38, 0.06);
  padding-top: 16px;
}

:global(html.dark .home-page .footer-meta) {
  border-top-color: rgba(244, 239, 231, 0.08);
}

.footer-meta-group {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
}

.footer-meta-group span {
  color: #8c7d70;
  font-weight: 650;
}

.footer-meta-group code {
  max-width: min(54vw, 520px);
  overflow: hidden;
  border: 1px solid rgba(64, 48, 38, 0.08);
  border-radius: 999px;
  background: rgba(255, 250, 243, 0.8);
  padding: 7px 11px;
  color: var(--text);
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(html.dark .home-page .footer-meta-group code) {
  border-color: rgba(244, 239, 231, 0.08);
  background: rgba(244, 239, 231, 0.05);
}

.footer-meta-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.footer-meta-links a {
  border-radius: 999px;
  padding: 7px 11px;
  color: var(--muted);
  font-weight: 650;
  text-decoration: none;
}

.footer-meta-links a:hover {
  background: rgba(198, 111, 74, 0.08);
  color: var(--accent);
}

.footer-legal {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #9a8d80;
  font-size: 0.82rem;
}

:global(html.dark .home-page .footer-legal) {
  color: #b8aa9a;
}

@keyframes ambient-shift {
  0% {
    transform: translate3d(-2%, -1%, 0) scale(1);
  }
  100% {
    transform: translate3d(2%, 1%, 0) scale(1.04);
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes text-flow {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@media (min-width: 768px) {
  .home-shell {
    width: min(1180px, calc(100% - 48px));
  }

  .home-nav-links {
    display: flex;
  }

  .hero {
    grid-template-columns: minmax(0, 0.92fr) minmax(440px, 1.08fr);
  }
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    gap: 26px;
    padding: 42px 0 28px;
  }

  .visual {
    perspective: none;
  }

  .console-card {
    transform: none !important;
  }

  .stack-3d,
  .sphere {
    display: none;
  }

  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .steps {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
  }

  .step-arrow {
    display: none;
  }

  .step-num {
    left: 50%;
  }

  .footer-intro {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-info-grid {
    grid-template-columns: 1fr;
  }

  .footer-meta,
  .footer-legal {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-meta-links {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .home-actions :deep(.locale-switcher) {
    display: none;
  }

  .home-nav {
    min-height: 72px;
  }

  .brand span:last-child {
    max-width: 126px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nav-cta {
    display: none;
  }

  .visual {
    min-height: auto;
  }

  .console-inner {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .side-rail {
    display: none;
  }

  .dashboard-board,
  .chart-card {
    padding: 20px;
  }

  .footer-intro {
    border-radius: 20px;
    padding: 22px;
  }

  .footer-meta-group {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-meta-group code {
    max-width: 100%;
  }
}

@media (max-width: 430px) {
  .home-shell {
    width: min(100% - 28px, 1180px);
  }

  .home-title {
    font-size: 2.6rem;
  }

  .hero-actions .button {
    width: 100%;
  }

  .metrics {
    grid-template-columns: 1fr;
  }

  .chart-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .step-strip {
    padding: 34px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
