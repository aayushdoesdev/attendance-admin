<script setup>
import { ref, computed, watch } from "vue";
import { useHomeStore } from "@/stores/homeStore";
import { storeToRefs } from "pinia";
import { debounce } from "@/utils/debounce";
import LottieAnimation from "@/components/LottieAnimation.vue";

const homeStore = useHomeStore();
const { HomeData, page, limit, totalPages, loading } = storeToRefs(homeStore);

const searchQuery = ref("");
const filterDept = ref("");
const filterStatus = ref("");

const updateAttendence = async (id, status) => {
  try {
    await homeStore.updateAttendenceStatus(id, status);

    // ✅ Update HomeData immediately after update
    const index = HomeData.value.findIndex((emp) => emp._id === id);
    if (index !== -1) {
      HomeData.value[index].status = status;
    }
  } catch (error) {
    console.error("Error updating attendance status:", error);
  }
};

function getAttendanceStatus(employee) {
  if (!employee.timeStamp) return "Absent";
  return employee.status;
}

function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// Modal for viewing employee photo
const showPhotoModal = ref(false);
const selectedPhoto = ref("");

function openPhotoModal(photoUrl) {
  selectedPhoto.value = photoUrl;
  showPhotoModal.value = true;
}

function closePhotoModal() {
  showPhotoModal.value = false;
  selectedPhoto.value = "";
}

const fetchHomeData = () => {
  homeStore.getUserHome({
    search: searchQuery.value,
    department: filterDept.value,
    status: filterStatus.value,
    page: page.value,
    limit: limit.value,
  });
};

const debouncedFetchHomeData = debounce(fetchHomeData, 500);

watch([searchQuery, filterDept, filterStatus], () => {
  page.value = 1;
  debouncedFetchHomeData();
});


watch(page, () => {
  fetchHomeData(); // no debounce here
});


const nextPage = () => {
  page.value++;
};

const prevPage = () => {
  if (page.value > 0) page.value--;
};
</script>

<template>
  <main class="bg-white w-full rounded-md p-6 overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Today's Attendance</h2>
      <!-- <button class="bg-white border px-5 py-2 rounded shadow text-sm">
        Download
      </button> -->
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2 text-md">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by employee"
        class="bg-black bg-opacity-10 px-4 py-1 rounded outline-none"
      />

      <select
        v-model="filterDept"
        class="bg-black bg-opacity-10 px-2 py-1 rounded outline-none"
      >
        <option value="">All Departments</option>
        <option value="HR">HR</option>
        <option value="Engineering">Engineering</option>
        <option value="Sales">Sales</option>
      </select>

      <select
        v-model="filterStatus"
        class="bg-black bg-opacity-10 px-2 py-1 rounded outline-none"
      >
        <option value="">All Status</option>
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Absent">Late</option>
      </select>
    </div>

    <!-- Table -->
    <template v-if="HomeData && HomeData.length > 0">
      <div class="overflow-x-auto no-scrollbar mt-4">
        <table class="min-w-[1000px] w-full whitespace-nowrap text-sm">
          <thead class="bg-custom-gray text-left text-black">
            <tr>
              <th class="py-3 px-4">Full Name & ID</th>
              <th class="py-3 px-4">Department</th>
              <th class="py-3 px-4">Location</th>
              <th class="py-3 px-4">Photo</th>
              <th class="py-3 px-4">Punch In & Out Time</th>
              <th class="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody class="text-black">
            <tr
              v-for="employee in HomeData"
              :key="employee.id"
              class="border-b border-gray-200"
            >
              <td class="py-3 px-4">
                <p class="font-medium">{{ employee.userName }}</p>
                <p class="text-xs text-gray-500">{{ employee.userID }}</p>
              </td>
              <td class="py-3 px-4">{{ employee.department }}</td>
              <td class="py-3 px-4">{{ employee.locationName }}</td>

              <!-- View Photo Trigger -->
              <td
                class="py-3 px-4 text-blue-600 underline cursor-pointer"
                @click="openPhotoModal(employee.selfieImage)"
              >
                View
              </td>

              <td class="py-3 px-4">
                {{ formatTime(employee.punchIn) || "--" }} to
                {{ formatTime(employee.punchOut) || "--" }}
              </td>

              <!-- Action Buttons -->
              <td class="py-3 px-4 space-x-2">
                <button
                  @click="updateAttendence(employee._id, 'present')"
                  class="px-3 py-1 rounded font-medium text-sm"
                  :class="[
                    employee.status === 'present'
                      ? 'bg-green-600 bg-opacity-30 text-green-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-green-100',
                  ]"
                >
                  Present
                </button>

                <button
                  @click="updateAttendence(employee._id, 'absent')"
                  class="px-3 py-1 rounded font-medium text-sm"
                  :class="[
                    employee.status === 'absent'
                      ? 'bg-red-600 bg-opacity-30 text-red-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-red-100',
                  ]"
                >
                  Absent
                </button>
                <button
                  @click="updateAttendence(employee._id, 'halfday')"
                  class="px-3 py-1 rounded font-medium text-sm"
                  :class="[
                    employee.status === 'halfday'
                      ? 'bg-yellow-500 bg-opacity-30 text-yellow-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-yellow-100',
                  ]"
                >
                  Half Day
                </button>

                <button
                  @click="updateAttendence(employee._id, 'late')"
                  class="px-3 py-1 rounded font-medium text-sm"
                  :class="[
                    employee.status === 'halfday' && employee.entryTime === 'late' 
                      ? 'bg-blue-500 bg-opacity-30 text-blue-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-blue-100',
                  ]"
                >
                  Late
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          class="flex justify-center items-center my-4 gap-4 text-text sm-text"
        >
          <button
            @click="prevPage"
            :disabled="page === 1"
            :class="{
              'p-2 rounded-full bg-gray-400 hover:bg-gray-600 disabled:opacity-50 pi pi-angle-left': true,
              'cursor-pointer': page > 1,
              'cursor-not-allowed': page === 1,
            }"
          ></button>

          <p>Page {{ page }} of {{ totalPages }}</p>
          <button
            @click="nextPage"
            :disabled="HomeData.length < limit"
            :class="{
              'p-2 rounded-full bg-gray-400 hover:bg-gray-600 disabled:opacity-50 pi pi-angle-right': true,
              'cursor-pointer': HomeData.length >= limit,
              'cursor-not-allowed': HomeData.length <= limit,
            }"
          ></button>
        </div>
      </div>
    </template>

    <div v-if="loading" class="w-[350px] mx-auto mt-[100px]">
      <LottieAnimation animationPath="/animation/loading.json" />
    </div>

    <div
      v-if="!loading && !HomeData.length"
      class="w-[350px] mt-[200px] mx-auto"
    >
      <LottieAnimation animationPath="/animation/no-data.json" />
      <p class="text-center font-bold">No Data Found</p>
    </div>
  </main>

  <!-- Photo Modal -->
  <div
    v-if="showPhotoModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full relative">
      <button
        class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
        @click="closePhotoModal"
      >
        ✕
      </button>

      <h3 class="text-lg font-semibold mb-4">Employee Photo</h3>
      <img
        :src="selectedPhoto"
        alt="Employee Photo"
        class="w-full h-auto rounded shadow"
      />
    </div>
  </div>
</template>
