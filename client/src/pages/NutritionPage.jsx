import CaloriesWidget from '../components/CaloriesWidget';
import WeightWidget from '../components/WeightWidget';
import { useState, useEffect, useRef } from 'react';
import CustomizeUser from '../components/CustomizeUser';
import { getDoc, updateDoc, setDoc, deleteField, doc, increment } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";
import { formatDateToYYYYMMDD } from '../helper';
import { Link } from "react-router-dom"

const NutritionPage = () => {
  const curDate = formatDateToYYYYMMDD(new Date());
  const [totalCalories, setTotalCalories] = useState(0);
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchData(user.uid);
        }
    });
    return () => unsubscribe();
  }, [dailyCaloriesGoal]);

  const fetchData = async () => {
    const userProfileDocRef = doc(db, "Users", auth.currentUser.uid);
    const userCaloriesDocRef = doc(db, "Users", auth.currentUser.uid, "User_Calories", curDate);
    try {
      const profileDocSnap = await getDoc(userProfileDocRef);
      if (profileDocSnap.exists() && profileDocSnap.data().Daily_Calories) {
        setDailyCaloriesGoal(profileDocSnap.data().Daily_Calories);
      } else {
        console.log("No such document!");
        setDailyCaloriesGoal(0);
      }

      const caloriesDocSnap = await getDoc(userCaloriesDocRef);
      if (caloriesDocSnap.exists()) {
        setTotalCalories(caloriesDocSnap.data().totalCalories);
      } else {
        console.log("No such document!");
        setTotalCalories(0);
      }
    } catch (e) {
      console.error("Error fetching food list:", e);
    }
  }

  return (
      <>
        <CustomizeUser />
        <div className='widgets'>
          <Link to="/caloriesPage">
            <CaloriesWidget totalCalories={totalCalories} dailyCaloriesGoal={dailyCaloriesGoal} />
          </Link>
        </div>
        <div className='widgets'>
          <Link to="/weightPage">
            <WeightWidget />
          </Link>
        </div>
      </>
    )
}

export default NutritionPage;