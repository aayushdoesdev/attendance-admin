<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import axios from "axios";
import LottieAnimation from "@/components/LottieAnimation.vue";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const name = ref("");
const password = ref("");
const organisation = ref("");
const industry = ref("");
const teamSize = ref("");
const otp = ref("");
const error = ref("");
const message = ref("");
const requested = ref(false);

// Get stored signup data when component mounts
onMounted(() => {
  const storedEmail = localStorage.getItem("signupEmail");
  const storedName = localStorage.getItem("signupName");
  const storedPassword = localStorage.getItem("signupPassword");
  const storedOrganisation = localStorage.getItem("signupOrganisation");
  const storedIndustry = localStorage.getItem("signupIndustry");
  const storedTeamSize = localStorage.getItem("signupTeamSize");

  if (storedEmail) {
    email.value = storedEmail;
    name.value = storedName || "";
    password.value = storedPassword || "";
    organisation.value = storedOrganisation || "";
    industry.value = storedIndustry || "";
    teamSize.value = storedTeamSize || "";
  } else {
    // If no stored data, redirect back to signup
    router.push("/signup");
  }
});

const verifyOtp = async () => {
  error.value = "";
  message.value = "";
  
  if (!otp.value) {
    error.value = "Please enter OTP.";
    return;
  }

  try {
    requested.value = true;
    const response = await axios.post("https://attendancebackends.onrender.com/admin/verify_signup", {
      email: email.value,
      otp: otp.value,
    });

    if (response.data) {
      message.value = response.data?.message || "Signup successful!";
      localStorage.setItem("userEmail", email.value);
      localStorage.getItem("userEmail" , email.value);
      localStorage.setItem('token', `Bearer ${response.data?.token}`)
      
      // Clear temporary signup data
      localStorage.removeItem("signupEmail");
      localStorage.removeItem("signupName");
      localStorage.removeItem("signupPassword");
      localStorage.removeItem("signupOrganisation");
      localStorage.removeItem("signupIndustry");
      localStorage.removeItem("signupTeamSize");
      
      setTimeout(() => router.push("/"), 800);
    } else {
      error.value = "Invalid OTP.";
    }
  } catch (err) {
    error.value = err.response?.data?.message || "OTP verification failed.";
    console.error("OTP verification error:", err);
  } finally {
    requested.value = false;
  }
};

const goBack = () => {
  router.push("/signup");
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <!-- Left Side Image -->
    <div class="w-[50%] p-2">
      <img src="/images/auth-image.png" alt="auth-image" />
    </div>

    <!-- Right Side OTP Form -->
    <div class="w-[50%] h-screen">
      <div class="flex flex-col mx-auto items-start justify-center h-full w-[70%] space-y-4">
        <h2 class="text-[30px] font-bold text-left">Verify OTP</h2>
        <p class="text-gray-600 mb-4">We've sent a 6-digit OTP to {{ email }}</p>
        
        <input
          v-model="otp"
          type="text"
          maxlength="6"
          placeholder="Enter 6-digit OTP"
          class="w-full p-2 border rounded-md mb-3"
        />
        
        <p v-if="message" class="text-green-600">{{ message }}</p>
        <p v-if="error" class="text-red-600">{{ error }}</p>
        
        <button
          @click="verifyOtp"
          :disabled="requested || !otp"
          class="w-full py-2 rounded-md"
          :class="otp && !requested ? 'bg-[#387ED1] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
        >
          <div v-if="requested" class="w-6 mx-auto">
            <LottieAnimation animationPath="/animation/small-loading.json" />
          </div>
          <p v-else>Verify OTP</p>
        </button>
        
        <button
          @click="goBack"
          class="w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Sign Up
        </button>
      </div>
    </div>
  </div>
</template>