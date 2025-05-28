import { useState } from "react";
import '../App.css';

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

    function WorkoutPlan({ name, details }) {
        return (
            <div>
                <h3>{name}</h3>
                <p>{details}</p>
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

    function Workout({ name, time }) {
        return (
            <div>
                <h3>{name}</h3>
                <p>{time}</p>
            </div>
        );
    }
    
    return (
        <div>
            <div>
                <h2>My Workouts</h2>
                <button onClick={handleNewWorkoutPlan}>+ Create New Workout</button>
                <ul className="horizontalListOfBoxes">
                    {oldWorkoutPlan.map(entry => 
                        (<li className="listItemInBox"><WorkoutPlan name={entry.workout} details={entry.workoutDetails}/></li>))}
                </ul>
            </div>

            <div>
                <h2>Past Workouts</h2>
                <button onClick={handleNewWorkout}>+ Log Your Workout</button>
                <ul className="verticalListOfBoxes">
                    {oldWorkout.map(entry => 
                        (<li className="listItemInBox"><Workout name={entry.workout} time={entry.time}/></li>))}
                </ul>
            </div>
        </div>
    )
}

export default TrainingPage;