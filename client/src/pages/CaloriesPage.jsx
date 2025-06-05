import AddFood from "../components/AddFood";
import { formatDateToYYYYMMDD } from "../helper";
import { useState, useEffect } from "react";
import { getDoc, doc, } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";

const CaloriesPage = () => {
    const [totalCalories, setTotalCalories] = useState(0);
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
            let newCalories = 0;
            if (docSnap.exists()) {
                const data = docSnap.data();
                newCalories = data.totalCalories || 0;
            }
            setTotalCalories(newCalories);
        }
        catch (e) {
            console.error(e);
            setTotalCalories(0);
            return null;
        }
    }

    const handleFoodChange = () => {
        fetchCalories(userId);
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
            <AddFood mealType="Breakfast" curDate={formatDateToYYYYMMDD(curDate)} userId={userId} onFoodChange={handleFoodChange} />
            <AddFood mealType="Lunch" curDate={formatDateToYYYYMMDD(curDate)} userId={userId} onFoodChange={handleFoodChange} />
            <AddFood mealType="Dinner" curDate={formatDateToYYYYMMDD(curDate)} userId={userId} onFoodChange={handleFoodChange} />
        </div>
    );
}

export default CaloriesPage;