import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import { ref } from "vue";
import { toast } from "vue3-toastify";

export const useEmployeeStore = defineStore("employee", () => {
  const endpoint = "admin";
  const allEmployeeData = ref([]);
  const loading = ref(true);
  const employeeData = ref([]);
  const page = ref(1)
  const limit = ref(10)
  const totalPages = ref("")

  const getallEmployees = async (filters = {}) => {
    loading.value = true;

    const queryParams = {
        page: page.value,
        limit: limit.value,
        ...filters, // Spread searchName, department, status
      };

    try {
      const response = await makeRequest("/user", "GET", {}, {}, queryParams, 0, null, "/admin/allusers/all");
      allEmployeeData.value = response?.users;
      totalPages.value = response?.totalPages
    } catch (error) {
      console.error("Error in fetching all employes data", error);
    } finally{
      loading.value = false;
    }
  };

  const createNewEmployee = async (data) => {
    try {
      await makeRequest("/user", "POST", data, {}, {page : page.value, limit: limit.value}, 0, null, "/admin/signup");
      if(response.status === "success"){
      toast.success("Employee Created Successfully!")
    }
      return response; 
    } catch (error) {
      console.error("Error in creating new employee", error);
      toast.success("Error in employee creation!")
    }
  };

  const updateEmployee = async (id, data) => {
    try {
      const response = await makeRequest("/user", "PUT", data, {}, {}, 0, id);
      if (response?.status === "success") {
      toast.success("Employee updated successfully!");
    }
      return response; 
    } catch (error) {
      console.error("Error in updating employee", error);
      toast.error("Error in employee updation!");
    }
  }

  const deleteEmployee = async (id) => {
    try {
      await makeRequest("/user", "DELETE", {}, {}, {}, 0, id)
      if (response?.status === "success") {
      toast.success("Employee deleted successfully!");
    }
    } catch (error) {
      console.error("Error in deleting employee", error);
      toast.error("Error in deleting employee!");
    }
  }

  getallEmployees();

  return {
    allEmployeeData,
    getallEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    loading,
    page,
    limit,
    totalPages
  };
});

