import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, updateDoc, increment, query, where } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";

const TrainingPage = () => {
    const [oldWorkoutPlan, setWorkoutPlan] = useState([]);
    const [oldWorkout, setWorkout] = useState([]);
    const [userId, setUserId] = useState(null);

    const [workoutPlanName, setWorkoutPlanName] = useState("");
    const [newExercise, setNewExercise] = useState("");
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [exerciseOptions, setExerciseOptions] = useState([]);
    const [showWorkoutPlanForm, setShowWorkoutPlanForm] = useState(false);
    const [showWorkoutForm, setShowWorkoutForm] = useState(false);
    const [workoutPlanForLogging, setWorkoutPlanForLogging] = useState("");
    const [workoutForLogging, setWorkoutForLogging] = useState([]);

    const [oldWeight, setWeight] = useState([]); // fetch user weight for exp calc


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchWorkoutPlan(user.uid);
                fetchWorkout(user.uid);
                fetchExercises();
                fetchWeights(user.uid);
            }
        });
        return () => unsubscribe();
    }, [])

    useEffect(() => {
        if (oldWorkoutPlan.length >= 1) {
            const plan = oldWorkoutPlan[0];
            setWorkoutPlanForLogging(plan.workoutName);
            setWorkoutForLogging(plan.exercises.map(ex => ({
                ...JSON.parse(JSON.stringify(ex)),
                expectedWeight: ex.weight,
                expectedSets: ex.sets,
                expectedReps: ex.reps,
            })));
        } else {
            setWorkoutPlanForLogging("");
            setWorkoutForLogging([]);
        }
    }, [showWorkoutForm, oldWorkoutPlan])
    
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
                    exercises: docData.exercises,
                    time: docData.time.toDate(),
                    exp: docData.exp,
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

    const fetchWeights = async (uid) => {
        const userWeightColRef = collection(db, "Users", uid, "User_Weight");
        
        try {
            const docSnap = await getDocs(userWeightColRef);
            const data = docSnap.docs.map((docSnap) => {
                const docData = docSnap.data();
                return {
                    id: docSnap.id,
                    value: docData.value,
                    time: docData.time.toDate(),
                };
        });

        setWeight(data);

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
            workoutName: workoutPlanName,
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
            setWorkoutPlanName("");
            setSelectedExercises([]);
            setShowWorkoutPlanForm(false);
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
            setSelectedExercises([...selectedExercises, {exercise: newExercise, weight: 60, sets: 3, reps: 10}]);
            setNewExercise(exerciseOptions.length > 0 ? exerciseOptions[0].exercise : "");
        } else {
            console.error("Error adding exercise");
        }
    }

    function WorkoutPlan({ name, exercise, onDelete }) {
        return (
            <div>
                <h3>{name}</h3>
                {exercise}
                <button onClick={onDelete} className="button">Delete</button>
            </div>
        );
    }

    const handleNewWorkout = async (e) => {
        e.preventDefault();
        const time = new Date();
        const userWeight = oldWeight[oldWeight.length-1]?.value ?? 100; // use 100kg to calculate exp if weight not logged
        const exp = workoutForLogging.map(ex => Number(Math.round(ex.weight / userWeight * ex.sets * ex.reps))).reduce((a, b) => a + b, 0);
        const entry = {
                workout: workoutPlanForLogging, 
                exercises: workoutForLogging,
                time: time,
                exp: exp
        };
            
            console.log("submitting entry:", entry);

            try {
                const docId = Date.now().toString();
                const userWorkoutDocRef = doc(db, "Users", userId, "User_Workout", docId);
                const docRef = await setDoc(userWorkoutDocRef, entry);
                console.log("Successfully added to Firestore:", docId);
                setWorkout([...oldWorkout, { ...entry, id: docId }]);
                setWorkoutForLogging([]);
                setWorkoutPlanForLogging("");
                setShowWorkoutForm(false);
            } catch (err) {
                console.error("Error adding workout:", err);
            }

            try {
                await updateDoc(doc(db, "Users", userId), { 
                    exp: increment(exp)
                });
                console.log("User EXP updated");
            } catch (err) {
                console.error("Error updating EXP:", err);
            }
    }


    const handleDeleteWorkout = async (id) => {
        
        const exp = oldWorkout.find((entry) => entry.id == id).exp;

        try {
            await deleteDoc(doc(db, "Users", userId, "User_Workout", id));
            const updatedWorkout = oldWorkout.filter((entry) => entry.id !== id);
            setWorkout(updatedWorkout);
        } catch (err) {
            console.error("Error deleting workout:", err);
        }

        try {
            await updateDoc(doc(db, "Users", userId), { 
                exp: increment(-exp)
            });
        } catch (err) {
            console.error("Error updating EXP:", err);
        }
    }

    function Workout({ name, exercises = [], time, onDelete }) {
        return (
            <div>
                <h3>{name}</h3>
                <p>Date of Workout: {time.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}</p>
                <ul className="listWithNoPointers">
                    {exercises.map((ex, index) => (
                        <li key={index} className="exerciseListItem">
                            <h4>{ex.exercise}</h4>
                            <p>Expected Weight: {ex.expectedWeight} | Actual: {ex.weight}</p>
                            <p>Expected Sets: {ex.expectedSets} | Actual: {ex.sets}</p>
                            <p>Expected Reps: {ex.expectedReps} | Actual: {ex.reps}</p>
                        </li>
                    ))}
                </ul>
                <button onClick={onDelete} className="button">Delete</button>
            </div>
        );
    }
 
    return (
        <div>
            <div>
                <h2>My Workouts</h2>
                <div className="buttonContainer">
                    <button onClick={() => setShowWorkoutPlanForm(true)} className="button">+ Create New Workout Plan</button>
                </div>

                {showWorkoutPlanForm && (
                    <div className="workoutPlanFormContent">
                        <h3>Create New Workout Plan</h3>
                        <form onSubmit={handleNewWorkoutPlan}>
                            <label>Workout Name: </label>
                            <input type="text" value={workoutPlanName} 
                            onChange={(e) => setWorkoutPlanName(e.target.value)} required />

                            <div> 
                                <label>Add Exercises: </label>
                                <select value={newExercise} onChange={(e) => setNewExercise(e.target.value)}>
                                {exerciseOptions.map((ex) => (
                                    <option key={ex.id} value={ex.exercise}>{ex.exercise}</option>
                                ))}
                                </select>
                                <button type="button" onClick={handleNewExercise} className="button">Add Exercise</button>
                            </div>

                            <ul className="listWithNoPointers">
                                {selectedExercises.map((ex, index) => (
                                    <li key={index}>
                                        <h3>{ex.exercise}</h3>
                                        
                                        <div className="exerciseItem">
                                            <div>
                                                <label>Weight: </label>
                                                <input type="number" value={ex.weight} onChange={(e) => {
                                                    const updatedExercises = [...selectedExercises];
                                                    updatedExercises[index].weight = parseInt(e.target.value);
                                                    setSelectedExercises(updatedExercises);
                                                }}/>
                                                KG
                                                <br/>
                                                <label>Sets: </label> 
                                                <input type="number" value={ex.sets} onChange={(e) => {
                                                    const updatedExercises = [...selectedExercises];
                                                    updatedExercises[index].sets = parseInt(e.target.value);
                                                    setSelectedExercises(updatedExercises);
                                                }}/>
                                                <br/>
                                                <label>Reps: </label> 
                                                <input type="number" value={ex.reps} onChange={(e) => {
                                                    const updatedExercises = [...selectedExercises];
                                                    updatedExercises[index].reps = parseInt(e.target.value);
                                                    setSelectedExercises(updatedExercises);
                                                }}/>
                                            </div>
                                            <button onClick={() => setSelectedExercises(selectedExercises.filter((_, i) => i !== index))} className="button">Remove Exercise</button>
                                        </div>
                                            
                                        
                                    </li>
                                ))}
                            </ul>
                            <button type="submit" className="button">Confirm Workout Plan</button>
                            <button onClick={() => setShowWorkoutPlanForm(false)} className="button">Cancel</button>
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
                                            <li key={index}>{e.exercise} ({e.weight}KG) - {e.sets} sets x {e.reps} reps</li>
                                        ))}
                                    </ul>
                                }
                                onDelete={() => handleDeleteWorkoutPlan(entry.id)}/></li>))}
                </ul>
            </div>

            <div>
                <h2>Past Workouts</h2>
                <div className="buttonContainer">
                    <button onClick={() => setShowWorkoutForm(true)} className="button">+ Log Your Workout</button>
                </div>
                
                 {showWorkoutForm && (
                    <div className="workoutPlanFormContent">
                        <h3>Log your past workout</h3>
                        <form onSubmit={handleNewWorkout}>
                            <label>Workout Name: </label>
                            <select value={workoutPlanForLogging} 
                                onChange={(e) => {
                                    const selectedName = e.target.value;
                                    setWorkoutPlanForLogging(selectedName);
                                    const selectedPlan = oldWorkoutPlan.find(plan => plan.workoutName === selectedName);
                                    if (selectedPlan) {
                                        setWorkoutForLogging(selectedPlan.exercises.map(ex => ({
                                            ...JSON.parse(JSON.stringify(ex)),
                                            expectedWeight: ex.weight,
                                            expectedSets: ex.sets,
                                            expectedReps: ex.reps
                                        })))
                                    }}
                                }
                                required
                            >
                                    {oldWorkoutPlan.map((plan) => (
                                        <option key={plan.id} value={plan.workoutName}>{plan.workoutName}</option>
                                    ))}
                            </select>

                            <ul className="listWithNoPointers">
                                <h3>{workoutPlanForLogging}</h3>
                                
                                {workoutForLogging.map((ex, index) => (
                                    <li key={index}>
                                        <div className="exerciseItem">
                                            <h3>{ex.exercise}</h3>
                                            <div>

                                                <label>Expected Weight: {ex.expectedWeight} | Reality: </label>
                                                <input type="number" onChange={(e) => {
                                                    const updated = [...workoutForLogging];
                                                    updated[index].weight = parseInt(e.target.value);
                                                    setWorkoutForLogging(updated);
                                                }}/>
                                                KG
                                                <br/>
                                                <label>Expected Sets: {ex.expectedSets} | Reality: </label> 
                                                <input type="number" onChange={(e) => {
                                                    const updated = [...workoutForLogging];
                                                    updated[index].sets = parseInt(e.target.value);
                                                    setWorkoutForLogging(updated);
                                                }}/>
                                                <br/>
                                                <label>Expected Reps: {ex.expectedReps} | Reality: </label> 
                                                <input type="number" onChange={(e) => {
                                                    const updated = [...workoutForLogging];
                                                    updated[index].reps = parseInt(e.target.value);
                                                    setWorkoutForLogging(updated);
                                                }}/>
                                            </div>
                                        </div>
                                            
                                    </li>
                                ))}
                            </ul>
                            <button type="submit" className="button">Confirm Logged Workout</button>
                            <button onClick={() => setShowWorkoutForm(false)} className="button">Cancel</button>
                        </form>
                    </div>
                )}

                <ul className="verticalListOfBoxes">
                    {oldWorkout.map((entry, index) => 
                        (<li className="listItemInBox" key={entry.id}><Workout name={entry.workout} exercises={entry.exercises} time={entry.time} onDelete={() => handleDeleteWorkout(entry.id)}/></li>))}
                </ul>
            </div>
        </div>
    )
}

export default TrainingPage;