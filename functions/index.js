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

exports.dailyBadgeCheck = onSchedule(
  {
    schedule: "55 23 * * *",
    timeZone: 'Asia/Singapore',
    region: "asia-southeast2",
  },
  async (context) => {
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp();
    }

    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const oneWeekAgo = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - 7 * 24 * 60 * 60 * 1000
    );

    const usersSnap = await db.collection('Users').get();
    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      
      const workoutWarriorBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('workout_warrior');
      const workoutWarriorBadgeSnap = await workoutWarriorBadgeRef.get();
      if (!workoutWarriorBadgeSnap.exists) {
        try {
          const workoutsSnap = await db.collection('Users').doc(uid).collection('User_Workout').where('time', '>=', oneWeekAgo).get();
          if (workoutsSnap.size >= 1) {
            await workoutWarriorBadgeRef.set({earnedOn: now}, {merge: true});
          }
        } catch (e) {
          console.log("Error with workout warrior: ", e);
        }
      }

      const babyStepsBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('baby_steps');
      const babyStepsBadgeSnap = await babyStepsBadgeRef.get();
      if (!babyStepsBadgeSnap.exists) {
        try {
          const userEXP = userDoc.data().exp;
          const userLevel = Math.floor(Math.pow(userEXP / 100, 2/3));
          if (userLevel >= 1) {
            await babyStepsBadgeRef.set({earnedOn: now}, {merge: true});
          }
        } catch (e) {
          console.log("Error with baby steps: ", e);
        }
      }

      const consistencyIsKingBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('consistency_is_king');
      const consistencyIsKingBadgeSnap = await consistencyIsKingBadgeRef.get();
      if (!consistencyIsKingBadgeSnap.exists) {
        try {
          const userEXP = userDoc.data().exp;
          const userLevel = Math.floor(Math.pow(userEXP / 100, 2/3));
          if (userLevel >= 10) {
            await consistencyIsKingBadgeRef.set({earnedOn: now}, {merge: true});
          }
        } catch (e) {
          console.log("Error with consistency is king: ", e);
        }
        
      }

      const weightWatcherBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('weight_watcher');
      const weightWatcherBadgeSnap = await weightWatcherBadgeRef.get();
      if (!weightWatcherBadgeSnap.exists) {
        try {
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
        } catch (e) {
          console.log("Error with weight watcher: ", e);
        }
      }

      const foodFighterBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('food_fighter');
      const foodFighterBadgeSnap = await foodFighterBadgeRef.get();
      if (!foodFighterBadgeSnap.exists) {
        try {
          const today = new Date();
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(today.getDate() - 7);

          const start = oneWeekAgo.toISOString().slice(0, 10);
          const end = today.toISOString().slice(0, 10);

          const userDocSnap = await db.collection('Users').doc(uid).get();
          const dailyCaloricGoal = userDocSnap.data().Daily_Calories;

          const userCaloriesRef = db.collection('Users').doc(uid).collection('User_Calories');
          const userCaloriesSnap = await userCaloriesRef
            .where(admin.firestore.FieldPath.documentId(), '>=', start)
            .where(admin.firestore.FieldPath.documentId(), '<=', end)
            .get();

          if (userCaloriesSnap.size >= 7) {
            let streak = 0;
            for (const doc of userCaloriesSnap.docs) {
              const curDayTotalCal = doc.data().totalCalories;
              if (curDayTotalCal >= dailyCaloricGoal * 0.95 && curDayTotalCal <= dailyCaloricGoal * 1.05) {
                streak++;
              }
            }
            console.log(`${uid}: food streak number ${streak}`);
            if (streak >= 7) {
              await foodFighterBadgeRef.set({earnedOn: now}, {merge: true});
            }
          }
        } catch (e) {
          console.log("Error with food fighter: ", e);
        }
      }

      const itTakesTwoToTangoBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('it_takes_two_to_tango');
      const itTakesTwoToTangoBadgeSnap = await itTakesTwoToTangoBadgeRef.get();
      if (!itTakesTwoToTangoBadgeSnap.exists) {
        try {
          const noOfFriends = userDoc.data().friends.length;
          if (noOfFriends >= 1) {
            await itTakesTwoToTangoBadgeRef.set({earnedOn: now}, {merge: true});
          }
        } catch (e) {
          console.log("Error with it takes two to tango: ", e);
        }
      }

      const networkKingBadgeRef = db.collection('Users').doc(uid).collection('User_Badges').doc('network_king');
      const networkKingBadgeSnap = await networkKingBadgeRef.get();
      if (!networkKingBadgeSnap.exists) {
        try {
          const noOfFriends = userDoc.data().friends.length;
          if (noOfFriends >= 30) {
            await networkKingBadgeRef.set({earnedOn: now}, {merge: true});
          }
        } catch (e) {
          console.log("Error with network king: ", e);
        }
      }
    }
  }
);

