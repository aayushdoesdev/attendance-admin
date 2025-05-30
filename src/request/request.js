import axios from 'axios'

// === BASE CONFIG ===

// Set your API base URL once
const BASE_URL = 'https://attendancebackends.onrender.com' // Replace with your real API base URL
axios.defaults.baseURL = BASE_URL

// === REQUEST INTERCEPTOR ===
// Adds token from localStorage automatically
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token') // Assumes token already includes "Bearer"
  if (token) {
    config.headers.Authorization = token
  }
  return config
}, error => Promise.reject(error))

// === RESPONSE INTERCEPTOR ===
// Handles unauthorized globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn('401 Unauthorized – redirecting or clearing token')
      localStorage.removeItem('token')
      // Optional: Redirect to login
      window.location.href = '/login' // Or use router if in Vue
    }
    return Promise.reject(error)
  }
)

// === MAKE REQUEST FUNCTION ===

/**
 * Make a request to the API
 * 
 * @param {string} endpoint - Base endpoint (e.g. 'userleave')
 * @param {string} method - HTTP method (e.g. 'GET', 'POST')
 * @param {Object} data - Request body
 * @param {Object} config - Axios config overrides
 * @param {Object} params - URL query parameters
 * @param {number} [wait=0] - Optional delay in milliseconds
 * @param {string|number} [id=null] - Optional request ID
 * @param {string} [subEndpoint=''] - Optional sub-route (e.g. '/admin')
 * @returns {Promise<any>}
 */
export async function makeRequest(
  endpoint,
  method = 'GET',
  data = {},
  config = {},
  params = {},
  wait = 0,
  id = null,
  subPath = ''
) {
  try {
    if (!endpoint) throw new Error('Endpoint is required')

    if (wait > 0) {
      await new Promise(resolve => setTimeout(resolve, wait))
    }

    // Build final endpoint path (subPath before id)
    let fullEndpoint = endpoint
    if (subPath) fullEndpoint += `${subPath}`
    if (id) fullEndpoint += `/${id}`

    const response = await axios({
      url: fullEndpoint,
      method: method.toUpperCase(),
      data,
      params,
      ...config,
    })

    // console.log(`[Request${id ? ` - ${id}` : ''}]`, {
    //   url: fullEndpoint,
    //   method,
    //   params,
    //   data,
    //   status: response.status,
    // })

    return response.data
  } catch (error) {
    console.error(`[Request Failed${id ? ` - ${id}` : ''}]`, error)
    throw error
  }
}

