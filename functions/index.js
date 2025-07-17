const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const express = require("express");
const cors = require("cors");

const fatsecretRoutes = require("./routes/fatsecretRoutes");

const app = express();
/*
const allowedOrigins = [
  "jimify-a6795.web.app",
  "https://jimify-a6795.firebaseapp.com/",
];
*/

app.use(cors({origin: true}));

/*
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));
*/

app.use(express.json());
app.use("/fatsecret", fatsecretRoutes);

exports.api = onRequest(app);

exports.weeklyBadgeCheck = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: 'Asia/Singapore',
    region: "asia-southeast2",
  },
  async (context) => {
    const admin = require('firebase-admin')
    admin.initializeApp();

    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const oneWeekAgo = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - 7 * 24 * 60 * 60 * 1000
    );

    const usersSnap = await db.collection('Users').get();
    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      
      const workoutWarriorBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('workout_Warrior');
      const workoutWarriorBadgeSnap = await workoutWarriorBadgeRef.get();
      if (!workoutWarriorBadgeSnap.exists) {
        const workoutsSnap = await db.collection('Users').doc(uid).collection('User_Workout').where('time', '>=', oneWeekAgo).get();
        if (workoutsSnap.size >= 1) {
          await workoutWarriorBadgeRef.set({earnedOn: now}, {merge: true});
        }
      }
    }
  }
);

