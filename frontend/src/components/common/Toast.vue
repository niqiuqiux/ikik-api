<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed left-3 right-3 top-3 z-[9999] space-y-3 sm:left-auto sm:right-4 sm:top-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto w-full overflow-hidden rounded-lg border shadow-[0_18px_45px_-28px_rgba(66,45,27,0.65)] backdrop-blur',
            'bg-[#fffaf3]/95 text-[#2f2923] dark:bg-[#1f1b16]/95 dark:text-[#f7f0e8]',
            'border-[#eadfd1] dark:border-[#4b4035]',
            'sm:w-[22rem]'
          ]"
        >
          <div class="p-4">
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div class="mt-0.5 flex-shrink-0">
                <div :class="['rounded-md p-1.5', getIconWrapColor(toast.type)]">
                  <Icon
                    :name="getToastIconName(toast.type)"
                    size="sm"
                    :class="getIconColor(toast.type)"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <!-- Content -->
              <div class="min-w-0 flex-1">
                <p v-if="toast.title" class="text-sm font-semibold text-[#2f2923] dark:text-[#f7f0e8]">
                  {{ toast.title }}
                </p>
                <p
                  :class="[
                    'text-sm leading-relaxed',
                    toast.title
                      ? 'mt-1 text-[#6f6257] dark:text-[#d5cabd]'
                      : 'text-[#2f2923] dark:text-[#f7f0e8]'
                  ]"
                >
                  {{ toast.message }}
                </p>
              </div>

              <!-- Close button -->
              <button
                @click="removeToast(toast.id)"
                class="-m-1 flex-shrink-0 rounded-md p-1 text-[#9b8a7a] transition-colors hover:bg-[#f1e7dc] hover:text-[#3d332a] dark:text-[#a79786] dark:hover:bg-[#322a22] dark:hover:text-[#f7f0e8]"
                aria-label="Close notification"
              >
                <Icon name="x" size="sm" />
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <div v-if="toast.duration" class="h-1 bg-[#efe5d8] dark:bg-[#3a3129]">
            <div
              :class="['h-full toast-progress', getProgressBarColor(toast.type)]"
              :style="{ animationDuration: `${toast.duration}ms` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const toasts = computed(() => appStore.toasts)

const getToastIconName = (type: string): 'checkCircle' | 'xCircle' | 'exclamationTriangle' | 'infoCircle' => {
  switch (type) {
    case 'success':
      return 'checkCircle'
    case 'error':
      return 'xCircle'
    case 'warning':
      return 'exclamationTriangle'
    case 'info':
    default:
      return 'infoCircle'
  }
}

const getIconColor = (type: string): string => {
  const colors: Record<string, string> = {
    success: 'text-[#287750]',
    error: 'text-[#b42318]',
    warning: 'text-[#a15c07]',
    info: 'text-[#9a5a38]'
  }
  return colors[type] || colors.info
}

const getIconWrapColor = (type: string): string => {
  const colors: Record<string, string> = {
    success: 'bg-[#eaf5ee] dark:bg-[#20392b]',
    error: 'bg-[#fff0ed] dark:bg-[#3d241f]',
    warning: 'bg-[#fff3d6] dark:bg-[#3c2c16]',
    info: 'bg-[#f4ebe1] dark:bg-[#3b2d24]'
  }
  return colors[type] || colors.info
}

const getProgressBarColor = (type: string): string => {
  const colors: Record<string, string> = {
    success: 'bg-[#2f855a]',
    error: 'bg-[#c2412d]',
    warning: 'bg-[#d89122]',
    info: 'bg-[#d97757]'
  }
  return colors[type] || colors.info
}

const removeToast = (id: string) => {
  appStore.hideToast(id)
}
</script>

<style scoped>
.toast-progress {
  width: 100%;
  animation-name: toast-progress-shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes toast-progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
