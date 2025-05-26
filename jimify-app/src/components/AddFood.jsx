const AddFood = ({mealType}) => {
    const foodList = [{foodItem : "Food 1", calories : 100}, {foodItem : "Food 2", calories : 120}];

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
            <button type="submit">
                <p>+ Add food</p>
            </button>
        </div>
    )
}

export default AddFood;