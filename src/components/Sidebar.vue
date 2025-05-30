<script setup>
import { useLeaveStore } from "@/stores/leaveStore";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const leaveStore = useLeaveStore();

const { leaveData } = storeToRefs(leaveStore);

const approvedEmployees = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize time to compare only dates

  return leaveData.value?.filter((leave) => {
    const toDate = new Date(leave.to);
    toDate.setHours(0, 0, 0, 0);
    return leave.status === "approved" && toDate >= today;
  });
});

function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getLeaveDuration(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  // Round to whole days (ignore time zone offsets)
  const diffTime = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
}

const festivalData = {
  "January": [
    { "date": "2025-01-13", "name": "Lohri" },
    { "date": "2025-01-14", "name": "Makar Sankranti / Pongal" },
    { "date": "2025-01-06", "name": "Epiphany" },
    { "date": "2025-01-12", "name": "Baptism of Jesus" }
  ],
  "February": [
    { "date": "2025-02-02", "name": "Vasant Panchami" },
    { "date": "2025-02-26", "name": "Maha Shivaratri" },
    { "date": "2025-02-02", "name": "Candlemas" },
    { "date": "2025-02-14", "name": "Valentine's Day" },
    { "date": "2025-02-26", "name": "Ash Wednesday" }
  ],
  "March": [
    { "date": "2025-03-13", "name": "Holika Dahan" },
    { "date": "2025-03-14", "name": "Holi" },
    { "date": "2025-03-17", "name": "Saint Patrick's Day" },
    { "date": "2025-03-19", "name": "Saint Joseph's Day" }
  ],
  "April": [
    { "date": "2025-04-06", "name": "Rama Navami" },
    { "date": "2025-04-11", "name": "Good Friday" },
    { "date": "2025-04-13", "name": "Easter Sunday" }
  ],
  "May": [
    { "date": "2025-05-22", "name": "Telugu Hanuman Jayanti" },
    { "date": "2025-05-26", "name": "Vat Savitri Vrat" },
    { "date": "2025-05-18", "name": "Rogation Sunday" },
    { "date": "2025-05-22", "name": "Holy Thursday" }
  ],
  "June": [
    { "date": "2025-06-05", "name": "Ganga Dussehra" },
    { "date": "2025-06-06", "name": "Nirjala Ekadashi" },
    { "date": "2025-06-27", "name": "Jagannath Rath Yatra" },
    { "date": "2025-06-08", "name": "Pentecost" },
    { "date": "2025-06-12", "name": "Corpus Christi" }
  ],
  "July": [
    { "date": "2025-07-10", "name": "Guru Purnima" },
    { "date": "2025-07-23", "name": "Sawan Shivratri" },
    { "date": "2025-07-29", "name": "Nag Panchami" },
    { "date": "2025-07-25", "name": "St. James the Great Day" }
  ],
  "August": [
    { "date": "2025-08-08", "name": "Varalakshmi Vrat" },
    { "date": "2025-08-09", "name": "Raksha Bandhan" },
    { "date": "2025-08-15", "name": "Krishna Janmashtami" },
    { "date": "2025-08-15", "name": "Assumption of Mary" }
  ],
  "September": [
    { "date": "2025-09-05", "name": "Onam" },
    { "date": "2025-09-22", "name": "Navaratri Begins" }
  ],
  "October": [
    { "date": "2025-10-20", "name": "Diwali" },
    { "date": "2025-10-22", "name": "Govardhan Puja" }
  ],
  "November": [
    { "date": "2025-11-01", "name": "All Saints' Day" },
    { "date": "2025-11-02", "name": "All Souls' Day" }
  ],
  "December": [
    { "date": "2025-12-25", "name": "Christmas" }
  ]
};

// Get current month
const currentMonth = new Date().toLocaleString("default", { month: "long" });
const currentMonthEvents = computed(() => festivalData[currentMonth] || []);
</script>

<template>
  <section class="font-inter w-full md:min-w-[350px] md:max-w-[350px] space-y-2">
    <div class="bg-white rounded-md p-4 h-[320px]">
      <div class="flex items-center justify-between">
        <h2 class="font-bold">Employee on leaves</h2>
        <router-link to="/leave">See all</router-link>
      </div>

      <hr class="my-3" />

      <div class="h-[220px] overflow-y-auto pr-1 space-y-2">
        <div
          v-for="item in approvedEmployees"
          class="flex items-center justify-between"
        >
          <div class="flex flex-col mt-2">
            <p class="capitalize font-semibold">{{ item.name }}</p>
            <div class="flex gap-1 text-[12px]">
              <p>{{ formatDate(item.from) }}</p>
              -
              <p>{{ formatDate(item.to) }}</p>
            </div>
          </div>

          <div
            class="bg-blue-100 text-blue-500 font-semibold px-3 py-1 rounded-md text-[14px] mt-2"
          >
            {{ getLeaveDuration(item.from, item.to) }} Days
          </div>
        </div>
      </div>
    </div>

       <div class="bg-white rounded-md p-4 h-[330px]">
      <div class="flex items-center justify-between mb-2">
        <h2 class="font-bold">Celebration</h2>
      </div>
      <div class="h-[260px] overflow-y-auto space-y-2">
        <div
          v-for="event in currentMonthEvents"
          :key="event.date"
          class="flex justify-between items-center text-sm space-y-4"
        >
          <p>{{ event.name }}</p>
          <span class="text-gray-500 text-xs">{{ formatDate(event.date) }}</span>
        </div>
        <div v-if="currentMonthEvents.length === 0" class="text-gray-400 text-sm">
          No events this month.
        </div>
      </div>
    </div>
  </section>
</template>
