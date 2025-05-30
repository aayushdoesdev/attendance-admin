<script setup>
import { ref, reactive } from "vue";
import { useProfileStore } from "@/stores/profileStore";
import { makeRequest } from "@/request/request";
import DetailSection from "./DetailSection.vue";
import PunchSection from "./PunchSection.vue";
import LeaveSection from "./LeaveSection.vue";
import DocumentSection from "./DocumentSection.vue";
import WeekendSection from "./WeekendSection.vue";
import HolidaySection from "./HolidaySection.vue";
import { storeToRefs } from "pinia";

const profileStore = useProfileStore();
const { companyDetails } = storeToRefs(profileStore);

const activeTab = ref("about");
const editMode = ref(false);
const selectedImage = ref(null);
const previewImage = ref(null); 

// Tab config
const tabs = [
  { label: "About company", value: "about" },
  { label: "Documents", value: "documents" },
  { label: "Holidays", value: "holidays" },
  { label: "Weekends", value: "weekends" },
  { label: "Punch In/Out", value: "punch" },
  { label: "Leaves", value: "leaves" },
];

// Editable form state
const form = reactive({
  name: companyDetails.value.name,
  organisation: companyDetails.value.organisation,
  industry: companyDetails.value.industry,
  teamSize: companyDetails.value.teamSize,
  years: companyDetails.value.years,
});

const toggleEdit = () => {
  editMode.value = !editMode.value;

  // Reset form values if cancelling edit
  if (editMode.value === false) {
    Object.assign(form, companyDetails.value);
  }
};

const onImageChange = async (event) => {
  const file = event.target.files[0];

  if (file) {
    // Revoke old preview URL
    if (previewImage.value) {
      URL.revokeObjectURL(previewImage.value);
    }

    selectedImage.value = file;
    previewImage.value = URL.createObjectURL(file);

    // Prepare FormData
    const formData = new FormData();
    formData.append("image", file); // Match backend field name

    try {
      // Replace 'companyDetails._id' with the actual ID in scope
      await makeRequest("/admin/companydetails", "PUT", formData, {}, {}, 0, companyDetails._id);
      console.log("✅ Image uploaded successfully");
    } catch (err) {
      console.error("❌ Error uploading image:", err);
    }
  }
};

// const submitCompanyDetails = async (id) => {
//   if (!selectedImage.value) return;

//   const formData = new FormData();
//   formData.append("image", selectedImage.value); // Make sure this field name matches backend expectation

//   try {
//     // await profileStore.editCompanyDetails(formData); // should accept only image
//     await makeRequest("/admin/edit", "PUT", formData, {}, {}, 0, id)
//   } catch (err) {
//     console.error("Error uploading company image", err);
//   }
// };

</script>

<template>
  <main class="bg-white w-full rounded-md p-4">
    <!-- Header -->
    <div>
      <form
        
        class="flex items-center gap-4"
      >
        <!-- Profile Image and Edit Icon -->
        <div
          class="relative w-[80px] h-[80px] rounded-full overflow-hidden group"
        >
          <img
            :src="companyDetails.cmpDetail?.image|| '/images/dummy_profile_img.jpg'"
            alt="Profile"
            class="w-full h-full object-cover"
          />
          <label
            class="absolute bottom-2 right-1 bg-white border border-gray-300 rounded-full px-1 cursor-pointer shadow-sm transition h-fit"
            title="Change Image"
          >
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="onImageChange"
            />
            <i class="pi pi-pencil text-xs text-gray-600"></i>
          </label>
        </div>

        <!-- Company Info -->
        <div class="flex-1 relative space-y-1">
          <!-- Toggle Edit Button -->
          <!-- <button
            type="button"
            class="absolute top-0 right-0 p-1 text-sm text-gray-500 hover:text-gray-800"
            @click="toggleEdit"
            title="Edit Details"
          >
            <i class="pi pi-pencil text-sm"></i>
          </button> -->

          <!-- Name -->
          <h2 class="font-semibold capitalize text-[20px]">
            <!-- <template v-if="editMode">
              <input
                v-model="form.name"
                placeholder="Company Name"
                class="border rounded px-2 py-0.5 w-[30%] text-[16px]"
              />
            </template> -->
            <p >{{ companyDetails.name }}</p>
          </h2>
          <!-- Organisation & Industry -->
          <div class="flex gap-4 text-[14px] w-[50%]">
            <!-- <template v-if="editMode">
              <input
                placeholder="Organisation"
                v-model="form.organisation"
                class="border rounded px-2 py-0.5 w-full text-[13px]"
              />
              <input
                placeholder="Industry"
                v-model="form.industry"
                class="border rounded px-2 py-0.5 w-full text-[13px]"
              />
            </template> -->
            <div class="flex items-center gap-4">
              <p>{{ companyDetails.organisation }}</p>
              <p>{{ companyDetails.industry }}</p>
            </div>
          </div>

          <!-- Team Size & Years -->
          <div class="flex gap-4 text-[14px]">
            <!-- <template v-if="editMode">
              <input
                type="number"
                placeholder="Team Size"
                v-model="form.teamSize"
                class="border rounded px-2 py-0.5 w-[120px] text-[13px]"
              />
              <input
                type="text"
                placeholder="Years"
                v-model="form.years"
                class="border rounded px-2 py-0.5 w-[120px] text-[13px]"
              />
            </template> -->
            <div>
              <p>{{ companyDetails.teamSize }} Employees Involved</p>
              <!-- <p>It’s been {{ companyDetails.years }}</p> -->
            </div>
          </div>

          <!-- Submit Button -->
          <div v-if="editMode" class="mt-2">
            <button
            type="button"
              @click="submitCompanyDetails(companyDetails._id)"
              class="bg-blue-600 text-white px-4 py-1 text-sm rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>

      <hr class="my-4" />
    </div>

    <!-- Tabs Loop -->
    <div
      class="flex gap-4 bg-custom-gray font-medium rounded-xl p-1 text-[14px] overflow-x-auto"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="whitespace-nowrap"
        @click="activeTab = tab.value"
        :class="[
          'px-8 py-2 rounded-xl',
          activeTab === tab.value
            ? 'bg-purple-500 text-white'
            : 'bg-transparent',
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Conditional Section -->
    <div class="mt-6 grow overflow-y-auto max-h-[65%]">
      <DetailSection v-if="activeTab === 'about'" />
      <PunchSection v-if="activeTab === 'punch'" />
      <LeaveSection v-if="activeTab === 'leaves'" />
      <DocumentSection v-if="activeTab === 'documents'" />
      <WeekendSection v-if="activeTab === 'weekends'" />
      <HolidaySection v-if="activeTab === 'holidays'"/>
      <!-- Other tab sections can go here -->
    </div>
  </main>
</template>
