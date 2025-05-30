<!-- components/CustomToast.vue -->
<template>
  <div
    class="fixed top-5 right-5 bg-white shadow-lg rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-800 flex items-center gap-3 z-50 transition-transform duration-300"
    :class="{ 'translate-x-0': visible, 'translate-x-full': !visible }"
  >
    <span :class="iconClass">{{ icon }}</span>
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  type: { type: String, default: 'success' }, // success | error | info | warn
  message: { type: String, required: true },
});

const visible = ref(false);

const iconMap = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warn: '⚠️',
};

const icon = iconMap[props.type] || '';
const iconClass = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warn: 'text-yellow-600',
}[props.type];

onMounted(() => {
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, 3000); // Hide after 3s
});
</script>

<style scoped>
.translate-x-full {
  transform: translateX(100%);
}
.translate-x-0 {
  transform: translateX(0%);
}
</style>
