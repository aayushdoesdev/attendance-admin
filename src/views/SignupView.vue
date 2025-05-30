<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import axios from "axios";
import LottieAnimation from "@/components/LottieAnimation.vue";

const router = useRouter();
const auth = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const organisation = ref("");
const industry = ref("");
const teamSize = ref("");
const error = ref("");
const message = ref("");
const showPassword = ref(false);
const checkTnC = ref(false);
const requested = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const signup = async () => {
  error.value = "";
  message.value = "";

  if (
    !name.value ||
    !email.value ||
    !password.value ||
    !confirmPassword.value ||
    !organisation.value ||
    !industry.value ||
    !teamSize.value
  ) {
    error.value = "Please fill in all fields.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }

  if (!checkTnC.value) {
    error.value = "Please accept the terms and conditions.";
    return;
  }

  try {
    requested.value = true;
    
    // Store all signup data in localStorage for OTP page
    localStorage.setItem("signupEmail", email.value);
    localStorage.setItem("signupName", name.value);
    localStorage.setItem("signupPassword", password.value);
    localStorage.setItem("signupOrganisation", organisation.value);
    localStorage.setItem("signupIndustry", industry.value);
    localStorage.setItem("signupTeamSize", teamSize.value);

    const payload = {
      name: name.value,
      email: email.value,
      password: password.value,
      organisation: organisation.value,
      industry: industry.value,
      teamSize: teamSize.value,
    };

    const response = await axios.post("https://attendancebackends.onrender.com/admin/signup", payload);

    if (response.data) {
      // Navigate to OTP verification page immediately
      router.push("/otp-verify");
    } else {
      error.value = "Failed to send OTP.";
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to send OTP.";
    console.error("Signup error:", err);
  } finally {
    requested.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <!-- Left Side Image -->
    <div class="hidden xl:block xl:w-[50%] p-2">
      <img src="/images/auth-image.png" alt="auth-image" />
    </div>

    <!-- Right Side Form -->
    <div class="w-full md:w-[80%] xl:w-[50%] h-screen">
      <div class="flex flex-col mx-auto items-start justify-center h-full w-[70%] space-y-4">
        <div class="xl:hidden mx-auto">
          <img src="/svg/logo.svg" alt="Logo" class="w-[200px] " />
        </div>
        <h2 class="text-[30px] font-bold text-left">Create an account</h2>

        <input v-model="name" type="text" placeholder="Name" class="mb-3 w-full p-2 border rounded-md" />
        <input v-model="email" type="email" placeholder="Email" class="mb-3 w-full p-2 border rounded-md" />
        <input v-model="organisation" type="text" placeholder="Organisation name" class="mb-3 w-full p-2 border rounded-md" />
        <input v-model="industry" type="text" placeholder="Industry Type" class="mb-3 w-full p-2 border rounded-md" />

        <select v-model="teamSize" class="mb-3 w-full p-2 border rounded-md">
          <option disabled value="">Select Team Size</option>
          <option>1-10</option>
          <option>11-50</option>
          <option>51-200</option>
          <option>201-500</option>
          <option>500+</option>
        </select>

        <div class="w-full border rounded-md px-4 flex items-center justify-between">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Enter Password" class="w-full py-2 bg-transparent outline-none" />
          <button type="button" @click="togglePasswordVisibility" class="pi" :class="showPassword ? 'pi-eye-slash' : 'pi-eye'"></button>
        </div>

        <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" placeholder="Confirm Password" class="mb-3 w-full p-2 border rounded-md" />

        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="checkTnC" id="tnc" />
          <label for="tnc" class="text-sm">
            I agree to the
            <a href="/terms-and-conditions" class="text-blue-600 hover:underline">T&C</a> and
            <a href="/privacy-policy" class="text-blue-600 hover:underline">Privacy Policy</a>
          </label>
        </div>

        <p v-if="message" class="text-green-600">{{ message }}</p>
        <p v-if="error" class="text-red-600">{{ error }}</p>

        <button
          @click="signup"
          :disabled="!checkTnC || requested"
          class="w-full py-2 rounded-md"
          :class="checkTnC ? 'bg-[#387ED1] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
        >
          <div v-if="requested" class="w-6 mx-auto">
            <LottieAnimation animationPath="/animation/small-loading.json" />
          </div>
          <p v-else>Sign Up</p>
        </button>

        <p class="text-sm mt-3 text-center mx-auto">
          Already have an account?
          <router-link to="/login" class="text-blue-600">Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>