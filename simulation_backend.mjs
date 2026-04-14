import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
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
