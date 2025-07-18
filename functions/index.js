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
    schedule: "55 23 * * *",
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

      const babyStepsBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('baby_Steps');
      const babyStepsBadgeSnap = await babyStepsBadgeRef.get();
      if (!babyStepsBadgeSnap.exists) {
        const userEXP = userDoc.data().exp;
        const userLevel = Math.floor(Math.pow(exp / 100, 2/3));
        if (userLevel >= 1) {
          await babyStepsBadgeRef.set({earnedOn: now}, {merge: true});
        }
      }

      const consistencyIsKingBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('consistency_Is_King');
      const consistencyIsKingBadgeSnap = await consistencyIsKingBadgeRef.get();
      if (!consistencyIsKingBadgeSnap.exists) {
        const userEXP = userDoc.data().exp;
        const userLevel = Math.floor(Math.pow(exp / 100, 2/3));
        if (userLevel >= 10) {
          await consistencyIsKingBadgeRef.set({earnedOn: now}, {merge: true});
        }
      }

      const weightWatcherBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('weight_Watcher');
      const weightWatcherBadgeSnap = await weightWatcherBadgeRef.get();
      if (!weightWatcherBadgeSnap.exists) {
        const weightsSnap = await db.collection('Users').doc(uid).collection('User_Weight').where('time', '>=', oneWeekAgo).get();
        if (weightsSnap.size >= 7) {
          const array = weightsSnap.docs;
          array.sort((a, b) => a.data().time.toDate() - b.data().time.toDate());
          let streak = 1;
          for (let i = 0; i < array.length - 1; i++) {
            timeOne = array[i].data().time.toDate();
            timeTwo = array[i + 1].data().time.toDate();
            dateOne = new Date(timeOne.getFullYear(), timeOne.getMonth(), timeOne.getDate());
            dateTwo = new Date(timeTwo.getFullYear(), timeTwo.getMonth(), timeTwo.getDate());
            if (dateTwo - dateOne == 24 * 60 * 60 * 1000) {
              streak++;
            }
          }
          if (streak == 7) {
            await weightWatcherBadgeRef.set({earnedOn: now}, {merge: true});
          }
        }
      }

      const itTakesTwoToTangoBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('it_Takes_Two_To_Tango');
      const itTakesTwoToTangoBadgeSnap = await itTakesTwoToTangoBadgeRef.get();
      if (!itTakesTwoToTangoBadgeSnap.exists) {
        const noOfFriends = userDoc.data().friends.length;
        if (noOfFriends >= 1) {
          await itTakesTwoToTangoBadgeRef.set({earnedOn: now}, {merge: true});
        }
      }

      const networkKingBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('network_King');
      const networkKingBadgeSnap = await networkKingBadgeRef.get();
      if (!networkKingBadgeSnap.exists) {
        const noOfFriends = userDoc.data().friends.length;
        if (noOfFriends >= 30) {
          await networkKingBadgeRef.set({earnedOn: now}, {merge: true});
        }
      }
    }
  }
);

