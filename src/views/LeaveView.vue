<script setup>
import { ref, computed, watch } from "vue";
import { useLeaveStore } from "@/stores/leaveStore";
import { storeToRefs } from "pinia";
import { debounce } from "@/utils/debounce";
import LottieAnimation from "@/components/LottieAnimation.vue";

const leaveStore = useLeaveStore();
const { leaveData, loading, page, limit , totalPages } = storeToRefs(leaveStore);

const searchName = ref("");
const selectedDepartment = ref("");
const selectedStatus = ref("");

function getLeaveDuration(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  const diffTime = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
}

function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

const updateLeave = async (id, statusType) => {
  try {
    await leaveStore.acceptRejectLeave(id, statusType);
    await leaveStore.getUserLeaves(true); // refresh data
  } catch (error) {
    console.error("Error updating leave:", error);
  }
};

const fetchUserLeaves = () => {
  leaveStore.getUserLeaves({
    search: searchName.value,
    department: selectedDepartment.value,
    status: selectedStatus.value,
    page: page.value,
    limit: limit.value,
  });
};

const debouncedFetchSalaries = debounce(fetchUserLeaves, 500);

watch(
  [searchName, selectedDepartment, selectedStatus],
  () => {
    page.value = 1;
    debouncedFetchSalaries();
  }
);

watch(page, () => {
  fetchUserLeaves(); // no debounce here
});

const nextPage = () => {
  page.value++;
};

const prevPage = () => {
  if (page.value > 1) page.value--;
};
</script>

<template>
  <main class="bg-white w-full rounded-md p-4 overflow-y-auto">
    <div class="flex items-center justify-between">
      <h2 class="font-bold text-[20px]">Leave List</h2>
      <!-- <button>Download</button> -->
    </div>

    <hr class="my-4" />

    <div class="flex items-center gap-2">
      <input
        type="text"
        v-model="searchName"
        placeholder="Search by employee"
        class="bg-black bg-opacity-10 px-4 py-1 rounded outline-none"
      />

      <select
        v-model="selectedDepartment"
        class="bg-black bg-opacity-10 px-2 py-1 rounded outline-none"
      >
        <option value="">All Departments</option>
        <option value="HR">HR</option>
        <option value="Engineering">Engineering</option>
        <option value="Sales">Sales</option>
      </select>

      <select
        v-model="selectedStatus"
        class="bg-black bg-opacity-10 px-2 py-1 rounded outline-none"
      >
        <option value="">All Status</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="pending">Pending</option>
      </select>
    </div>

    <template v-if="leaveData && leaveData.length > 0">
      <div class="mt-4 w-full overflow-auto no-scrollbar">
        <table class="min-w-[1200px] w-full table-auto text-left border-collapse">
          <thead class="bg-gray-100 text-gray-500 text-sm whitespace-nowrap">
            <tr>
              <th class="py-3 px-4">Sr. No</th>
              <th class="py-3 px-4">Employee Name & ID</th>
              <th class="py-3 px-4">Leave left</th>
              <th class="py-3 px-4">Department</th>
              <th class="py-3 px-4">Leave type</th>
              <th class="py-3 px-4">Reason</th>
              <th class="py-3 px-4">From</th>
              <th class="py-3 px-4">To</th>
              <th class="py-3 px-4">Total days</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Action</th>
              <th class="py-3 px-4">Paid/Unpaid</th>
            </tr>
          </thead>
          <tbody class="text-sm text-gray-700 whitespace-nowrap">
            <tr
              v-for="(employee, index) in leaveData"
              :key="employee._id"
              class="border-b border-gray-200"
            >
              <td class="py-3 px-4">{{ index + 1 }}</td>
              <td class="py-3 px-4 flex items-center gap-3">
                <img
                  :src="employee.image"
                  class="w-8 h-8 rounded-full object-cover"
                  alt="avatar"
                />
                <div>
                  <p class="font-medium capitalize">{{ employee.name }}</p>
                  <p class="text-xs text-gray-400">{{ employee.userId }}</p>
                </div>
              </td>
              <td class="py-3 px-4">
                {{
                  employee.status === "approved"
                    ? 14 - employee.leaveTaken
                    : 14
                }}
              </td>
              <td class="py-3 px-4">{{ employee.department }}</td>
              <td class="py-3 px-4">{{ employee.leaveType }}</td>
              <td class="py-3 px-4">{{ employee.reason }}</td>
              <td class="py-3 px-4">{{ formatDate(employee.from) }}</td>
              <td class="py-3 px-4">{{ formatDate(employee.to) }}</td>
              <td class="py-3 px-4">
                <p class="bg-blue-100 text-blue-500 font-semibold px-1 py-1 rounded-md text-center">
                  {{ getLeaveDuration(employee.from, employee.to) }}
                    <!-- {{ employee.leaveDays }} -->
                </p>
              </td>
              <td class="py-3 px-4">
                <span
                  :class="[ 'text-xs px-2 py-1 rounded capitalize',
                    employee.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-600'
                      : employee.status === 'rejected'
                      ? 'bg-red-100 text-red-600'
                      : employee.status === 'approved'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  ]"
                >
                  {{ employee.status }}
                </span>
              </td>
              <td class="py-3 px-4 flex items-center gap-2">
                <template v-if="employee.status === 'pending'">
                  <button
                    @click="updateLeave(employee._id, 'approved')"
                    class="border border-blue-500 text-blue-500 px-3 py-1 rounded text-xs"
                  >
                    Accept
                  </button>
                  <button
                    @click="updateLeave(employee._id, 'rejected')"
                    class="border border-red-500 text-red-500 px-3 py-1 rounded text-xs"
                  >
                    Reject
                  </button>
                </template>
              </td>
              <td class="py-3 px-4">{{ employee.leave }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-center items-center my-4 gap-4 text-text sm-text">
        <button
          @click="prevPage"
          :disabled="page === 1"
          :class="{
            'p-2 rounded-full bg-gray-400 hover:bg-gray-600 disabled:opacity-50 pi pi-angle-left': true,
            'cursor-pointer': page > 1,
            'cursor-not-allowed': page === 1
          }"
        ></button>

        <p>Page {{ page }} of {{ totalPages }}</p>

        <button
          @click="nextPage"
          :disabled="leaveData.length < limit"
          :class="{
            'p-2 rounded-full bg-gray-400 hover:bg-gray-600 disabled:opacity-50 pi pi-angle-right': true,
            'cursor-pointer': leaveData.length >= limit,
            'cursor-not-allowed': leaveData.length < limit
          }"
        ></button>
      </div>
    </template>

    <div v-if="loading" class="w-[350px] mx-auto mt-[100px]">
      <LottieAnimation animationPath="/animation/loading.json" />
    </div>

    <!-- <div v-if="!loading && leaveData.length === 0" class="w-[350px] mt-[200px] mx-auto">
      <LottieAnimation animationPath="/animation/no-data.json" />
      <p class="text-center font-bold">No matching results found</p>
    </div> -->

    <div v-if="!loading && !leaveData.length" class="w-[350px] mt-[200px] mx-auto">
      <LottieAnimation animationPath="/animation/no-data.json" />
      <p class="text-center font-bold">No Data Found</p>
    </div>
  </main>
</template>
