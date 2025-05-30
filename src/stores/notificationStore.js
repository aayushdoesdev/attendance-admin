import { defineStore } from "pinia";
import { ref } from "vue";


export const useNotificationStore = defineStore("notification", () => {

    const notificationData = ref([])


    return{
        notificationData
    }
})
  