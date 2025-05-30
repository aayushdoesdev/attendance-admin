<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { useEmployeeStore } from "@/stores/employeeStore";
import LottieAnimation from "@/components/LottieAnimation.vue";

// Props
const props = defineProps({
  employee: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);
const employeeStore = useEmployeeStore();

const tabs = ["Basic Info", "Contact info", "Upload image", "Job Info"];
const tabTitles = ["Personal info", "Contact info", "Profile info", "Job Info"];
const activeTab = ref(0);
const requested = ref(false);

const formData = ref({
  userName: "",
  fatherName: "",
  motherName: "",
  email: "",
  phoneNumber: "",
  birthdate: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  currentAddress: "",
  permanentAddress: "",
  emergencyNumber: "",
  emptype: "",
  department: "",
  role: "",
  joiningDate: "",
  salary: "",
  pin: "",
  userimage: null,
});

const genderOptions = ["male", "female", "other"];
const maritalStatusOptions = ["single", "married", "divorced"];
const bloodGroupOptions = ["a+", "a-", "b+", "b-", "ab+", "ab-", "o+", "o-"];
const employmentTypes = ["permanent", "contract", "intern"];
const departments = ["hr", "engineering", "sales", "ui/ux"];
const roles = ["developer", "manager", "designer"];

const imagePreview = ref(null);
const errors = ref([]);
const originalImageUrl = ref(null); // Track original image URL
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const isNewImage = computed(() => formData.value.userimage instanceof File);

// Populate form when editing
const populateForm = (emp) => {
  
  for (const key in formData.value) {
    if (emp[key] !== undefined && emp[key] !== null) {
      formData.value[key] = emp[key];
    }
  }

  // Handle image preview if URL string
  if (emp.userimage && typeof emp.userimage === "string") {
    imagePreview.value = emp.userimage;
    originalImageUrl.value = emp.userimage; // Store original URL
    formData.value.userimage = emp.userimage; // Keep the URL in formData
  }
};

onMounted(() => {
  if (props.employee) {
    populateForm(props.employee);
  }
});

watch(() => props.employee, (newVal) => {
  if (newVal) {
    populateForm(newVal);
  }
}, { deep: true });

const handleFileChange = (e) => {
  const file = e.target.files[0];

  if (file) {
    if (!file.type.startsWith("image/")) {
      errors.value.push("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      errors.value.push("File must be under 5MB");
      return;
    }

    errors.value = errors.value.filter((err) => !err.includes("File") && !err.includes("image"));
    formData.value.userimage = file;

    // Clean up previous preview URL if it was a blob
    if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview.value);
    }

    imagePreview.value = URL.createObjectURL(file);
  }
};


const isEditMode = !!props.employee?.userId;

const validateForm = () => {
  errors.value = [];
  const requiredFields = [
    { key: "userName", label: "User Name" },
    { key: "fatherName", label: "Father Name" },
    { key: "motherName", label: "Mother Name" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    { key: "birthdate", label: "Birth Date" },
    { key: "gender", label: "Gender" },
    { key: "maritalStatus", label: "Marital Status" },
    { key: "bloodGroup", label: "Blood Group" },
    { key: "currentAddress", label: "Current Address" },
    { key: "permanentAddress", label: "Permanent Address" },
    { key: "emergencyNumber", label: "Emergency Number" },
    { key: "emptype", label: "Employee Type" },
    { key: "department", label: "Department" },
    { key: "role", label: "Role" },
    { key: "joiningDate", label: "Joining Date" },
    { key: "salary", label: "Salary" },
    ...(!isEditMode ? [{ key: "pin", label: "PIN" }] : []),
  ];

  for (const field of requiredFields) {
    const value = formData.value[field.key];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors.value.push(`${field.label} is required`);
    }
  }

  if (formData.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.push("Please enter a valid email address");
  }

  if (!isEditMode && formData.value.pin && !/^\d{4}$/.test(formData.value.pin)) {
  errors.value.push("PIN must be a 4-digit number");
}

  if (formData.value.salary && (isNaN(formData.value.salary) || parseFloat(formData.value.salary) <= 0)) {
    errors.value.push("Please enter a valid salary amount");
  }

  return errors.value.length === 0;
};

const resetForm = () => {
  // Reset all form fields to default values
  formData.value = {
    userName: "",
    fatherName: "",
    motherName: "",
    email: "",
    phoneNumber: "",
    birthdate: "",
    gender: "",
    maritalStatus: "",
    bloodGroup: "",
    currentAddress: "",
    permanentAddress: "",
    emergencyNumber: "",
    emptype: "",
    department: "",
    role: "",
    joiningDate: "",
    salary: "",
    pin: "",
    userimage: null,
  };

  // Clear the image preview and revoke URL to avoid memory leaks
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value);
  }
  imagePreview.value = null;
  originalImageUrl.value = null;

  // Reset form state
  activeTab.value = 0;
  errors.value = [];
};

const createFormData = () => {
  const uploadData = new FormData();
  const fields = [
    "userName", "fatherName", "motherName", "email", "phoneNumber", "birthdate", "gender",
    "maritalStatus", "bloodGroup", "currentAddress", "permanentAddress", "emergencyNumber",
    "emptype", "department", "role", "joiningDate", "salary", "pin"
  ];

  fields.forEach((field) => {
    const value = formData.value[field];
    if (value !== null && value !== undefined && value !== '') {
      uploadData.append(field, String(value).trim());
    }
  });

  // Handle image - only append if it's a new file upload
  if (formData.value.userimage instanceof File) {
    uploadData.append("userimage", formData.value.userimage, formData.value.userimage.name);
  }

  return uploadData;
};

const submitEmployeeForm = async () => {
  
  if (!validateForm()) {
    return;
  }

  try {
    requested.value = true;
    if (props.employee?.userId) {
      await updateEmployeeData(props.employee.userId);
    } else {
      const uploadData = createFormData();
      await employeeStore.createNewEmployee(uploadData);
    }

    resetForm();
    emit("close");
  } catch (error) {
    console.error("Submission Error:", error);
    errors.value.push("An error occurred during submission");
  }finally{
    requested.value = false;
  }
};

const updateEmployeeData = async (userId) => {
  const uploadData = new FormData();
  const original = props.employee || {};

  const fields = [
    "userName", "fatherName", "motherName", "email", "phoneNumber", "birthdate", "gender",
    "maritalStatus", "bloodGroup", "currentAddress", "permanentAddress", "emergencyNumber",
    "emptype", "department", "role", "joiningDate", "salary"
  ];

  fields.forEach((field) => {
    const newValue = formData.value[field];
    const originalValue = original[field];

    // Normalize values for comparison
    const newVal = typeof newValue === "string" ? newValue.trim() : newValue;
    const origVal = typeof originalValue === "string" ? originalValue.trim() : originalValue;

    if (newVal !== origVal) {
      uploadData.append(field, String(newVal));
    }
  });

  // Append image only if it's a new file (not the original URL string)
  if (formData.value.userimage instanceof File) {
    uploadData.append("userimage", formData.value.userimage, formData.value.userimage.name);
  }

  // Call the store action
  await employeeStore.updateEmployee(userId, uploadData);
};



const nextStep = () => {
  if (activeTab.value < tabs.length - 1) {
    activeTab.value++;
  } else {
    submitEmployeeForm();
  }
};

const previousStep = () => {
  if (activeTab.value > 0) {
    activeTab.value--;
  }
};

const cancel = () => {
  resetForm();
  emit("close");
};

onBeforeUnmount(() => {
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value);
  }
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white rounded-xl w-full max-w-3xl p-6 shadow-xl">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        {{ tabTitles[activeTab] }}
      </h2>

      <!-- Debug info (remove in production) -->
      <div v-if="props.employee" class="mb-2 text-xs text-gray-500">
        Editing: {{ props.employee.userName || 'Unknown' }} (ID: {{ props.employee.userId }})
      </div>

      <!-- Tabs -->
      <div class="flex space-x-2 mb-6">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activeTab = index"
          :class="[
            'flex-1 py-2 rounded-md font-medium',
            activeTab === index
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700',
          ]"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Errors -->
      <div v-if="errors.length" class="mb-4 text-red-600 text-sm">
        <ul>
          <li v-for="(error, i) in errors" :key="i">{{ error }}</li>
        </ul>
      </div>

      <!-- Tab Content -->
      <div>
        <!-- Basic Info -->
        <div v-if="activeTab === 0" class="grid grid-cols-2 gap-4">
          <input
            v-model="formData.userName"
            type="text"
            placeholder="Full name"
            class="input"
          />
          <input
            v-model="formData.motherName"
            type="text"
            placeholder="Mother's name"
            class="input"
          />
          <input
            v-model="formData.fatherName"
            type="text"
            placeholder="Father's name"
            class="input"
          />
          <input
            v-model="formData.email"
            type="email"
            placeholder="Email ID"
            class="input"
          />
          <input
            v-model="formData.phoneNumber"
            type="text"
            placeholder="Phone number"
            class="input"
          />

          <input v-model="formData.birthdate" type="date" class="input" />
          <select v-model="formData.gender" class="input">
            <option disabled value="">Select Gender</option>
            <option v-for="option in genderOptions" :key="option" :value="option">
              {{ capitalize(option) }}
            </option>
          </select>
          <select v-model="formData.maritalStatus" class="input">
            <option disabled value="">Select Marital Status</option>
            <option v-for="option in maritalStatusOptions" :key="option" :value="option">
              {{ capitalize(option) }}
            </option>
          </select>
          <select v-model="formData.bloodGroup" class="input">
            <option disabled value="">Select Blood Group</option>
            <option v-for="option in bloodGroupOptions" :key="option" :value="option">
              {{ option.toUpperCase() }}
            </option>
          </select>
        </div>

        <!-- Contact Info -->
        <div v-if="activeTab === 1" class="grid grid-cols-2 gap-4">
          <input
            v-model="formData.currentAddress"
            type="text"
            placeholder="Current address"
            class="input"
          />
          <input
            v-model="formData.permanentAddress"
            type="text"
            placeholder="Permanent address"
            class="input"
          />
          <input
            v-model="formData.emergencyNumber"
            type="text"
            placeholder="Emergency Number"
            class="input col-span-2"
          />
        </div>

        <!-- Upload Image -->
        <div
          v-if="activeTab === 2"
          class="border-2 border-dashed rounded-md border-indigo-400 p-8 text-center"
        >
          <label class="block cursor-pointer">
            <div class="text-indigo-600 font-medium mb-2">
              Upload your photo
            </div>
            <div class="text-sm text-gray-500">
              Format should be .jpeg, .png under 5MB
            </div>
            <input
              type="file"
              class="hidden"
              accept="image/*"
              @change="handleFileChange"
            />
          </label>
          <div v-if="imagePreview" class="mt-4">
            <img
              :src="imagePreview"
              alt="Preview"
              class="mx-auto rounded-md max-h-40 object-contain"
            />
            <div class="text-xs text-gray-500 mt-2">
              {{ isNewImage ? 'New image selected' : 'Current image' }}
            </div>
          </div>
        </div>

        <!-- Job Info Tab -->
        <div v-if="activeTab === 3" class="grid grid-cols-2 gap-4">
          <select v-model="formData.emptype" class="input">
            <option disabled value="">Select Employment Type</option>
            <option v-for="option in employmentTypes" :key="option" :value="option">
              {{ capitalize(option) }}
            </option>
          </select>

          <select v-model="formData.department" class="input">
            <option disabled value="">Select Department</option>
            <option v-for="option in departments" :key="option" :value="option">
              {{ capitalize(option) }}
            </option>
          </select>

          <input
            v-model="formData.role"
            type="text"
            placeholder="Role (e.g., Frontend, Backend)"
            class="input"
          />
          <input
            v-model="formData.joiningDate"
            type="date"
            placeholder="Joining Date"
            class="input"
          />
          <input
            v-model="formData.salary"
            type="number"
            placeholder="Salary"
            class="input"
          />
          <input
          v-if="!isEditMode"
            v-model="formData.pin"
            type="password"
            maxlength="4"
            placeholder="4-digit PIN"
            class="input"
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between mt-6">
        <button
          @click="cancel"
          class="px-6 py-2 rounded-md border border-gray-300 text-gray-700"
        >
          Cancel
        </button>
        <div class="flex space-x-2">
          <button
            v-if="activeTab > 0"
            @click="previousStep"
            class="px-6 py-2 rounded-md border border-indigo-600 text-indigo-600"
          >
            Previous
          </button>
          <button
            @click="nextStep"
            :disabled="requested" 
            class="px-6 py-2 rounded-md bg-indigo-600 text-white"
          >
            <div v-if="requested" class="w-6 mx-auto">
              <lottieAnimation animationPath="/animation/small-loading.json"/>
            </div>
            <p v-else>{{ activeTab === tabs.length - 1 ? 'Submit' : 'Next' }}</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500;
}
</style>