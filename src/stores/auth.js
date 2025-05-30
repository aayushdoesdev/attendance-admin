//store 
// store/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'


export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
  }),
  actions: {
    async loginAdmin(payload) {
      const res = await axios.post('https://attendancebackends.onrender.com/admin/login', payload)
      const token = res.data.token
      localStorage.setItem('token', `Bearer ${token}`)
      this.token = token
      return res
    },
    async signupAdmin(payload) {
      const res = await axios.post('https://attendancebackends.onrender.com/admin/signup', payload)
      return res.data.message
    },
    // logout() {
    //   localStorage.removeItem('token')
    //   this.token = ''
    //   window.location.reload();
    // },
    isAuthenticated() {
      return !!this.token
    }
  }
})