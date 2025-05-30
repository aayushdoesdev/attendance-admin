<script setup>
import { ref,onMounted, watch } from 'vue';
import { useProfileStore } from '@/stores/profileStore';
import { storeToRefs } from 'pinia';

const profileStore = useProfileStore();

const {companyLeaves} = storeToRefs(profileStore)

const isEditing = ref(false); // Controls input enable/disable
const leaveId = ref(null);

const leaveTypes = ['Casual Leave', 'Annual Leave'];

const leaveData = ref(
  leaveTypes.map(type => ({
    leaveName: type,
    cycle: type === 'Casual Leave' ? 'monthly' : 'yearly', // set fixed cycle
    days: '',
    rule: '',
  }))
);

watch(companyLeaves, (leaves) => {
  if (leaves && leaves.length > 0) {
    const { casual, annual, _id } = leaves[0];
    leaveId.value = _id || null;  // store the ID if present

    leaveData.value = [
      {
        leaveName: casual.leaveName,
        days: casual.days,
        rule: casual.rule,
        cycle: casual.cycle,
      },
      {
        leaveName: annual.leaveName,
        days: annual.days,
        rule: annual.rule,
        cycle: annual.cycle,
      },
    ];
  }
}, { immediate: true });

const submitLeaves = async () => {
  try {
    const casual = leaveData.value.find(l => l.leaveName === 'Casual Leave');
    const annual = leaveData.value.find(l => l.leaveName === 'Annual Leave');

    const payload = {
      casual: {
        leaveName: casual.leaveName,
        days: Number(casual.days),
        rule: casual.rule,
        cycle: casual.cycle,
      },
      annual: {
        leaveName: annual.leaveName,
        days: Number(annual.days),
        rule: annual.rule,
        cycle: annual.cycle,
      },
      _id: leaveId.value ?? null, // include _id or null
    };

    await profileStore.postCompanyLeaves(payload);
    isEditing.value = false;
  } catch (error) {
    console.error(error);
  }
};


</script>

<template>
  <div class="max-w-4xl space-y-10 mt-6">
    <div
      v-for="(leave, index) in leaveData"
      :key="index"
      class="border-b pb-6 space-y-4"
    >
      <h3 class="font-semibold text-gray-800">{{ leave.name }}</h3>

      <!-- Leave Policy Cycle -->
      <div class="flex items-center gap-6">
        <label class="text-sm font-medium text-gray-700">Leave Policy</label>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-1 text-sm">
            <input
              type="radio"
              :name="`cycle-${index}`"
              value="yearly"
              v-model="leave.cycle"
              disabled
              class="accent-purple-600"
            />
            Yearly
          </label>
          <label class="flex items-center gap-1 text-sm">
            <input
              type="radio"
              :name="`cycle-${index}`"
              value="monthly"
              v-model="leave.cycle"
              disabled
              class="accent-purple-600"
            />
            Monthly
          </label>
        </div>
      </div>

      <!-- Inputs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="E.g 03"
          v-model="leave.days"
          :disabled="!isEditing"
          class="input-field"
        />
        <select
          v-model="leave.rule"
          :disabled="!isEditing"
          class="input-field"
        >
          <option value="" disabled selected>E.g Carry forward</option>
          <option value="carry">Carry forward</option>
          <option value="encash">Encashment</option>
        </select>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-4">
      <button
        v-if="!isEditing"
        @click="isEditing = true"
        class="px-6 py-2 bg-gray-100 text-gray-700 rounded"
      >
        Edit
      </button>
      <template v-else>
        <button
          @click="isEditing = false"
          class="px-6 py-2 bg-gray-100 text-gray-700 rounded"
        >
          Cancel
        </button>
        <button
          @click="submitLeaves"
          class="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Done
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply w-full px-4 py-2 border border-gray-200 rounded bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400;
}
</style>
