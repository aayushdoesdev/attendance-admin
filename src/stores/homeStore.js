import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import { ref } from "vue";

export const useHomeStore = defineStore("home", () => {
  const endpoint = "admin";
  const HomeData = ref([]);
  const page = ref(1)
  const limit = ref(10)
  const loading = ref(false)
  const totalPages = ref("")

  const getUserHome = async (filters = {}) => {
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
        "/userdata"
      );
      HomeData.value = response?.punchDetails;
      totalPages.value = response?.totalPages
    } catch (error) {
      console.error("Error in Home", error);
    }finally{
      loading.value = false;
    }
  };

  // PUT method to update attendance
 const updateAttendenceStatus = async(id, status) =>{
        try {
           const response = await makeRequest(endpoint, "PUT", {status: status}, {}, {}, 0, id, "/userdata")

           console.log(response)
           console.log(response.status)

           if(response.status === "success"){
            toast.success("Status change succesfully!")
          }

            return response
        } catch (error) {
            console.error("Error in Home" ,error)
            toast.error("Error in changing status!")
        }
    }

  getUserHome();

  return {
    HomeData,
    getUserHome,
    updateAttendenceStatus, 
    page,
    limit,
    loading,
    totalPages
  };
});
