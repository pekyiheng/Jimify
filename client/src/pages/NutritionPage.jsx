import CaloriesWidget from '../components/CaloriesWidget';
import WeightWidget from '../components/WeightWidget';
import { useState, useEffect } from 'react';
import CustomizeUser from '../components/CustomizeUser';
import { getDoc, doc, increment } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { formatDateToYYYYMMDD } from '../helper';
import { Link } from "react-router-dom"
import { useUser } from "../UserContext";

const NutritionPage = () => {
  const curDate = formatDateToYYYYMMDD(new Date());
  const [totalCalories, setTotalCalories] = useState(0);
  const { userId, dailyCaloriesGoal } = useUser();

  useEffect(() => {
    fetchData(userId);
  }, []);

  const fetchData = async () => {
    const userCaloriesDocRef = doc(db, "Users", auth.currentUser.uid, "User_Calories", curDate);
    try {
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
            <h2>Weight</h2>
            <WeightWidget />
          </Link>
        </div>
      </>
    )
}

export default NutritionPage;