import { useState } from "react";

const TrainingPage = () => {
    const [oldWorkoutPlan, setWorkoutPlan] = useState([]);
    const [oldWorkout, setWorkout] = useState([]);
    
    const handleNewWorkoutPlan = () => {
        const workout = prompt("New Workout Plan:");
        const workoutDetails = prompt("Workout Details:");
        if (workout && workoutDetails) {
            setWorkoutPlan([...oldWorkoutPlan, {workout, workoutDetails}]);
        }
    }

    const handleDeleteWorkoutPlan = (index) => {
        const updatedWorkoutPlan = oldWorkoutPlan.filter((_, i) => i !== index);
        setWorkoutPlan(updatedWorkoutPlan);
    }

    function WorkoutPlan({ name, details, onDelete }) {
        return (
            <div>
                <h3>{name}</h3>
                <p>{details}</p>
                <button onClick={onDelete}>Delete</button>
            </div>
        );
    }

    const handleNewWorkout = () => {
        const workout = prompt("New Workout:");
        const isMatch = oldWorkoutPlan.some(
            plan => plan.workout.toLowerCase() == workout.toLowerCase() 
        );
        if (workout && isMatch) {
            const time = new Date().toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"});
            setWorkout([...oldWorkout, {workout, time}]);
        }
    }

    const handleDeleteWorkout = (index) => {
        const updatedWorkout = oldWorkout.filter((_, i) => i !== index);
        setWorkoutPlan(updatedWorkout);
    }

    function Workout({ name, time, onDelete }) {
        return (
            <div>
                <h3>{name}</h3>
                <p>{time}</p>
                <button onClick={onDelete}>Delete</button>
            </div>
        );
    }
    
    return (
        <div>
            <div>
                <h2>My Workouts</h2>
                <button onClick={handleNewWorkoutPlan}>+ Create New Workout</button>
                <ul className="horizontalListOfBoxes">
                    {oldWorkoutPlan.map((entry, index) => 
                        (<li className="listItemInBox" key={index}><WorkoutPlan name={entry.workout} details={entry.workoutDetails} onDelete={() => handleDeleteWorkoutPlan(index)}/></li>))}
                </ul>
            </div>

            <div>
                <h2>Past Workouts</h2>
                <button onClick={handleNewWorkout}>+ Log Your Workout</button>
                <ul className="verticalListOfBoxes">
                    {oldWorkout.map((entry, index) => 
                        (<li className="listItemInBox" key={index}><Workout name={entry.workout} time={entry.time} onDelete={() => handleDeleteWorkout(index)}/></li>))}
                </ul>
            </div>
        </div>
    )
}

export default TrainingPage;