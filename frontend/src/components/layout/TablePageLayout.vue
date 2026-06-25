<template>
  <div class="table-page-layout" :class="{ 'mobile-mode': isMobile }">
    <!-- 固定区域：操作按钮 -->
    <div v-if="$slots.actions" class="layout-section-fixed">
      <slot name="actions" />
    </div>

    <!-- 固定区域：搜索和过滤器 -->
    <div v-if="$slots.filters" class="layout-section-fixed">
      <slot name="filters" />
    </div>

    <!-- 滚动区域：表格 -->
    <div class="layout-section-scrollable">
      <div class="table-scroll-container">
        <slot name="table" />
      </div>
    </div>

    <!-- 固定区域：分页器 -->
    <div v-if="$slots.pagination" class="layout-section-fixed">
      <slot name="pagination" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* 桌面端：Flexbox 布局 */
.table-page-layout {
  @apply flex flex-col gap-5;
  height: calc(100vh - 64px - 3.5rem);
}

.layout-section-fixed {
  @apply flex-shrink-0;
}

.layout-section-scrollable {
  @apply flex-1 min-h-0 flex flex-col;
}

/* 表格滚动容器 - 增强版表体滚动方案 */
.table-scroll-container {
  @apply flex h-full flex-col overflow-hidden rounded-xl border bg-[#fffaf3] dark:bg-[#201a16];
  border-color: rgba(112, 92, 74, 0.16);
  box-shadow: 0 1px 0 rgba(112, 92, 74, 0.06);
}

.table-scroll-container :deep(.table-wrapper) {
  @apply flex-1 overflow-x-auto overflow-y-auto;
  /* 确保横向滚动条显示在最底部 */
  scrollbar-gutter: stable;
}

.table-scroll-container :deep(table) {
  @apply w-full;
  min-width: max-content; /* 关键：确保表格宽度根据内容撑开，从而触发横向滚动 */
  display: table; /* 使用标准 table 布局以支持 sticky 列 */
}

.table-scroll-container :deep(thead) {
  background: #f4eee5;
}

.table-scroll-container :deep(tbody) {
  /* 保持默认 table-row-group 显示，不使用 block */
}

.table-scroll-container :deep(th) {
  @apply px-5 py-3 text-left text-sm font-medium;
  border-bottom: 1px solid rgba(112, 92, 74, 0.14);
  color: #786b5e;
}

.table-scroll-container :deep(td) {
  @apply px-5 py-3 text-sm;
  border-bottom: 1px solid rgba(112, 92, 74, 0.1);
  color: #3b332c;
}

.dark .table-scroll-container {
  border-color: rgba(244, 239, 231, 0.12);
  box-shadow: 0 1px 0 rgba(244, 239, 231, 0.04);
}

.dark .table-scroll-container :deep(thead) {
  background: #211a16;
}

.dark .table-scroll-container :deep(th) {
  border-bottom-color: rgba(244, 239, 231, 0.1);
  color: #a99d91;
}

.dark .table-scroll-container :deep(td) {
  border-bottom-color: rgba(244, 239, 231, 0.08);
  color: #ede5db;
}

/* 移动端：恢复正常滚动 */
.table-page-layout.mobile-mode .table-scroll-container {
  @apply h-auto overflow-visible border-none bg-transparent;
  box-shadow: none;
}

.table-page-layout.mobile-mode .layout-section-scrollable {
  @apply flex-none min-h-fit;
}

.table-page-layout.mobile-mode .table-scroll-container :deep(.table-wrapper) {
  @apply overflow-visible;
}

.table-page-layout.mobile-mode .table-scroll-container :deep(table) {
  @apply flex-none;
  display: table;
  min-width: 100%;
}
</style>
