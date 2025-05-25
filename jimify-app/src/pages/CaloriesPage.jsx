import AddFood from "../components/AddFood";

const CaloriesPage = () => {
    return (
        <div>
            <p>Calories</p>
            <AddFood mealType={"Breakfast"}/>
            <AddFood mealType={"Lunch"}/>
            <AddFood mealType={"Dinner"}/>
        </div>
    );
}

export default CaloriesPage;