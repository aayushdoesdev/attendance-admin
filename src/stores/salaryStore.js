import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import { ref } from "vue";

export const usesalaryStore = defineStore("salary", () => {
  const endpoint = "admin";
  const salaryData = ref([]);
  const salaryRecords = ref([]);
  const loading = ref(false);
  const page = ref(1);
  const limit = ref(10);
  const totalPages = ref(0);

  const getUserSalary = async (filters = {}) => {
  try {
    loading.value = true;

    const queryParams = {
      page: page.value,
      limit: limit.value,
      ...filters,
    };

    const response = await makeRequest(
      "admin",
      "GET",
      {},
      {},
      queryParams,
      0,
      null,
      "/salarydetails"
    );

    const userData = response?.userData || [];
    const salaryRecordsArr = response?.salaryrecord || [];

    // Group addOns by userId
    const salaryMap = {};

    salaryRecordsArr.forEach((record) => {
      const uid = record.userId;
      if (!salaryMap[uid]) {
        salaryMap[uid] = [];
      }

      salaryMap[uid].push({
        amount: record.addOnAmount || 0,
        type: record.addOnType || '',
      });
    });

    // Enrich userData with all matching addOns
    const enrichedData = userData.map((emp) => {
      const addOns = salaryMap[emp.empId] || [];
      return {
        ...emp,
        addOns, // array of { amount, type }
      };
    });

    // Collect all addOns for global usage or display
    const allAddOns = salaryRecordsArr.map((rec) => ({
      amount: rec.addOnAmount || 0,
      type: rec.addOnType || '',
    }));

    // Optional: get unique addOn types
    const uniqueAddOnTypes = [...new Set(allAddOns.map((a) => a.type))];

    salaryData.value = enrichedData;
    salaryRecords.value = salaryRecordsArr;
    totalPages.value = response?.totalPages || 0;

  } catch (error) {
    console.error("Error in salary", error);
  } finally {
    loading.value = false;
  }
};



  const updateEmployeeSalary = async (employeeData) => {
    try {
      loading.value = true;

      const response = await makeRequest(
        endpoint,
        "POST",
        employeeData,
        {},
        {},
        0,
        null,
        "/salarydetails"
      );

      if(response.status === "success"){
            toast.success("Updated employee salary successfully!")
      }

      // Update the local data if the request is successful
      if (response && response.success) {
        const empIndex = salaryData.value.findIndex(
          (emp) => emp.empId === employeeData.userId // Changed from emp.id to emp.empId
        );

        if (empIndex !== -1) {
          salaryData.value[empIndex] = {
            ...salaryData.value[empIndex],
            actualSalary: employeeData.actualSalary,
            addOn: employeeData.addOnType, // Use addOnType instead of addOn
            payable: employeeData.payable,
          };
        }
      }

      return response;
    } catch (error) {
      console.error("Error updating salary:", error);
      toast.error("Error in updating employee salary!")
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Initialize data on store creation
  getUserSalary();

  return {
    salaryData,
    salaryRecords,
    getUserSalary,
    updateEmployeeSalary,
    loading,
    page,
    limit,
    totalPages,
  };
});
