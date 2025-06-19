import AddFood from "../components/AddFood";
import { formatDateToYYYYMMDD } from "../helper";
import { useState, useEffect } from "react";
import { getDoc, doc, } from "firebase/firestore";
import { db } from "../firebase_config"
import { useUser } from "../UserContext";

const CaloriesPage = () => {
    const [totalCalories, setTotalCalories] = useState(0);
    const [curDate, setCurDate] = useState(new Date());
    const { userId } = useUser();

    useEffect(() => {
        fetchCalories(userId)
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