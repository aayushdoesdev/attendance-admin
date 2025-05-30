// import { toast } from 'vue3-toastify'
// import 'vue3-toastify/dist/index.css'

// export function manageResponse(status, message, options = {}) {
//   const {
//     method = 'GET',
//     successToast = true,
//     errorToast = true,
//   } = options

//   // 💡 Skip toast for GET requests
//   if (method.toUpperCase() === 'GET') return

//   // 💡 Normalize status and message
//   const normalizedStatus = (status || 'unknown').toString().toLowerCase()
//   let normalizedMessage = message || 'Something went wrong.'

//   // 💡 Handle object messages to avoid "[object Object]"
//   if (typeof normalizedMessage === 'object') {
//     try {
//       normalizedMessage = JSON.stringify(normalizedMessage)
//     } catch {
//       normalizedMessage = 'Invalid message format.'
//     }
//   }

//   if (normalizedStatus === 'success' && successToast) {
//     toast.success(normalizedMessage)
//   } else if (normalizedStatus === 'error' && errorToast) {
//     toast.error(normalizedMessage)
//   } else {
//     toast.info(normalizedMessage)
//   }
// }
