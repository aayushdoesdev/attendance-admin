<script setup>
import { ref, watch } from 'vue';
import { useProfileStore } from '@/stores/profileStore';
import { storeToRefs } from 'pinia';

const profileStore = useProfileStore();
const { weekendDetails } = storeToRefs(profileStore);

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const selectedDays = ref([]);
const selectedSaturdayRule = ref('');

const saturdayRules = [
  'Every Saturday off',
  'Only 1st Saturday off',
  'Only 2nd Saturday off',
  'Only 3rd Saturday off',
  'Only 4th Saturday off',
  '1st and 3rd Saturday off',
  '2nd and 4th Saturday off',
];

const isEditing = ref(false);

// Watch for loaded weekend details
watch(weekendDetails, (detailsArray) => {
  const details = detailsArray?.[0]; // Access first item
  if (details?.weeklyoff) {
    selectedDays.value = [...details.weeklyoff];
  }
  if (details?.weekcondition) {
    selectedSaturdayRule.value = details.weekcondition;
  }
}, { immediate: true });

const submitForm = async () => {
  const form = {
    weeklyoff: selectedDays.value.map(day => day.toLowerCase()),
    weekcondition: selectedSaturdayRule.value.toLowerCase(),
  };

  await profileStore.postWeekendDetails(form);
  isEditing.value = false;
};


const cancelEdit = () => {
  isEditing.value = false;
  // Restore values from store
  const original = weekendDetails.value?.[0];
if (original?.weeklyoff) {
  selectedDays.value = [...original.weeklyoff];
}
if (original?.weekcondition) {
  selectedSaturdayRule.value = original.weekcondition;
}
};
</script>


<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-gray-800">Select weekly off days</h2>
      <button
        v-if="!isEditing"
        @click="isEditing = true"
        class="text-sm text-purple-600 hover:underline"
      >
        Edit
      </button>
    </div>

    <div v-if="isEditing" class="flex flex-wrap gap-4">
      <label
        v-for="day in weekdays"
        :key="day"
        class="flex items-center gap-2"
      >
        <input
          type="checkbox"
          :value="day"
          v-model="selectedDays"
          class="accent-purple-500 w-4 h-4"
        />
        <span class="text-sm text-gray-700">{{ day }}</span>
      </label>
    </div>
    <div v-else class="flex flex-wrap gap-3 text-sm text-gray-700">
      <span
        v-for="day in selectedDays"
        :key="day"
        class="bg-purple-100 text-purple-700 px-2 py-1 rounded"
      >
        {{ day }}
      </span>
    </div>

    <div class="mt-4">
      <label for="saturdayRule" class="block text-sm font-medium text-gray-700 mb-1">
        Saturday rule
      </label>

      <select
        v-if="isEditing"
        id="saturdayRule"
        v-model="selectedSaturdayRule"
        class="w-full max-w-xs border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="" disabled selected>E.g. Only 3rd Saturday off</option>
        <option v-for="rule in saturdayRules" :key="rule" :value="rule">{{ rule }}</option>
      </select>

      <div v-else class="text-sm text-gray-700">
        {{ selectedSaturdayRule || '—' }}
      </div>
    </div>

    <div v-if="isEditing" class="flex gap-3 mt-4">
      <button
        @click="submitForm"
        class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Submit
      </button>
      <button
        @click="cancelEdit"
        class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  </section>
</template>
