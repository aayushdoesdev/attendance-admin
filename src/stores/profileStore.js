import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import { ref } from "vue";

export const useProfileStore = defineStore("profile", () => {
  const endpoint = "admin";
  const companyData = ref([]);
  const companyDetails = ref([]);
  const punchInDetails = ref([]);
  const holidayDetails = ref([]);
  const weekendDetails = ref([]);
  const companyDocuments = ref([]);
  const companyLeaves = ref([]);

  const getCompanyDetails = async () => {
    try {
      const response = await makeRequest(
        endpoint,
        "GET",
        {},
        {},
        {},
        0,
        null,
        "/companyDetails"
      );
      companyDetails.value = response.data;
      companyData.value = response.data?.cmpDetail;
    } catch (error) {
      console.error(error);
    }
  };

  const addCompanyDetails = async (form) => {
    try {
      const response = await makeRequest(endpoint, "POST", form, {}, {}, 0, null, "/companydetails");
      if (response.status === "success") {
        toast.success("Successfully added company details!");
      }
      return response;
    } catch (error) {
      console.error(error);
      toast.error("Error in adding company details!")
    }
  };

  const editCompanyDetails = async (form) => {
    try {
      const response = await makeRequest(
        endpoint,
        "PUT",
        form,
        {},
        {},
        0,
        null,
        "/companyDetails"
      );
      if (response.status === "success") {
        toast.success("Successfully updated company details!");
      }
      return response;
    } catch (error) {
      console.error(error);
      toast.error("Error in updating company details!")
    }
  };

  const getPunchInDetails = async () => {
    try {
      const response = await makeRequest(
        endpoint,
        "GET",
        {},
        {},
        {},
        0,
        null,
        "/punchdetails"
      );
      punchInDetails.value = response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const addPunchInDetails = async (form) => {
    try {
      const response = await makeRequest(
        endpoint,
        "POST",
        { form },
        {},
        {},
        0,
        null,
        "/punchdetails"
      );
      if(response.status === "success"){
            toast.success("Successfully added punchin details!")
      }
      return response;
    } catch (error) {
      console.error(error);
      toast.error("Error in updating punchin details!")
    }
  };

  const editPunchInDetails = async (id, form) => {
    try {
      const response = await makeRequest(
        endpoint,
        "PUT",
        { form },
        {},
        {},
        0,
        id,
        "/punchdetails"
      );
      if(response.status === "success"){
            toast.success("Succesfully update punchin details!")
      }
      return response;
    } catch (error) {
      console.error(error);
      toast.error("Error in updating punchin details!")
    }
  };

  const getHolidayDetails = async () => {
    try {
      const response = await makeRequest(
        endpoint,
        "GET",
        {},
        {},
        {},
        0,
        null,
        "/holiday"
      );
      holidayDetails.value = response?.data;
    } catch (error) {
      console.error(error);
    }
  };

  const postHolidayDetails = async (data) => {
    try {
      const response = await makeRequest(
        endpoint,
        "POST",
        data,
        {},
        {},
        0,
        null,
        "/holiday"
      );
      if(response.status === "success"){
            toast.success("Successfully added holiday details!")
      }
      holidayDetails.value = response;
    } catch (error) {
      console.error(error);
      toast.error("Error in adding holiday details!")
    }
  };

  const editHolidayDetails = async (data, id) => {
    try {
      const response = await makeRequest(
        endpoint,
        "PUT",
        { isActive: data },
        {},
        {},
        0,
        id,
        "/holiday"
      );
      if(response.status === "success"){
            toast.success("Successfully edited holiday!")
      }
      return response;
    } catch (error) {
      console.error(error);
      toast.error("Error in updating holiday!")
    }
  };

  const getWeekendDetails = async () => {
    try {
      const response = await makeRequest(
        endpoint,
        "GET",
        {},
        {},
        {},
        0,
        null,
        "/weekend"
      );
      weekendDetails.value = response?.data;
    } catch (error) {
      console.error(error);
    }
  };

  const postWeekendDetails = async (form) => {
    try {
      const response = await makeRequest(
        endpoint,
        "POST",
        { form },
        {},
        {},
        0,
        null,
        "/weekend"
      );
      if(response.status === "success"){
            toast.success("Successfully added the weekend details!")
      }
      weekendDetails.value = response;
    } catch (error) {
      console.error(error);
      toast.error("Error in adding the weekend details!")
    }
  };

  const getCompanyDocument = async () => {
    try {
      const response = await makeRequest(
        endpoint,
        "GET",
        {},
        {},
        {},
        0,
        null,
        "/companydocument"
      );
      companyDocuments.value = response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const postCompanyDocument = async (data) => {
    try {
      const response = await makeRequest(
        endpoint,
        "POST",
        data,
        {},
        {},
        0,
        null,
        "/companydocument"
      );
      if(response.status === "success"){
            toast.success("Successfully added company documents!")
      }
      getCompanyDocument();
      return response;
    } catch (error) {
      console.error(error);
      toast.error("Error in posting company documents!")
    }
  };

  const deleteCompanyDocument = async (id) => {
    try {
      const response = await makeRequest(
        endpoint,
        "DELETE",
        {},
        {},
        {},
        0,
        id,
        "/companydocument"
      );
      if(response.status === "success"){
            toast.success("Successfully deleted company document!")
      }
      return response;
    } catch (error) {
      console.error(error);
      toast.error("Error in deleting company document!")
    }
  };

  const getCompanyLeaves = async () => {
    try {
      const response = await makeRequest(
        endpoint,
        "GET",
        {},
        {},
        {},
        0,
        null,
        "/leave"
      );
      companyLeaves.value = response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const postCompanyLeaves = async (data) => {
    try {
      const method = data._id ? "PUT" : "POST";
      const url = data._id ? `/leave/${data._id}` : "/leave"; // if ID exists, PUT to specific resource

      const response = await makeRequest(
        endpoint,
        method,
        data,
        {},
        {},
        0,
        null,
        url
      );
      if(response.status === "success"){
            toast.success("Successfully updated the company leaves!")
      }
      return response;
    } catch (error) {
      console.error(error);
      toast.error("Error in updating company leaves!")
    }
  };

  getCompanyDetails();
  getPunchInDetails();
  getWeekendDetails();
  getHolidayDetails();
  getCompanyDocument();
  getCompanyLeaves();

  return {
    companyData,
    companyDetails,
    getCompanyDetails,
    addCompanyDetails,
    editCompanyDetails,
    editPunchInDetails,
    postHolidayDetails,
    postWeekendDetails,
    postCompanyLeaves,
    editHolidayDetails,
    companyDocuments,
    postCompanyDocument,
    deleteCompanyDocument,
    addPunchInDetails,
    punchInDetails,
    holidayDetails,
    companyLeaves,
    weekendDetails,
  };
});
