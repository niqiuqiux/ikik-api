<template>
  <div class="auth-shell">
    <div class="auth-backdrop"></div>

    <!-- Content Container -->
    <div class="auth-content">
      <!-- Logo/Brand -->
      <div class="auth-brand">
        <!-- Custom Logo or Default Logo -->
        <template v-if="settingsLoaded">
          <div class="auth-logo">
            <img :src="siteLogo || '/logo.svg'" alt="Logo" class="h-full w-full object-contain" />
          </div>
          <h1 class="auth-title">
            {{ siteName }}
          </h1>
          <p class="auth-subtitle">
            {{ siteSubtitle }}
          </p>
        </template>
      </div>

      <!-- Card Container -->
      <div class="auth-card">
        <slot />
      </div>

      <!-- Footer Links -->
      <div class="auth-footer">
        <slot name="footer" />
      </div>

      <!-- Copyright -->
      <div class="auth-copyright">
        &copy; {{ currentYear }} {{ siteName }}. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'

const appStore = useAppStore()

const siteName = computed(() => appStore.siteName || 'ikik-api')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || 'Subscription to API Conversion Platform')
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)

const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style scoped>
.auth-shell {
  position: relative;
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 2rem;
  color: #26211c;
  background:
    linear-gradient(90deg, rgba(255, 250, 243, 0.94) 0%, rgba(255, 250, 243, 0.94) 42%, rgba(245, 238, 228, 0.96) 42%, rgba(245, 238, 228, 0.96) 100%),
    #f7f3ea;
  font-family: var(--font-app);
}

.auth-shell::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    repeating-linear-gradient(0deg, transparent 0, transparent 39px, rgba(70, 49, 35, 0.026) 40px),
    repeating-linear-gradient(90deg, transparent 0, transparent 39px, rgba(70, 49, 35, 0.018) 40px);
  opacity: 0.78;
  content: "";
  pointer-events: none;
}

.auth-shell::after {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.08) 44%, rgba(235, 224, 211, 0.32));
  content: "";
  pointer-events: none;
}

.auth-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(115deg, rgba(198, 111, 74, 0.08) 0%, rgba(198, 111, 74, 0.02) 28%, transparent 56%);
  pointer-events: none;
}

.auth-content {
  position: relative;
  z-index: 1;
  display: grid;
  width: min(100%, 72rem);
  min-height: min(42rem, calc(100vh - 4rem));
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 30rem);
  align-items: center;
  gap: 4rem;
  animation: auth-rise 620ms ease both;
}

.auth-brand {
  grid-row: 1 / span 3;
  align-self: center;
  max-width: 28rem;
  text-align: left;
}

.auth-brand::after {
  display: block;
  width: 4.5rem;
  height: 2px;
  margin-top: 1.5rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #c66f4a, rgba(127, 147, 98, 0.52));
  content: "";
}

.auth-logo {
  display: flex;
  width: 3.5rem;
  height: 3.5rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(198, 111, 74, 0.18);
  border-radius: 0.95rem;
  background: rgba(255, 253, 247, 0.88);
  box-shadow: 0 14px 32px rgba(70, 49, 35, 0.1);
}

.auth-title {
  margin: 0.875rem 0 0;
  color: #2f2923;
  font-family: var(--font-home-display);
  font-size: 2.25rem;
  font-weight: 820;
  line-height: 1.12;
  letter-spacing: 0;
}

.auth-subtitle {
  max-width: 25rem;
  margin-top: 0.625rem;
  color: #7c7167;
  font-size: 0.95rem;
  line-height: 1.6;
}

.auth-card {
  grid-column: 2;
  border: 1px solid rgba(119, 92, 72, 0.18);
  border-radius: 1rem;
  background: rgba(255, 250, 243, 0.9);
  padding: 2.125rem;
  box-shadow:
    0 24px 64px rgba(70, 49, 35, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
}

.auth-footer {
  grid-column: 2;
  margin-top: 1.25rem;
  color: #7c7167;
  text-align: center;
  font-size: 0.875rem;
}

.auth-copyright {
  grid-column: 2;
  margin-top: 1.5rem;
  color: #9a8d80;
  text-align: center;
  font-size: 0.75rem;
}

.auth-card :deep(h2) {
  color: #26211c;
  font-family: var(--font-home-display);
  font-size: 1.625rem;
  line-height: 1.2;
  letter-spacing: 0;
}

.auth-card :deep(p),
.auth-card :deep(.text-gray-500),
.auth-card :deep(.dark\:text-dark-400) {
  color: #7c7167;
}

.auth-card :deep(.input-label) {
  color: #4c2921;
}

.auth-card :deep(.input) {
  min-height: 2.875rem;
  border-color: rgba(119, 92, 72, 0.18);
  background: rgba(255, 253, 247, 0.92);
  color: #26211c;
  box-shadow:
    0 8px 22px rgba(70, 49, 35, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.auth-card :deep(.input::placeholder) {
  color: #aa9d8f;
}

.auth-card :deep(.input:focus) {
  border-color: #c66f4a;
  box-shadow:
    0 0 0 3px rgba(198, 111, 74, 0.14),
    0 12px 32px rgba(198, 111, 74, 0.08);
}

.auth-card :deep(.text-gray-400),
.auth-card :deep(.dark\:text-dark-500),
.auth-card :deep(.auth-password-toggle) {
  color: #aa9d8f;
}

.auth-card :deep(.auth-password-toggle:hover) {
  color: #6f5f51;
}

.auth-card :deep(.btn-primary) {
  min-height: 2.875rem;
  border-radius: 0.875rem;
  background: #171717;
  color: #fffaf3;
  box-shadow: 0 14px 34px rgba(23, 23, 23, 0.18);
}

.auth-card :deep(.btn-primary:hover) {
  background: #000000;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.24);
}

.auth-card :deep(.text-primary-600),
.auth-footer :deep(.text-primary-600),
.auth-card :deep(.dark\:text-primary-400),
.auth-footer :deep(.dark\:text-primary-400) {
  color: #a85a3c;
}

.auth-card :deep(.hover\:text-primary-500:hover),
.auth-footer :deep(.hover\:text-primary-500:hover),
.auth-card :deep(.dark\:hover\:text-primary-300:hover),
.auth-footer :deep(.dark\:hover\:text-primary-300:hover) {
  color: #864632;
}

.auth-card :deep(.bg-gray-200),
.auth-card :deep(.dark\:bg-dark-700) {
  background-color: rgba(198, 111, 74, 0.12);
}

:global(html.dark .auth-shell) {
  color: #f4efe7;
  background:
    linear-gradient(90deg, rgba(27, 22, 18, 0.98) 0%, rgba(27, 22, 18, 0.98) 42%, rgba(20, 16, 13, 0.96) 42%, rgba(20, 16, 13, 0.96) 100%),
    #171310;
}

:global(html.dark .auth-shell::before) {
  background:
    repeating-linear-gradient(0deg, transparent 0, transparent 39px, rgba(232, 218, 201, 0.035) 40px),
    repeating-linear-gradient(90deg, transparent 0, transparent 39px, rgba(232, 218, 201, 0.024) 40px);
  opacity: 0.44;
}

:global(html.dark .auth-shell::after) {
  background: linear-gradient(180deg, rgba(244, 239, 231, 0.05), rgba(23, 19, 16, 0.16) 48%, rgba(0, 0, 0, 0.28));
}

:global(html.dark .auth-backdrop) {
  background: linear-gradient(115deg, rgba(213, 139, 101, 0.11) 0%, rgba(213, 139, 101, 0.03) 28%, transparent 56%);
}

:global(html.dark .auth-logo) {
  border-color: rgba(232, 218, 201, 0.16);
  background: rgba(35, 29, 24, 0.82);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.26);
}

:global(html.dark .auth-title) {
  color: #f4efe7;
}

:global(html.dark .auth-brand::after) {
  background: linear-gradient(90deg, #e8b090, rgba(154, 168, 118, 0.56));
}

:global(html.dark .auth-subtitle),
:global(html.dark .auth-footer),
:global(html.dark .auth-copyright) {
  color: #b8aa9a;
}

:global(html.dark .auth-card) {
  border-color: rgba(232, 218, 201, 0.14);
  background: rgba(35, 29, 24, 0.82);
  box-shadow:
    0 28px 78px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

:global(html.dark .auth-card h2) {
  color: #f4efe7;
}

:global(html.dark .auth-card p),
:global(html.dark .auth-card .text-gray-500),
:global(html.dark .auth-card .dark\:text-dark-400) {
  color: #b8aa9a;
}

:global(html.dark .auth-card .input-label) {
  color: #f1dfce;
}

:global(html.dark .auth-card .input) {
  border-color: rgba(232, 218, 201, 0.16);
  background: rgba(23, 19, 16, 0.48);
  color: #f4efe7;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
}

:global(html.dark .auth-card .input::placeholder) {
  color: #786d62;
}

:global(html.dark .auth-card .input:focus) {
  border-color: #d58b65;
  box-shadow:
    0 0 0 3px rgba(213, 139, 101, 0.18),
    0 12px 32px rgba(198, 111, 74, 0.12);
}

:global(html.dark .auth-card .text-gray-400),
:global(html.dark .auth-card .dark\:text-dark-500),
:global(html.dark .auth-card .auth-password-toggle) {
  color: #786d62;
}

:global(html.dark .auth-card .auth-password-toggle:hover) {
  color: #d9cbbb;
}

:global(html.dark .auth-card .btn-primary) {
  background: #f4efe7;
  color: #171310;
  box-shadow: 0 16px 38px rgba(244, 239, 231, 0.16);
}

:global(html.dark .auth-card .btn-primary:hover) {
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(255, 255, 255, 0.2);
}

:global(html.dark .auth-card .text-primary-600),
:global(html.dark .auth-footer .text-primary-600),
:global(html.dark .auth-card .dark\:text-primary-400),
:global(html.dark .auth-footer .dark\:text-primary-400) {
  color: #e8b090;
}

:global(html.dark .auth-card .hover\:text-primary-500:hover),
:global(html.dark .auth-footer .hover\:text-primary-500:hover),
:global(html.dark .auth-card .dark\:hover\:text-primary-300:hover),
:global(html.dark .auth-footer .dark\:hover\:text-primary-300:hover) {
  color: #f8e6d5;
}

:global(html.dark .auth-card .bg-gray-200),
:global(html.dark .auth-card .dark\:bg-dark-700) {
  background-color: rgba(232, 218, 201, 0.14);
}

@keyframes auth-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 860px) {
  .auth-shell {
    align-items: flex-start;
    padding: 1.25rem;
    background: #f7f3ea;
  }

  .auth-content {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .auth-brand,
  .auth-card,
  .auth-footer,
  .auth-copyright {
    grid-column: 1;
  }

  .auth-brand {
    grid-row: auto;
    max-width: none;
    margin-top: 0.25rem;
    text-align: center;
  }

  .auth-brand::after {
    margin-right: auto;
    margin-left: auto;
  }

  .auth-logo {
    margin-right: auto;
    margin-left: auto;
  }

  .auth-subtitle {
    max-width: 22rem;
    margin-right: auto;
    margin-left: auto;
  }

  :global(html.dark .auth-shell) {
    background: #171310;
  }
}

@media (max-width: 430px) {
  .auth-shell {
    padding: 0.875rem;
  }

  .auth-card {
    padding: 1.25rem;
  }

  .auth-title {
    font-size: 1.625rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-content {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
