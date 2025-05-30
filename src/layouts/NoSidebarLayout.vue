<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/components/Navbar.vue";
</script>

<template>
  <main>
    <Navbar />

    <div class="p-4 pt-2 flex items-start gap-2 h-[calc(100vh-60px)]">
      <div class="flex flex-1 h-full overflow-x-hidden">
        <RouterView />
      </div>
    </div>
  </main>
</template>
