<script setup>
import { ref, reactive } from "vue";
import { useProfileStore } from "@/stores/profileStore";
import { storeToRefs } from "pinia";

const profileStore = useProfileStore();
const { companyDocuments } = storeToRefs(profileStore);

const showUploadModal = ref(false);
const uploadedFile = ref(null);
const previewUrl = ref("");
const fileTitle = ref("");
const documents = ref([]); // Assuming documents is your local list
const showPreviewModal = ref(false);
const selectedDoc = ref(null);

// Handle file input
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  uploadedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

// Submit form
const uploadDocument = async () => {
  if (!uploadedFile.value || !fileTitle.value.trim()) return;

  const formData = new FormData();
  formData.append("name", fileTitle.value);
  formData.append("admindocs", uploadedFile.value); // field name must match your backend

  try {
    await profileStore.postCompanyDocument(formData);

    // Optional: push the uploaded doc to local list for preview
    documents.value.push({
      id: Date.now(),
      title: fileTitle.value,
      thumbnail: previewUrl.value,
    });

    resetModal();
  } catch (error) {
    console.error("Upload error:", error);
  }
};

const openPreviewModal = (doc) => {
  selectedDoc.value = doc;
  showPreviewModal.value = true;
};

const deleteDocument = async (id) => {
  try {
    await profileStore.deleteCompanyDocument(id); // <-- implement this in your store
    // companyDocuments.value = companyDocuments.value.filter(doc => doc._id !== id);
  } catch (err) {
    console.error("Failed to delete document", err);
  }
};

// Reset modal
function resetModal() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  uploadedFile.value = null;
  fileTitle.value = "";
  previewUrl.value = "";
  showUploadModal.value = false;
}
</script>

<template>
  <section class="w-full mt-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-semibold text-gray-800 text-lg">Documents</h2>
      <button
        @click="showUploadModal = true"
        class="flex items-center gap-1 bg-blue-500 hover:bg-purple-600 text-white px-8 py-2 text-sm rounded-md"
      >
        Add New
        <span class="text-[20px]">+</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="doc in companyDocuments"
        :key="doc._id"
        class="border border-dashed rounded shadow-sm bg-white"
      >
        <div
          class="flex items-center gap-2 px-3 py-2 border-b text-sm font-medium text-gray-700"
        >
          <!-- <Folder class="w-4 h-4 text-gray-500" /> -->
          {{ doc.name }}
        </div>
        <div class="relative">
          <img
            :src="doc.image"
            alt="Document Thumbnail"
            class="w-full h-32 object-cover opacity-80"
          />
          <button
            class="absolute inset-0 flex items-center justify-center text-purple-600 hover:text-purple-800"
            @click.prevent="alert(`Download ${doc.title}`)"
          >
            <!-- <Download class="w-6 h-6 bg-white p-1 rounded-full shadow" /> -->
          </button>
        </div>

        <div class="flex items-center gap-4 p-3 border-t text-right">
          <button class="" @click.prevent="openPreviewModal(doc)">
            <i class="pi pi-eye"></i>
            View
          </button>
          <button
            @click="deleteDocument(doc._id)"
            class="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 ml-auto"
          >
            <i class="pi pi-trash"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Upload Modal -->
  <div
    v-if="showUploadModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
      <h3 class="text-lg font-semibold mb-4">Upload Document</h3>

      <div
        class="border border-dashed flex items-center justify-center h-40 rounded bg-gray-50 mb-4 relative"
      >
        <template v-if="previewUrl">
          <img :src="previewUrl" class="max-h-full max-w-full object-contain" />
        </template>
        <template v-else>
          <p class="text-gray-400">No preview available</p>
        </template>
      </div>

      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        class="mb-2"
        @change="handleFileUpload"
      />

      <input
        type="text"
        v-model="fileTitle"
        placeholder="Add title"
        class="w-full mb-4 px-3 py-2 border border-gray-300 rounded text-sm"
      />

      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          @click="resetModal"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          :disabled="!uploadedFile || !fileTitle.trim()"
          @click="uploadDocument"
        >
          Done
        </button>
      </div>
    </div>
  </div>

  <div
    v-if="showPreviewModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-fit p-6">
      <div class="flex items-center justify-between mb-8">
        
        <h3 class="text-lg font-semibold ">{{ selectedDoc?.name }}</h3>
        <button
          class=" pi pi-times"
          @click="showPreviewModal = false"
        ></button>
      </div>

      <div v-if="selectedDoc?.image?.endsWith('.pdf')" class="h-[70vh]">
        <iframe
          :src="selectedDoc.image"
          class="w-full h-full"
          frameborder="0"
        ></iframe>
      </div>
      <div v-else>
        <img
          :src="selectedDoc?.image"
          alt="Preview"
          class="max-w-full max-h-[70vh] object-contain mx-auto"
        />
      </div>
    </div>
  </div>
</template>
