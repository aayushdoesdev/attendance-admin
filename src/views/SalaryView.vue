<script setup>
import { ref, computed, watch } from "vue";
import { usesalaryStore } from "@/stores/salaryStore";
import { storeToRefs } from "pinia";
import { debounce } from "@/utils/debounce";
import LottieAnimation from "@/components/LottieAnimation.vue";

// store
const salaryStore = usesalaryStore();
const { salaryData, salaryRecords, loading, page, limit, totalPages } =
  storeToRefs(salaryStore);

const searchName = ref("");
const selectedDepartment = ref("");
const selectedStatus = ref("");

// Modal states
const showEditModal = ref(false);
const selectedEmployee = ref(null);
const addOnTitle = ref("");
const addOnAmount = ref("");
const addOnType = ref("Bonus");
const showAddOnForm = ref(false);

// Leave and salary logic
const calculateTotalLeaves = (emp) => {
  const halfDayLeaves = (Number(emp.halfDay) || 0) / 2;
  return (
    (Number(emp.leaves) || 0) + (Number(emp.sickLeaves) || 0) + halfDayLeaves
  );
};

const calculateDeduction = (emp) => {
  const ALLOWED_LEAVES_PER_YEAR = 14;
  const totalLeaves = calculateTotalLeaves(emp);
  const excessLeaves = Math.max(0, totalLeaves - ALLOWED_LEAVES_PER_YEAR);
  const perDaySalary = (Number(emp.actualSalary) || 0) / 30;
  return Math.round(perDaySalary * excessLeaves);
};

const calculatePayable = (emp) => {
  const deduction = calculateDeduction(emp);
  const baseSalary = Number(emp.actualSalary) || 0;

  // Sum all addon amounts if emp.addOns exists
  const totalAddOns = emp.addOns
    ? emp.addOns.reduce((sum, addon) => sum + Number(addon.amount || 0), 0)
    : 0;

  const totalSalaryWithAddOns = baseSalary + totalAddOns;
  return Math.max(0, totalSalaryWithAddOns - deduction);
};

const getCurrentMonthDays = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

const getPresentDays = (emp) => {
  return getCurrentMonthDays() - (emp.leave?.length || 0);
};

const calculateTotalSalary = (emp) => {
  const baseSalary = Number(emp.actualSalary) || 0;
  const addOnAmount = Number(emp.addOnAmount) || 0;
  return baseSalary + addOnAmount;
};

// Modal functions
const openEditModal = (employee) => {
  selectedEmployee.value = { ...employee };
  showEditModal.value = true;
  showAddOnForm.value = false;
  addOnTitle.value = "";
  addOnAmount.value = "";
  addOnType.value = "Bonus";
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedEmployee.value = null;
  showAddOnForm.value = false;
  addOnTitle.value = "";
  addOnAmount.value = "";
  addOnType.value = "Bonus";
};

const toggleAddOnForm = () => {
  showAddOnForm.value = !showAddOnForm.value;
  if (!showAddOnForm.value) {
    addOnTitle.value = "";
    addOnAmount.value = "";
    addOnType.value = "Bonus";
  }
};

const addSalaryAddOn = async () => {
  if (!addOnTitle.value.trim() || !addOnAmount.value) {
    alert("Please fill in both title and amount");
    return;
  }

  const amount = Number(addOnAmount.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  try {
    const updatedSalary = Number(selectedEmployee.value.actualSalary) + amount;
    const updatedPayable = calculatePayable({
      ...selectedEmployee.value,
      actualSalary: updatedSalary,
    });

    const updateData = {
      username: selectedEmployee.value.name,
      userId: selectedEmployee.value.empId,
      department: selectedEmployee.value.department,
      type: selectedEmployee.value.type,
      present: selectedEmployee.value.present,
      paidLeaves: selectedEmployee.value.paidLeaves,
      leaves: selectedEmployee.value.leaves,
      halfDay: selectedEmployee.value.halfDay,
      sickLeaves: selectedEmployee.value.sickLeaves,
      addOnType: addOnTitle.value,
      actualSalary: selectedEmployee.value.actualSalary,
      addOnAmount: addOnAmount.value,
      payable: updatedPayable,
      status: selectedEmployee.value.status,
      addOn: addOnTitle.value,
    };

    const response = await salaryStore.updateEmployeeSalary(updateData);

    if (response) {
      // ✅ Update modal data
      selectedEmployee.value.addOnAmount = addOnAmount.value;
      selectedEmployee.value.addOn = addOnTitle.value;
      selectedEmployee.value.payable = updatedPayable;

      // ✅ Update local table list (salaryData)
      const index = salaryData.value.findIndex(
        (emp) => emp.empId === selectedEmployee.value.empId
      );
      if (index !== -1) {
        salaryData.value[index] = {
          ...salaryData.value[index],
          addOnAmount: addOnAmount.value,
          addOn: addOnTitle.value,
          payable:
            updatedPayable + Number(salaryData.value[index].addOnAmount || 0),
        };
      }

      // Reset form
      addOnTitle.value = "";
      addOnAmount.value = "";
      showAddOnForm.value = false;

      alert(
        `Successfully added ₹${amount} add-on to ${selectedEmployee.value.name}'s salary`
      );
    } else {
      alert("Failed to update salary. Please try again.");
    }
  } catch (error) {
    console.error("Error updating salary:", error);
    alert("An error occurred while updating the salary. Please try again.");
  }
};

const generateInvoice = (employee) => {
  alert(`Generating invoice for ${employee.name}`);
};

const fetchSalaries = async () => {
  await salaryStore.getUserSalary({
    search: searchName.value,
    department: selectedDepartment.value,
    status: selectedStatus.value,
  });
};

watch([searchName, selectedDepartment, selectedStatus], () => {
  page.value = 1;
  fetchSalaries();
});

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++;
    fetchSalaries();
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    fetchSalaries();
  }
};
//status toggle function
function toggleStatus(emp) {
  if (emp.status === 'Pending') {
    emp.status = 'Paid';
  } else if (emp.status === 'Paid') {
    emp.status = 'Unpaid';
  } else {
    emp.status = 'Pending';
  }
}
</script>

<template>
  <main class="bg-white w-full rounded-md p-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Salary</h2>
      <button class="bg-blue-600 text-white px-4 py-1 rounded">Download</button>
    </div>

    <hr class="my-4" />

    <div class="flex items-center gap-2">
      <input
        v-model="searchName"
        type="text"
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
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
      </select>
    </div>
    <!-- TABLE -->
    <template v-if="salaryData && salaryData.length > 0">
      <div class="overflow-x-auto no-scrollbar mt-4">
        <table class="min-w-[1200px] w-full whitespace-nowrap text-sm">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="text-left px-4 py-2 w-[20%] min-w-[280px]">
                Full Name & ID
              </th>
              <th class="text-left px-4 py-2">Department</th>
              <th class="text-left px-4 py-2">Type</th>
              <th class="text-center px-4 py-2">Present</th>
              <th class="text-center px-4 py-2">Paid Leaves</th>
              <th class="text-center px-4 py-2">Leaves</th>
              <!-- <th class="text-center px-4 py-2">Half Day</th> -->
              <!-- <th class="text-center px-4 py-2">Sick Leaves</th> -->
              <th class="text-left px-4 py-2">Add On</th>
              <th class="text-left px-4 py-2">Actual Salary</th>
              <th class="text-left px-4 py-2">Payable</th>
              <th class="text-left px-4 py-2">Status</th>
              <th class="text-right px-4 py-2">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="emp in salaryData"
              :key="emp.id"
              :class="[
                'border-b',
                calculateTotalLeaves(emp) > 14 ? 'bg-red-50' : '',
              ]"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    :src="emp.image"
                    alt="avatar"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p class="font-medium">{{ emp.name }}</p>
                    <p class="text-xs text-gray-400">{{ emp.empId }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 capitalize">{{ emp.department }}</td>
              <td class="px-4 py-3">
                <span
                  class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs"
                >
                  {{ emp.type }}
                </span>
              </td>
              <td class="text-center px-4 py-3">{{ getPresentDays(emp) }}</td>
              <td class="text-center px-4 py-3">
                {{ emp.leave?.filter((l) => l.type === "paid").length || 0 }}
              </td>
              <td class="text-center px-4 py-3">{{ emp.leave.length }}</td>
              <!-- <td class="text-center px-4 py-3">
                {{ emp.halfDay }}
                <span class="text-xs text-gray-400"
                  >({{ (emp.halfDay / 2).toFixed(1) }}d)</span
                >
              </td> -->
              <!-- <td class="text-center px-4 py-3">{{ emp.sickLeaves }}</td> -->
              <td class="px-4 py-3">
                <span
                  v-if="
                    emp.addOns && emp.addOns.length && emp.addOns !== '------'
                  "
                  class="bg-blue-100 text-blue-600 rounded text-xs px-3 py-1 inline-block"
                >
                  {{ emp.addOns[emp.addOns.length - 1].amount }}
                  {{ emp.addOns[emp.addOns.length - 1].type }}
                </span>
                <span v-else class="text-gray-400 text-xs">------</span>
              </td>

              <td class="px-4 py-3">₹{{ emp.actualSalary }}</td>
              <td class="px-4 py-3">
                ₹{{ calculatePayable(emp) }}
                <!-- <p class="text-xs text-red-500">
                  -₹{{ calculateDeduction(emp) }} deduction
                </p>
                <p class="text-xs text-gray-500">
                  {{ calculateTotalLeaves(emp) }} total leaves
                </p> -->
              </td>
              <td class="px-4 py-3">
                <button
                  @click="toggleStatus(emp)"
                  :class="[
                    'px-3 py-1 rounded text-xs font-semibold focus:outline-none transition',
                    emp.status === 'Paid'
                      ? 'bg-green-100 text-green-600'
                      : emp.status === 'Unpaid'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-600',
                  ]"
                >
                  {{ emp.status }}
                </button>
              </td>

              <td class="px-4 py-3 text-right">
                <button
                  @click="openEditModal(emp)"
                  class="text-gray-500 hover:text-blue-600 mr-2 pi pi-pen-to-square text-[20px]"
                  title="Edit Salary"
                ></button>
                <button
                  @click="generateInvoice(emp)"
                  class="text-gray-500 hover:text-green-600 pi pi-file text-[20px]"
                  title="Generate Invoice"
                ></button>
              </td>
            </tr>

            <tr v-if="salaryData.length === 0">
              <td colspan="13" class="text-center py-6 text-gray-400">
                No salary data available.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
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
          :disabled="salaryData.length < limit"
          :class="{
            'p-2 rounded-full bg-gray-400 hover:bg-gray-600 disabled:opacity-50 pi pi-angle-right': true,
            'cursor-pointer': salaryData.length >= limit,
            'cursor-not-allowed': salaryData.length < limit,
          }"
        ></button>
      </div>
    </template>

    <div v-if="loading" class="w-[350px] mx-auto mt-[100px]">
      <LottieAnimation animationPath="/animation/loading.json" />
    </div>

    <div
      v-if="!loading && !salaryData.length"
      class="w-[350px] mt-[200px] mx-auto"
    >
      <LottieAnimation animationPath="/animation/no-data.json" />
      <p class="text-center font-bold">No Data Found</p>
    </div>

    <!-- Edit Salary Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeEditModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Edit Salary</h3>
          <button
            @click="closeEditModal"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div v-if="selectedEmployee">
          <!-- Employee Info -->
          <div class="mb-4 p-3 bg-gray-50 rounded">
            <p class="font-medium">{{ selectedEmployee.name }}</p>
            <p class="text-sm text-gray-600">{{ selectedEmployee.empId }}</p>
          </div>

          <!-- Salary Breakdown -->
          <div class="mb-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Base Salary:</span>
              <span class="font-medium"
                >₹{{ selectedEmployee.actualSalary }}</span
              >
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Add-On Amount:</span>
              <span class="font-medium text-green-600">
                +₹{{ selectedEmployee.addOnAmount || 0 }}
              </span>
            </div>
            <hr />
            <div class="flex justify-between">
              <span class="font-medium">Total Salary:</span>
              <span class="font-semibold text-lg"
                >₹{{ calculateTotalSalary(selectedEmployee) }}</span
              >
            </div>
          </div>

          <button
            @click="toggleAddOnForm"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
            :disabled="loading"
          >
            {{ showAddOnForm ? "Cancel Add-On" : "Add Bonus/Incentive" }}
          </button>

          <!-- Add On Form -->
          <div v-if="showAddOnForm" class="space-y-4">
            <div class="space-y-2">
              <input
                v-model="addOnTitle"
                type="text"
                placeholder="Title (e.g., Performance Bonus, Festival Bonus)"
                class="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
                :disabled="loading"
              />
              <input
                v-model="addOnAmount"
                type="number"
                placeholder="Add-On Amount"
                class="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
                :disabled="loading"
              />
            </div>

            <button
              @click="addSalaryAddOn"
              :disabled="loading"
              class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span v-if="loading" class="mr-2">
                <svg
                  class="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              {{ loading ? "Adding..." : "Add This Add-On" }}
            </button>
          </div>

          <!-- Current Add-ons -->
          <div
            v-if="selectedEmployee.addOn && selectedEmployee.addOn !== '------'"
            class="mt-4"
          >
            <p class="text-sm text-gray-600 mb-2">Current Add-on:</p>
            <div
              class="flex justify-between items-center p-2 bg-purple-50 rounded"
            >
              <span
                class="bg-purple-100 text-purple-600 px-2 py-1 rounded text-sm"
              >
                {{ selectedEmployee.addOn }}
              </span>
              <span class="text-green-600 font-medium">
                +₹{{ selectedEmployee.addOnAmount || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
