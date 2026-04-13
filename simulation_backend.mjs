import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBaxthnJSLhkjkLF8_bXNVkc_YKB3E70yA",
  authDomain: "aislebe.firebaseapp.com",
  databaseURL: "https://aislebe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aislebe",
  storageBucket: "aislebe.firebasestorage.app",
  messagingSenderId: "640023929786",
  appId: "1:640023929786:web:968124c68474c8538f7383",
  measurementId: "G-X5D49KX8G1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const stateRef = ref(db, 'venueState');

let minute = 30;

const runSimulationTick = async () => {
   minute += 1;
   console.log(`[+] Executing live DB push... Match Minute: ${minute}`);

   // Mock logic: Game is tied at 1-1, wait times fluctuate
   const crowdMod = Math.sin(minute) > 0 ? "high" : "low";
   const waitMins = Math.floor(Math.random() * 15) + 5;

   const statePayload = {
      venue: {
         matchInfo: {
            homeTeam: "City FC",
            awayTeam: "United",
            homeScore: minute > 40 ? 2 : 1,
            awayScore: 1,
            minute: minute
         },
         gates: {
            "Gate 1": { crowdLevel: "low" },
            "Gate 2": { crowdLevel: "moderate" },
            "Gate 3": { crowdLevel: crowdMod },
            "Gate 4": { crowdLevel: "low" }
         },
         concessions: {
            north_stand: { waitMins: waitMins, crowdLevel: crowdMod, name: "North Stand Bites" }
         },
         restrooms: {
            r1: { waitMins: Math.floor(Math.random() * 5), crowdLevel: "low" }
         }
      },
      alerts: minute === 38 ? [{
         id: "food_spike",
         type: "food_alert",
         title: "Queue Efficiency",
         message: "North standby queue drops by 60%. Highly recommend placing your mobile order now."
      }] : minute === 85 ? [{
          id: "exit_alert",
          type: "exit_alert",
          title: "Clearance Strategy",
          message: "Pre-egress routing optimized. To dodge 80% density delays to transit, execute exit parameter."
      }] : []
   };

   try {
      await set(stateRef, statePayload);
      console.log("   -> Firebase Updated.");
   } catch (e) {
      console.error("   -> Firebase Push Failed", e);
   }
};

console.log("=========================================");
console.log(" AisleBe Real-Time Injection Backend     ");
console.log("=========================================");
// Initial tick
runSimulationTick();
// Run every 10 seconds to simulate game flow actively pushing UI updates
setInterval(runSimulationTick, 10000);
