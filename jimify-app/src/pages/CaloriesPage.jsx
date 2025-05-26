import AddFood from "../components/AddFood";

const CaloriesPage = () => {
    const totalCalories = 100; //TODO: Dynamically retrieve value from db

    return (
        <div>
            <p>Calories: {totalCalories}</p>
            <AddFood mealType="Breakfast" />
            <AddFood mealType="Lunch" />
            <AddFood mealType="Dinner" />
        </div>
    );
}

export default CaloriesPage;