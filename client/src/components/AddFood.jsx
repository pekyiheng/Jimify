import { useState } from 'react';
import Popup from 'reactjs-popup';

const AddFood = ({mealType}) => {
    const [foodList, setFoodList] = useState([]);
    const [newFood, setNewFood] = useState("");
    const [newCal, setNewCal] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFoodList([...foodList, {foodItem: newFood, calories: newCal}]);
        setNewFood("");
        setNewCal(0);
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
                    </li>
                ))}
            </ul>
            <div>
                <Popup trigger={<button> + Add food </button>}>
                    <div style={{border: "solid", padding:"10px"}}>
                        <form onSubmit={handleSubmit}>
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