<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { toast } from "vue3-toastify";
import { useNotificationStore } from "@/stores/notificationStore";
import { storeToRefs } from "pinia";
import { io } from "socket.io-client";

const notificationStore = useNotificationStore();

const { notificationData } = storeToRefs(notificationStore);

const socket = io("https://attendancebackends.onrender.com", { transports: ["websocket"] }); // replace with your backend URL/port

socket.on("connect", () => {
  console.log("✅ Admin connected:", socket.id);
  socket.emit("register", "admin"); // tell server this is an admin
});

socket.on("notification", (msg) => {
  // console.log("📩 New message from user:", msg);
  notificationData.value.push(msg);
});

const route = useRoute();

const menu = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Employee",
    path: "/employee",
  },
  {
    name: "Salary",
    path: "/salary",
  },
  {
    name: "Leave",
    path: "/leave",
  },
];

const isMenuopen = ref(false);
const sidebarOpen = ref(false);
const isNotificationOpen = ref(false);

const toggleMenu = () => {
  isMenuopen.value = !isMenuopen.value;
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

function toggleNotification() {
  isNotificationOpen.value = !isNotificationOpen.value;
}

const handleLogout = async () => {
  // await authStore.logout()
  localStorage.removeItem("token");
  toast.success("Logged out successfully");

  setTimeout(() => {
    window.location.reload();
  }, 1000);
};
</script>

<template>
  <nav
    class="flex items-center px-4 mx-4 rounded-md justify-between h-[60px] bg-white"
  >
    <div class="flex items-center gap-4">
      <div class="md:hidden">
        <button @click="toggleSidebar" class="pi pi-bars text-[20px]"></button>
      </div>
      <router-link to="/" class="flex items-center gap-2">
        <img src="/svg/logo.svg" alt="Logo" class="w-[80%] md:w-[90%]" />
      </router-link>
    </div>
    <div class="hidden md:flex justify-center items-center gap-8">
      <router-link
        v-for="item in menu"
        :to="item.path"
        class="text-black hover:bg-[#7A5AF8] transition-all rounded-lg px-4 py-1 hover:text-white font-inter"
        :class="{ 'bg-[#7A5AF8] text-white': item.path === route.path }"
      >
        {{ item.name }}
      </router-link>
    </div>
    <div class="flex items-center">
      <button @click="toggleNotification">
        <img src="/svg/bell.svg" alt="admin" class="h-8 w-8 mr-2" />
      </button>

      <transition name="fade">
        <div
          v-if="isNotificationOpen"
          class="absolute right-5 top-14 w-72 bg-white shadow-md rounded-md z-30 max-h-60 overflow-y-auto"
        >
          <div class="p-3 border-b font-semibold">Notifications</div>
          <div
            v-if="notificationData.length === 0"
            class="p-3 text-sm text-gray-500"
          >
            No notifications.
          </div>
          <ul>
            <li
              v-for="(notification, index) in notificationData"
              :key="index"
              class="px-4 py-2 hover:bg-gray-100 text-sm border-b"
            >
              {{ notification.message || notification }}
              <!-- Adjust depending on message structure -->
            </li>
          </ul>
        </div>
      </transition>

      <div class="flex items-center gap-4">
        <div
          @click="toggleMenu"
          class="cursor-pointer w-[40px] h-[40px] rounded-full"
        >
          <img src="/images/dummy_profile_img.jpg" alt="" />
        </div>

        <transition name="menu-fade">
          <div
            v-if="isMenuopen"
            class="w-[200px] bg-white shadow-md absolute top-[50px] right-5 rounded-md z-30 flex flex-col"
          >
            <router-link
              @click="toggleMenu"
              to="/profile"
              class="py-2 px-4 hover:bg-slate-300 w-full rounded-md transition-all"
              >Profile</router-link
            >
            <a
              href="/terms-and-conditions"
              target="_blank"
              class="py-2 px-4 hover:bg-slate-300 w-full rounded-md transition-all"
              >Terms and Conditions</a
            >
            <button
              @click="handleLogout"
              class="py-2 px-4 hover:bg-slate-300 w-full text-left rounded-md transition-all"
            >
              Logout
            </button>
          </div>
        </transition>
      </div>
    </div>

    <transition name="slide-left">
      <aside
        v-if="sidebarOpen"
        class="fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 flex flex-col p-4"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold">Menu</h2>
          <button @click="toggleSidebar" class="pi pi-times text-lg"></button>
        </div>
        <nav class="flex flex-col gap-3">
          <router-link
            v-for="item in menu"
            :key="item.path"
            :to="item.path"
            class="py-2 px-3 rounded-md hover:bg-indigo-100 transition"
            :class="{ 'bg-indigo-200': item.path === route.path }"
            @click="toggleSidebar"
          >
            {{ item.name }}
          </router-link>
        </nav>
      </aside>
    </transition>

    <!-- Overlay when sidebar is open -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-30 z-30"
      @click="toggleSidebar"
    ></div>
  </nav>
</template>

<style scoped>
.menu-fade-enter-active {
  transition: all 0.2s ease-out;
}
.menu-fade-leave-active {
  transition: all 0.15s ease-in;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.menu-fade-enter-to,
.menu-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0%);
  opacity: 1;
}
</style>
