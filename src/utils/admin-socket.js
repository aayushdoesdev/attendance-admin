// import { io } from "socket.io-client";
// // import { useNotificationStore } from "@/stores/notificationStore";
// // import { storeToRefs } from "pinia";

// // const notificationStore = useNotificationStore()

// // const {notificationData} = storeToRefs(notificationStore)

// const socket = io("http://192.168.1.8:8000"); // replace with your backend URL/port

// socket.on("connect", () => {
//   console.log("✅ Admin connected:", socket.id);
//   socket.emit("register", "admin"); // tell server this is an admin
// });

// socket.on("notification", (msg) => {
//     console.log("📩 New message from user:", msg);
//     // notificationData.value.push(msg);
// });

// export default socket;
