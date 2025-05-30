import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAttendenceStore = defineStore("attendence", () => {
  const endpoint = "fetchData";
  const attendenceData = ref([]);

  const getAttendence = async () => {
    try {
      const response = await makeRequest(endpoint, "GET", {}, {}, {}, 0, null);
      attendenceData.value = response;
    } catch (error) {
      console.error("Error in fetching all employes data", error);
    }
  };


  getAttendence();

  return {
    attendenceData,
    getAttendence,
  };
});
