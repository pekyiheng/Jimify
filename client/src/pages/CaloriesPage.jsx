import AddFood from "../components/AddFood";
import { formatDateToYYYYMMDD } from "../helper";
import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";

const CaloriesPage = () => {
    const [totalCalories, setTotalCalories] = useState(0); //TODO: Dynamically retrieve value from db
    const [userId, setUserId] = useState(null);
    const [curDate, setCurDate] = useState(new Date())

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchCalories(user.uid);
            }
        });
        return () => unsubscribe();
    }, [curDate])

    const fetchCalories = async (uid) => {
        const userCaloriesDocRef = doc(db, "Users", uid, "User_Calories", formatDateToYYYYMMDD(curDate));

        try {
            const docSnap = await getDoc(userCaloriesDocRef);
            const newCalories = docSnap.data().totalCalories;
            setTotalCalories(newCalories);
        }
        catch (e) {
            console.error(e);
            setTotalCalories(0);
            return null;
        }
    }


    return (
        <div>            
            <header className="caloriesDateNav">
                <button onClick={() => setCurDate(new Date(curDate.setDate(curDate.getDate() - 1)))}>
                    &lt;
                </button>
                <p>{formatDateToYYYYMMDD(curDate)}</p>
                <button onClick={() => setCurDate(new Date(curDate.setDate(curDate.getDate() + 1)))}>
                    &gt;
                </button>
            </header>
            <p>Calories: {totalCalories}</p>
            <AddFood mealType="Breakfast" />
            <AddFood mealType="Lunch" />
            <AddFood mealType="Dinner" />
        </div>
    );
}

export default CaloriesPage;