<script setup>
import { reactive, ref, watchEffect } from 'vue'
import { useProfileStore } from '@/stores/profileStore'
import { storeToRefs } from 'pinia'

const profileStore = useProfileStore()
const { companyData } = storeToRefs(profileStore)

const isEditing = ref(false)

const form = reactive({
  gstNumber: '',
  companyAddress: '',
  panNumber: '',
  email: '',
  contact: '',
  linkedIn: '',
  webURL: '',
  foundedOn: '',
  teamSize: '',
  industry: '',
})

// Populate form when companyData is available/updated
watchEffect(() => {
  if (companyData.value) {
    form.gstNumber = companyData.value.gstNumber || ''
    form.companyAddress = companyData.value.companyAddress || ''
    form.panNumber = companyData.value.panNumber || ''
    form.email = companyData.value.email || ''
    form.contact = companyData.value.contact || ''
    form.linkedIn = companyData.value.linkedIn || ''
    form.webURL = companyData.value.webURL || ''
    form.foundedOn = companyData.value.foundedOn || ''
    form.teamSize = companyData.value.teamSize || ''
    form.industry = companyData.value.industry || ''
  }
})

function toggleEdit() {
  isEditing.value = !isEditing.value
}

const submitForm = async () => {
  try {
    const hasData = companyData.value && Object.keys(companyData.value).length > 0

    if (hasData) {
      await profileStore.editCompanyDetails({ ...form })
    } else {
      await profileStore.addCompanyDetails({ ...form })
    }

    isEditing.value = false
  } catch (error) {
    console.error('Failed to submit company details:', error)
  }
}
</script>


<template>
  <section class="mt-6">
    <div class="flex items-center justify-end gap-4">
      <button
        @click="toggleEdit"
        class="px-8 py-2 text-sm rounded-md shadow text-white"
        :class="isEditing ? 'bg-red-400 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
      >
        {{ isEditing ? 'Cancel' : 'Edit' }}
      </button>
      <div v-if="isEditing" class="text-right">
        <button
          type="submit"
          @click="submitForm"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow text-sm"
        >
          Submit
        </button>
      </div>
    </div>

    <form>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium block mb-1">GST Number</label>
          <input
            v-model="form.gstNumber"
            :disabled="!isEditing"
            type="text"
            placeholder="E.g 27ABCU9603R1ZV"
            class="w-full input"
          />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">Company's address</label>
          <input
            v-model="form.companyAddress"
            :disabled="!isEditing"
            type="text"
            placeholder="E.g 3rd Floor, TechHub Tower, Telibandha"
            class="w-full input"
          />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">PAN Number</label>
          <input
            v-model="form.panNumber"
            :disabled="!isEditing"
            type="text"
            placeholder="E.g 19:20"
            class="w-full input"
          />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">Email address</label>
          <input
            v-model="form.email"
            :disabled="!isEditing"
            type="email"
            placeholder="E.g info@xtentioncrew.com"
            class="w-full input"
          />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">Contact number</label>
          <input
            v-model="form.contact"
            :disabled="!isEditing"
            type="text"
            placeholder="E.g 19:20"
            class="w-full input"
          />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">LinkedIn</label>
          <input
            v-model="form.linkedIn"
            :disabled="!isEditing"
            type="text"
            placeholder="E.g linkedin.com/company/xtentioncrew"
            class="w-full input"
          />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">Website URL</label>
          <input
            v-model="form.webURL"
            :disabled="!isEditing"
            type="text"
            placeholder="E.g www.xtentioncrew.com"
            class="w-full input"
          />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">Founded On</label>
          <input
            v-model="form.foundedOn"
            :disabled="!isEditing"
            type="text"
            placeholder="E.g January 12, 2020"
            class="w-full input"
          />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">Team Size</label>
          <input
            v-model="form.teamSize"
            :disabled="!isEditing"
            type="text"
            placeholder="E.g 45+ Employees"
            class="w-full input"
          />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">Industry / Domain</label>
          <input
            v-model="form.industry"
            :disabled="!isEditing"
            type="text"
            placeholder="E.g SaaS – HR & Attendance Solutions"
            class="w-full input"
          />
        </div>
      </div>
    </form>
  </section>
</template>

<style scoped>
.input {
  @apply px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm outline-none transition;
}
.input:disabled {
  @apply bg-gray-100 cursor-not-allowed;
}
</style>
