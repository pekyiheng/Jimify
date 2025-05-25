const AddFood = ({mealType}) => {
    return (
        <div className="addfood">
            <h3>{mealType}</h3>
            <ul>
                <li>Food 1</li>
            </ul>
            <button type="submit">
                <p>Add food</p>
            </button>
        </div>
    )
}

export default AddFood;