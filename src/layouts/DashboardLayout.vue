<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterView } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";

const selectedView = ref("main");

// Track screen size
const isSmallScreen = ref(window.innerWidth < 768);

const handleResize = () => {
  isSmallScreen.value = window.innerWidth < 768;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize(); // initialize it in case size changes before mount
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <main>
    <Navbar />

    <div class="flex justify-end md:hidden px-4 pt-2 w-full">
      <select
        v-model="selectedView"
        class="border rounded px-2 py-2 text-sm w-full"
      >
        <option value="sidebar">Leaves and Celebration </option>
        <option value="main">Attendance</option>
      </select>
    </div>


    <div class="p-4 pt-2 flex items-start md:gap-2 h-[calc(100vh-60px)]">
      <Sidebar
        :class="[
          'transition-all duration-300',
          isSmallScreen && selectedView !== 'sidebar' ? 'hidden' : 'block'
        ]"
      />
      <div class="flex flex-1 h-full overflow-x-hidden" :class="[
          'flex-1 transition-all duration-300',
          isSmallScreen && selectedView !== 'main' ? 'hidden' : 'flex'
        ]">
        <RouterView />
      </div>
    </div>
  </main>
</template>
