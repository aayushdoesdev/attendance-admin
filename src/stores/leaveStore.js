import { defineStore } from "pinia";
import { makeRequest } from "@/request/request";
import { toast } from "vue3-toastify";
import { ref } from "vue";

export const useLeaveStore = defineStore("leave", () => {
  const endpoint = "userleave";
  const leaveData = ref([]);
  const loading = ref(false)
  const page = ref(1)
  const limit = ref(10)
  const totalPages = ref("")

  const getUserLeaves = async (filters = {}) => {
    try {
      loading.value = true;

      const queryParams = {
        page: page.value,
        limit: limit.value,
        ...filters, // Spread searchName, department, status
      };

      const response = await makeRequest(
        endpoint,
        "GET",
        {},
        {},
        queryParams,
        0,
        null,
        "/admin"
      );
      leaveData.value = response?.leaves;
      totalPages.value = response?.totalPages
      // manageResponse(response, {method : "GET"})
    } catch (error) {
      console.error("Error in leave", error);
    } finally{
      loading.value = false;
    }
  };

  const acceptRejectLeave = async (id, statusType) => {
    try {
     const response = await makeRequest(
        endpoint,
        "PUT",
        { status: statusType },
        {},
        {},
        0,
        id,
        "/admin"
      );

    if(response.status === "success"){
      toast.success("Leave status change succesfully!")
    }

      const index = leaveData.value.findIndex((leave) => leave._id === id);
    if (index !== -1) {
      // ✅ Replace object to ensure reactivity
      leaveData.value[index] = {
        ...leaveData.value[index],
        status: statusType,
      };
    }
  
    return response;
    } catch (error) {
      console.error("Error in updating leave", error);
      toast.error("Error in changing the leave status!")
    }
  };

  getUserLeaves();

  return {
    leaveData,
    getUserLeaves,
    acceptRejectLeave,
    loading,
    page,
    limit,
    totalPages
  };
});
