<script setup>
import { ref } from "vue";
import { useProfileStore } from "@/stores/profileStore";
import { storeToRefs } from "pinia";

const profileStore = useProfileStore();

const { holidayDetails } = storeToRefs(profileStore);

const showAddHoliday = ref(false);

// Form inputs
const newHolidayName = ref("");
const newHolidayDate = ref("");

const submitHoliday = async () => {
  try {
    const data = {
      holidayName: newHolidayName.value,
      date: newHolidayDate.value,
      isActive: true,
    };
    await profileStore.postHolidayDetails(data);
  } catch (error) {
    console.error(error);
  }
};

const toggleHoliday = async (data, id) => {
  console.log(data);
  try {
    await profileStore.editHolidayDetails(data, id);
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <section class="space-y-6 overflow-y-hidden">
    <div class="flex items-center justify-between ">
      <h2 class="text-lg font-semibold text-gray-800">List of Holidays</h2>
      <button
        @click="showAddHoliday = !showAddHoliday"
        class="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {{ showAddHoliday ? "Close" : "Add Holiday" }}
      </button>
    </div>

    <!-- Add Holiday Form -->
    <div v-if="showAddHoliday" class="space-y-4 p-4 border border-gray-300 rounded-lg">
      <h3 class="font-semibold text-gray-700">Add New Holiday</h3>
      <input
        v-model="newHolidayName"
        type="text"
        placeholder="Holiday Name"
        class="w-full border p-2 rounded"
      />
      <input
        v-model="newHolidayDate"
        type="date"
        class="w-full border p-2 rounded"
      />
      <button
        @click="submitHoliday"
        class="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Add Holiday
      </button>
    </div>

    <!-- Holiday List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="(holiday, index) in holidayDetails"
        :key="holiday.name + holiday.date"
        class="flex items-center justify-between py-2 border border-black border-opacity-30 px-4 rounded-xl"
      >
        <div>
          <h3 class="text-sm font-medium text-gray-700">
            {{ holiday.holidayName }}
          </h3>
          <p class="text-xs text-gray-500">{{ holiday.date }}</p>
        </div>
        <button
          @click="toggleHoliday(!holiday.isActive, holiday._id)"
          :class="holiday.isActive ? 'bg-gray-400' : 'bg-purple-500'"
          class="text-white px-4 py-1 rounded"
        >
          {{ holiday.isActive ? "Disable" : "Enable" }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.peer:checked + div {
  background-color: #8b5cf6;
}
</style>
