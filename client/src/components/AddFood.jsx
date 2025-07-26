import { useEffect, useState } from 'react';
import { getDoc, updateDoc, setDoc, deleteField, doc, increment } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";
import Popup from 'reactjs-popup';
import { extractCalories } from '../helper';
import axios from 'axios';

const AddFood = ({mealType, curDate, userId, onFoodChange}) => {
    const [foodList, setFoodList] = useState([]);
    const [newFood, setNewFood] = useState("");
    const [newCal, setNewCal] = useState(0);
    const [selectedFoodCalValue, setSelectedFoodCalValue] = useState(0);
    const [servingSizeGram, setServingSizeGram] = useState(0);
    const [servingSizePerc, setServingSizePerc] = useState(100);
    const [searchedFoodList, setSearchedFoodList] = useState([]);
    const [boolCustomFood, setBoolCustomFood] = useState(false);
    const [showErr, setShowErr] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [keyPress, setKeyPress] = useState("");

    useEffect(() => {
        fetchFoodList(userId);
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

    const handleSearch = async (userInput) => {

        if (userInput == '' || keyPress === 'Backspace') {
            return;
        }

        try {
          const response = await axios.get(`https://api-tptl253ghq-uc.a.run.app/fatsecret/searchFood?q=${userInput}`);
          if (response.data.length > 0) {
            setSearchedFoodList(response.data);
            console.log(response.data);
            const foodObj = response.data;
            setNewFood(foodObj[0]['food_name']);
            const food_description = foodObj[0]['food_description'];
            setServingSizePerc(100); 
            setSelectedFoodCalValue(extractCalories(food_description));
            handleNewCalChange(extractCalories(food_description));
          }
        } catch (error) {
            setSearchedFoodList([]);
            console.error("Error fetching food list:", error);
        }
      };

      const handleSelectItem = (foodID) => {
        const foodObj = searchedFoodList.filter(foodItem => foodItem['food_id'] == foodID)
        setNewFood(foodObj[0]['food_name']);
        const food_description = foodObj[0]['food_description'];
        setServingSizePerc(100); 
        setSelectedFoodCalValue(extractCalories(food_description));
        handleNewCalChange(extractCalories(food_description));
             
      }

    const handleNewCalChange = (newCalValue) => {

        if (newCalValue < 0) {
            setNewCal(0);
        } else {
            setShowErr(false);
            const newCalVal = servingSizePerc / 100 * newCalValue;
            setNewCal(Math.round(newCalVal));
        }
        
    }

    const handleAddFood = async (e) => {
        e.preventDefault();
        const userCaloriesDocRef = doc(db, "Users", userId, "User_Calories", curDate);
        const calToAdd = parseInt(newCal, 10);

        if (newFood == "") {
            setErrorMessage("Please enter a food name");
            setShowErr(true);

            return;
        }

        if (isNaN(calToAdd) || calToAdd < 0) {
            setErrorMessage("Please enter a valid calorie value");
            setShowErr(true)    ;
            return;
        }
        
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

    const handleCustomFoodBtn = () => {
        setBoolCustomFood(!boolCustomFood);
        setNewCal(0);
        setNewFood('');
    }
    
    const handleNewServingChange = (e) => {
        const newServingValue = parseInt(e.target.value, 10);
        setServingSizePerc(newServingValue);
        const newCalVal = e.target.value / 100 * selectedFoodCalValue;
        setNewCal(Math.round(newCalVal));
    }

    const closePopup = () => {
        setBoolCustomFood(false);
        setShowErr(false);
        setNewCal(0);
        setNewFood('');
        setSelectedFoodCalValue(0);
        setServingSizePerc(100);
        setSearchedFoodList([]);
    }

    return (
        <div className="addfood">
            <h3>{mealType}</h3>
            <ul>
                {foodList.map((foodItem, idx) => (
                    <li key={foodItem.foodItem + '_' + idx}>
                        {foodItem.foodItem} 
                        <span> - </span>
                        <span>{foodItem.calories} kcal</span>
                        <button id='deleteFoodBtn' onClick={() => handleDeleteFood(foodItem.foodItem, foodItem.calories)}>Delete</button>
                    </li>
                ))}
            </ul>
            <div>
                <Popup trigger={<button> + Add food </button>} onClose={closePopup}>
                    <div className='AddFoodPopup'>
                        <form onSubmit={handleAddFood}>
                            {!boolCustomFood && (
                                <div id='useAPI'>
                                    <div id='searchFood'>
                                        <label>Search Food</label>
                                        <input name='foodItem' type='text' onKeyDown={e => setKeyPress(e.key)} onChange={(e) => {setNewFood(e.target.value);handleSearch(e.target.value)}}>
                                        </input>
                                        <select onChange={e => handleSelectItem(e.target.value)}>
                                            {searchedFoodList.map((foodItem) => (
                                                <option key={foodItem['food_id']} value={foodItem['food_id']}>{foodItem['food_name'] + " " + foodItem['food_description']}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div> 
                                        <p>Calories: {newCal} kcal</p>
                                        <label>Serving Size </label>
                                        <input type='range' min='0' max='100' value={servingSizePerc.toString()} onChange={handleNewServingChange}></input>
                                    </div>
                                </div>
                            )}
                            {boolCustomFood && (
                                <div id='customFood' className='form-grid'>
                                    <label>Food</label>
                                    <input name='foodItem' type='text' onChange={(e) => setNewFood(e.target.value)}></input>
                                    <label>Cal</label>
                                    <input name='caloriesVal' type='number' placeholder='0' value={newCal} onChange={e => handleNewCalChange(e.target.value)}></input>
                                </div>
                            )}
                            
                            <br></br>
                            <button type='submit'>Add</button>
                            <button type='button' onClick={handleCustomFoodBtn}>
                                {boolCustomFood && ("Cancel")}
                                {!boolCustomFood && ("Custom Food")}
                                
                            </button>
                            {showErr && <p className='invalidFields'>{errorMessage}</p>}
                        </form>
                    </div>
                </Popup>
            </div>
        </div>
    )
}

export default AddFood;