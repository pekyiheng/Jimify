import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";

const TrainingPage = () => {
    const [oldWorkoutPlan, setWorkoutPlan] = useState([]);
    const [oldWorkout, setWorkout] = useState([]);
    const [userId, setUserId] = useState(null);

    const [workoutName, setWorkoutName] = useState("");
    const [newExercise, setNewExercise] = useState("");
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [exerciseOptions, setExerciseOptions] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    fetchWorkoutPlan(user.uid);
                    fetchWorkout(user.uid);
                    fetchExercises();
                }
            });
            return () => unsubscribe();
    }, [])
    
    const fetchWorkoutPlan = async (uid) => {
        const userWorkoutPlanColRef = collection(db, "Users", uid, "User_Workout_Plan");
            
        try {
            const docSnap = await getDocs(userWorkoutPlanColRef);
            const data = docSnap.docs.map((docSnap) => {
                const docData = docSnap.data();
                return {
                    id: docSnap.id,
                    workoutName: docData.workoutName,
                    exercises: docData.exercises,
                    time: docData.time.toDate(),
                };
            });
    
            setWorkoutPlan(data);
        }

        catch (e) {
            console.error(e);
            return null;
        }
    }

    const fetchWorkout = async (uid) => {
        const userWorkoutColRef = collection(db, "Users", uid, "User_Workout");
            
        try {
            const docSnap = await getDocs(userWorkoutColRef);
            const data = docSnap.docs.map((docSnap) => {
                const docData = docSnap.data();
                return {
                    id: docSnap.id,
                    workout: docData.workout,
                    time: docData.time.toDate(),
                };
            });
    
            setWorkout(data);
        }

        catch (e) {
            console.error(e);
            return null;
        }
    }

    const fetchExercises = async () => {
        const ColRef = collection(db, "Exercises");
            
        try {
            const docSnap = await getDocs(ColRef);
            const data = docSnap.docs.map((docSnap) => {
                const docData = docSnap.data();
                return {
                    id: docSnap.id,
                    exercise: docData.exercise,
                };
            });
    
            setExerciseOptions(data);
            if (data.length > 0) {
                setNewExercise(data[0].exercise);
            }
        }

        catch (e) {
            console.error(e);
            return null;
        }
    }
    
    const handleNewWorkoutPlan = async (e) => {
        e.preventDefault();
        const time = new Date();
        const entry = {
            workoutName: workoutName,
            exercises: selectedExercises,
            time,
        };
            
        console.log("submitting entry:", entry);

        try {
            const docId = Date.now().toString();
            const userWorkoutPlanDocRef = doc(db, "Users", userId, "User_Workout_Plan", docId);
            const docRef = await setDoc(userWorkoutPlanDocRef, entry);
            console.log("Successfully added to Firestore:", docId);
            setWorkoutPlan([...oldWorkoutPlan, { ...entry, id: docId }]);
            setWorkoutName("");
            setSelectedExercises([]);
            setShowForm(false);
        } catch (err) {
            console.error("Error adding workout plan:", err);
        }
    }

    const handleDeleteWorkoutPlan = async (id) => {
        try {
            await deleteDoc(doc(db, "Users", userId, "User_Workout_Plan", id));
            const updatedWorkoutPlan = oldWorkoutPlan.filter((entry) => entry.id !== id);
            setWorkoutPlan(updatedWorkoutPlan);
        } catch (err) {
            console.error("Error deleting workout plan:", err);
        }
    }

    const handleNewExercise = () => {
        if (!selectedExercises.some(ex => ex.exercise == newExercise)) { // no duplicate exercises in array
            setSelectedExercises([...selectedExercises, {exercise: newExercise, sets: 3, reps: 10}]);
            setNewExercise(exerciseOptions.length > 0 ? exerciseOptions[0] : "");
        } else {
            console.error("Error adding exercise");
        }
    }

    function WorkoutPlan({ name, exercise, onDelete }) {
        return (
            <div>
                <h3>{name}</h3>
                {exercise}
                <button onClick={onDelete}>Delete</button>
            </div>
        );
    }

    const handleNewWorkout = async () => {
        const workout = prompt("New Workout:");
        const isMatch = oldWorkoutPlan.some(
            plan => plan.workout.toLowerCase() == workout.toLowerCase() 
        );
        if (workout && isMatch) {
            const time = new Date();
            const entry = {
                workout, time,
            };
            
            console.log("submitting entry:", entry);

            try {
                const docId = Date.now().toString();
                const userWorkoutDocRef = doc(db, "Users", userId, "User_Workout", docId);
                const docRef = await setDoc(userWorkoutDocRef, entry);
                console.log("Successfully added to Firestore:", docId);
                setWorkout([...oldWorkout, { ...entry, id: docId }]);
            } catch (err) {
                console.error("Error adding workout:", err);
            }
        }
    }

    const handleDeleteWorkout = async (id) => {
        try {
            await deleteDoc(doc(db, "Users", userId, "User_Workout", id));
            const updatedWorkout = oldWorkout.filter((entry) => entry.id !== id);
            setWorkout(updatedWorkout);
        } catch (err) {
            console.error("Error deleting workout:", err);
        }
    }

    function Workout({ name, time, onDelete }) {
        return (
            <div>
                <h3>{name}</h3>
                <p>{time.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}</p>
                <button onClick={onDelete}>Delete</button>
            </div>
        );
    }
    
    return (
        <div>
            <div>
                <h2>My Workouts</h2>
                <div className="buttonContainer">
                    <button onClick={() => setShowForm(true)} className="button">+ Create New Workout Plan</button>
                </div>

                {showForm && (
                    <div>
                        <h3>Create New Workout Plan</h3>
                        <form onSubmit={handleNewWorkoutPlan}>
                            <label>Workout Name: </label>
                            <input type="text" value={workoutName} 
                            onChange={(e) => setWorkoutName(e.target.value)} required />

                            <div> 
                                <label>Add Exercises: </label>
                                <select value={newExercise} onChange={(e) => setNewExercise(e.target.value)}>
                                {exerciseOptions.map((ex) => (
                                    <option key={ex.id} value={ex.exercise}>{ex.exercise}</option>
                                ))}
                                </select>
                                <button type="button" onClick={handleNewExercise} className="button">Add Exercise</button>
                            </div>

                            <ul>
                                {selectedExercises.map((ex, index) => (
                                    <li key={index}>
                                        <h3>{ex.exercise}</h3>
                                        Sets:
                                        <input type="number" value={ex.sets} onChange={(e) => {
                                            const updatedExercises = [...selectedExercises];
                                            updatedExercises[index].sets = parseInt(e.target.value);
                                            setSelectedExercises(updatedExercises);
                                        }}/>

                                        Reps:
                                        <input type="number" value={ex.reps} onChange={(e) => {
                                            const updatedExercises = [...selectedExercises];
                                            updatedExercises[index].reps = parseInt(e.target.value);
                                            setSelectedExercises(updatedExercises);
                                        }}/>

                                        <button onClick={() => setSelectedExercises(selectedExercises.filter((_, i) => i !== index))}>Remove Exercise</button>
                                    </li>
                                ))}
                            </ul>
                            <button type="submit" className="button">Confirm Workout Plan</button>
                            <button onClick={() => setShowForm(false)} className="button">Cancel</button>
                        </form>
                    </div>
                )}
                

                <ul className="horizontalListOfBoxes">
                    {oldWorkoutPlan.map((entry, index) => 
                        (<li className="listItemInBox" key={entry.id}>
                            <WorkoutPlan 
                                name={entry.workoutName} 
                                exercise={
                                    <ul>
                                        {entry.exercises.map((e, index) => (
                                            <li key={index}>{e.exercise} - {e.sets} sets x {e.reps} reps</li>
                                        ))}
                                    </ul>
                                }
                                onDelete={() => handleDeleteWorkoutPlan(entry.id)}/></li>))}
                </ul>
            </div>

            <div>
                <h2>Past Workouts</h2>
                <div className="buttonContainer">
                    <button onClick={handleNewWorkout} className="button">+ Log Your Workout</button>
                </div>
                <ul className="verticalListOfBoxes">
                    {oldWorkout.map((entry, index) => 
                        (<li className="listItemInBox" key={entry.id}><Workout name={entry.workout} time={entry.time} onDelete={() => handleDeleteWorkout(entry.id)}/></li>))}
                </ul>
            </div>
        </div>
    )
}

export default TrainingPage;