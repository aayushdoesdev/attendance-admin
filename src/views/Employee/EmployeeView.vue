<script setup>
import { ref, computed, watch } from "vue";
import { useEmployeeStore } from "@/stores/employeeStore";
import EmployeeModal from "./AddNewEmployeeModal.vue";
import DeleteEmployeeModal from "./DeleteEmployeeModal.vue";
import { storeToRefs } from "pinia";
import { debounce } from "@/utils/debounce";
import LottieAnimation from "@/components/LottieAnimation.vue";

const employeeStore = useEmployeeStore();
const { allEmployeeData, loading, page, limit, totalPages } = storeToRefs(employeeStore);


const searchQuery = ref("");
const filterDept = ref("");
const showModal = ref(false);
const showDeleteModal = ref(false);
const selectedEmployee = ref(null);

const filteredEmployees = computed(() => {
  return allEmployeeData.value.filter((emp) => {
    const matchesEmail = emp.email
      ?.toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesDept = !filterDept.value || emp.department === filterDept.value.toLowerCase();

    return matchesEmail && matchesDept;
  });
});

function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toISOString().split("T")[0]; // returns "YYYY-MM-DD"
}

function openEditModal(employee) {
  selectedEmployee.value = { ...employee }; // Clone to avoid direct mutation
  showModal.value = true;
}

function openDeleteModal(employee) {
  selectedEmployee.value = { ...employee }; // Clone to avoid direct mutation
  showDeleteModal.value = true;
}

const fetchEmployee = () => {
  employeeStore.getallEmployees({
    search: searchQuery.value,
    department: filterDept.value,
    page: page.value,
    limit: limit.value,
  });
};

const debouncedFetchEmployee = debounce(fetchEmployee, 500);

watch(
  [searchQuery, filterDept],
  () => {
    page.value = 1;
    debouncedFetchEmployee();
  }
);

watch(page, () => {
  fetchEmployee(); // no debounce here
});

const nextPage = () => {
  page.value++;
};

const prevPage = () => {
  if (page.value > 0) page.value--;
};
</script>

<template>
  <div class="p-4 bg-white w-full rounded-md">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-bold">Employee list</h1>
      <div class="space-x-2">
        <!-- <button class="bg-white border px-6 py-2 rounded shadow text-sm">
          Download
        </button> -->
        <button
          @click="showModal = true"
          class="bg-[#6E62FF] text-white px-6 py-2 rounded shadow text-sm"
        >
          Add New
        </button>
      </div>
    </div>

    <hr class="my-4" />

    <div class="flex items-center gap-2">
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
    </div>

    <!-- Table -->
    <template v-if="allEmployeeData && allEmployeeData.length > 0">
      <div class="overflow-x-auto no-scrollbar mt-4">
        <table class="min-w-[1200px] w-full whitespace-nowrap text-sm">
          <thead class="bg-gray-100 text-left">
            <tr>
              <th class="p-3">Employee Name & ID</th>
              <th class="p-3">Email</th>
              <th class="p-3">Phone Number</th>
              <th class="p-3">Type</th>
              <th class="p-3">Department</th>
              <th class="p-3">Role</th>
              <th class="p-3">Joining date</th>
              <th class="p-3">Salary</th>
              <th class="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(employee, index) in allEmployeeData"
              :key="index"
              class="border-t"
            >
              <td class="p-3 flex items-center gap-2">
                <img
                  :src="employee.image"
                  alt=""
                  class="w-8 h-8 rounded-full"
                />
                <div>
                  <div class="font-medium">{{ employee.userName }}</div>
                  <div class="text-xs text-gray-500">{{ employee.userId }}</div>
                </div>
              </td>
              <td class="p-3">{{ employee.email }}</td>
              <td class="p-3">{{ employee.phoneNumber }}</td>
              <td class="p-3">
                <span
                  class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs capitalize"
                  >{{ employee.emptype }}</span
                >
              </td>
              <td class="p-3">{{ employee.department }}</td>
              <td class="p-3">{{ employee.role }}</td>
              <td class="p-3">{{ formatDate(employee.joiningDate) }}</td>
              <td class="p-3">{{ Number(employee.salary).toLocaleString('en-IN') }}</td>
              <td class="p-3 flex gap-3">
                <button
                  @click="openEditModal(employee)"
                  class="text-blue-500 text-[20px]"
                >
                  <i class="pi pi-pen-to-square"></i>
                </button>
                <button
                  @click="openDeleteModal(employee)"
                  class="text-red-500 text-[20px]"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
            'cursor-not-allowed': page === 1
          }"
        ></button>

        <p>Page {{ page }} of {{ totalPages }}</p>

        <button
          @click="nextPage"
          :disabled="allEmployeeData.length < limit"
          :class="{
            'p-2 rounded-full bg-gray-400 hover:bg-gray-600 disabled:opacity-50 pi pi-angle-right': true,
            'cursor-pointer': allEmployeeData.length >= limit,
            'cursor-not-allowed': allEmployeeData.length < limit
          }"
        ></button>
      </div>
    </template>

    <div v-if="loading" class="w-[350px] mx-auto mt-[200px]">
      <LottieAnimation animationPath="/animation/loading.json" />
    </div>

    <div
      v-if="!loading && !allEmployeeData.length"
      class="w-[350px] mt-[200px] mx-auto"
    >
      <LottieAnimation animationPath="/animation/no-data.json" />
      <p class="text-center font-bold">No Data Found</p>
    </div>
  </div>

  <EmployeeModal
    v-if="showModal"
    @close="showModal = false"
    :employee="selectedEmployee"
  />

  <DeleteEmployeeModal
    v-if="showDeleteModal"
    @close="showDeleteModal = false"
    :employee="selectedEmployee"
  />
</template>
