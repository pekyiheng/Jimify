import { useEffect, useState } from 'react';
import { getDoc, updateDoc, setDoc, deleteField, doc, increment } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";
import Popup from 'reactjs-popup';

const AddFood = ({mealType, curDate, userId, onFoodChange}) => {
    const [foodList, setFoodList] = useState([]);
    const [newFood, setNewFood] = useState("");
    const [newCal, setNewCal] = useState(0);
    

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchFoodList(user.uid);
            }
            console.log(curDate);
        });
        return () => unsubscribe();
    }, [curDate]);

    const fetchFoodList = async (uid) => {
        const userCaloriesDocRef = doc(db, "Users", uid, "User_Calories", curDate);
        try {
            const docSnap = await getDoc(userCaloriesDocRef);
            if (docSnap.exists()) {
                const Meal_Map = docSnap.data().Meal_Map[mealType];
            
                const foodListTmp = [];
                for (const foodItem in Meal_Map) {
                    foodListTmp.push({foodItem: foodItem, calories: Meal_Map[foodItem]});
                }
                setFoodList(foodListTmp);
            } else {
                setFoodList([]);
            }
            
        } catch (e) {
            console.error("Error fetching food list:", e);
        }
    }

    const handleAddFood = async (e) => {
        e.preventDefault();
        const userCaloriesDocRef = doc(db, "Users", userId, "User_Calories", curDate);
        const calToAdd = parseInt(newCal, 10);
        
        try {
            await setDoc(userCaloriesDocRef, {
              Meal_Map: {
                [mealType]: {
                    [newFood]: calToAdd
                }
              },
              totalCalories: increment(calToAdd)
            }, {merge: true});
            console.log("Food item added successfully!");

            onFoodChange();
        } catch (error) {
            console.error("Error adding food item:", error);
        }

        setFoodList([...foodList, {foodItem: newFood, calories: newCal}]);
        setNewFood("");
        setNewCal(0);
    }

    const handleDeleteFood = async (foodItemToDelete, calToDecrement) => {
        const userCaloriesDocRef = doc(db, "Users", userId, "User_Calories", curDate);

        try {
            await updateDoc(userCaloriesDocRef, {
                [`Meal_Map.${mealType}.${foodItemToDelete}`]: deleteField(),
                totalCalories: increment(-calToDecrement)
            });
            console.log("Food item deleted successfully!");

            onFoodChange();

            setFoodList(foodList.filter(item => item.foodItem !== foodItemToDelete));

        } catch (error) {
            console.error("Error deleting food item:", error);
        }
    }
    
    return (
        <div className="addfood">
            <h3>{mealType}</h3>
            <ul>
                {foodList.map((foodItem) => (
                    <li key={foodItem.foodItem}>
                        {foodItem.foodItem} 
                        <span> - </span>
                        <span>{foodItem.calories} kcal</span>
                        <button id='deleteFoodBtn' onClick={() => handleDeleteFood(foodItem.foodItem, foodItem.calories)}>Delete</button>
                    </li>
                ))}
            </ul>
            <div>
                <Popup trigger={<button> + Add food </button>}>
                    <div style={{border: "solid", padding:"10px"}}>
                        <form onSubmit={handleAddFood}>
                            <div id='food'>
                                <label>Food</label>
                                <input name='foodItem' type='text' onChange={(e) => setNewFood(e.target.value)}></input>
                            </div>
                            <span>
                                <label>Cal</label>
                                <input name='caloriesVal' type='number' onChange={(e) => setNewCal(e.target.value)}></input>
                            </span>
                            <br></br>
                            <button type='submit'>Add</button>
                        </form>
                    </div>
                </Popup>
            </div>
        </div>
    )
}

export default AddFood;