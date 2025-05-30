<script setup>
import { useEmployeeStore } from "@/stores/employeeStore";

const employeeStore = useEmployeeStore();

const handleDelete = async (id) => {
  try {
    await employeeStore.deleteEmployee(id);
    emit("close"); // Close the modal after successful deletion
  } catch (error) {
    console.error("Error in deleting employee:", error);
  }
};

const props = defineProps({
  employee: Object,
});
const emit = defineEmits(["close"]);
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Delete Employee</h2>
      <p class="text-gray-600 mb-6">
        Do you really want to delete
        <span class="font-medium text-red-600">{{
          props.employee?.userName
        }}</span
        >?
      </p>
      <div class="flex justify-center gap-4">
        <button
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          @click="handleDelete(props.employee?._id)"
          class="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
