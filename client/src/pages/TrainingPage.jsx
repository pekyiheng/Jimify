import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, updateDoc, increment, query, where } from "firebase/firestore";
import { db } from "../firebase_config"
import { useUser } from '../UserContext';
import { IoMdReturnLeft } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const TrainingPage = () => {
    const [oldWorkoutPlan, setWorkoutPlan] = useState([]);
    const [oldWorkout, setWorkout] = useState([]);

    const [workoutPlanName, setWorkoutPlanName] = useState("");
    const [newExercise, setNewExercise] = useState("");
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [exerciseOptions, setExerciseOptions] = useState([]);
    const [showWorkoutPlanForm, setShowWorkoutPlanForm] = useState(false);
    const [showWorkoutForm, setShowWorkoutForm] = useState(false);
    const [workoutPlanForLogging, setWorkoutPlanForLogging] = useState("");
    const [workoutForLogging, setWorkoutForLogging] = useState([]);
    const [showAllWorkouts, setShowAllWorkouts] = useState(false);

    const pastSevenDaysWorkouts = () => {
        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return oldWorkout.filter(workout => workout.time >= oneWeekAgo);
    }
    
    const nameOfBodyParts = ["Chest", "Shoulders", "Core", "Back", "Triceps", "Biceps", "Quadriceps", "Hamstrings", "Calves"];
    const numberOfBodyParts = nameOfBodyParts.length;
    const [numberOfTimesHit, setNumberOfTimesHit] = useState(Array(numberOfBodyParts).fill(0));

    const [oldWeight, setWeight] = useState([]); // fetch user weight for exp calc

    const { exp, userId } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkoutPlan(userId);
        fetchWorkout(userId);
        fetchExercises();
        fetchWeights(userId);
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

    useEffect(() => {
        const counts = Array(numberOfBodyParts).fill(0);
        const recentWorkouts = pastSevenDaysWorkouts();
        recentWorkouts.forEach(workout => {
            workout.exercises.forEach(ex => {
                const i = nameOfBodyParts.indexOf(ex.bodyPart);
                if (i !== -1) {
                    counts[i]++;
                }
            });
        });
        setNumberOfTimesHit(counts);
    }, [oldWorkout]);
    
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
                    bodyPart: docData.bodyPart,
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

        const duplicateName = oldWorkoutPlan.some(plan => plan.workoutName.toLowerCase().trim() === workoutPlanName.toLowerCase().trim());
        if (duplicateName) {
            alert("Please choose different workout name");
            return;
        }
        
        const hasNaN = selectedExercises.some(ex => isNaN(ex.weight) || isNaN(ex.sets) || isNaN(ex.reps) || isNaN(ex.restMinutes) || isNaN(ex.restSeconds));
        if (hasNaN) {
            alert("All inputs must be numbers");
            return;
        }

        const hasInvalidExercise = selectedExercises.some(ex => ex.weight <= 0 || ex.sets <= 0 || ex.reps <= 0);
        if (hasInvalidExercise) {
            alert("All exercises must have weight, sets, and reps > 0");
            return;
        }

        const hasInvalidRestTime = selectedExercises.some(ex => ex.restMinutes < 0 || ex.restSeconds < 0 || ex.restSeconds > 59);
        if (hasInvalidRestTime) {
            alert("All exercises must have valid rest time");
            return;
        }

        const time = new Date();
        const entry = {
            workoutName: workoutPlanName,
            exercises: selectedExercises,
            time,
        };

        const activityEntry = {
            note: `Workout plan '${workoutPlanName}' created`,
            time
        }

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

            const userActivityDocRef = doc(db, "Users", userId, "Activity_Log", docId);
            await setDoc(userActivityDocRef, activityEntry);
        } catch (err) {
            console.error("Error adding workout plan:", err);
        }
    }

    const handleStartWorkout = (id) => {
        const selectedPlan = oldWorkoutPlan.find(plan => plan.id === id);
        if (!selectedPlan) {
            alert("Workout plan not found");
            return;
        }

        navigate("/workoutStartPage", {
            state: {
                workoutName: selectedPlan.workoutName,
                exercises: selectedPlan.exercises,
            }
        })
    }

    const handleDeleteWorkoutPlan = async (id) => {
        const time = new Date();
        const workoutPlan = oldWorkoutPlan.find((entry) => entry.id === id);
        const workoutPlanName = workoutPlan.workoutName;
        const activityEntry = {
            note: `Workout plan '${workoutPlanName}' deleted`,
            time
        } 

        try {
            await deleteDoc(doc(db, "Users", userId, "User_Workout_Plan", id));
            const updatedWorkoutPlan = oldWorkoutPlan.filter((entry) => entry.id !== id);
            setWorkoutPlan(updatedWorkoutPlan);

            const docId = Date.now().toString();
            const userActivityDocRef = doc(db, "Users", userId, "Activity_Log", docId);
            await setDoc(userActivityDocRef, activityEntry);
        } catch (err) {
            console.error("Error deleting workout plan:", err);
        }
    }

    const handleNewExercise = () => {
        const selected = exerciseOptions.find(ex => ex.exercise == newExercise);
        if (!selectedExercises.some(ex => ex.exercise == selected.exercise)) { // no duplicate exercises in array
            setSelectedExercises([...selectedExercises, {exercise: selected.exercise, bodyPart: selected.bodyPart, weight: 60, sets: 3, reps: 10, restMinutes: 3, restSeconds: 0}]);
            setNewExercise(exerciseOptions.length > 0 ? exerciseOptions[0].exercise : "");
        } else {
            console.error("Error adding exercise");
        }
    }

    function WorkoutPlan({ name, exercise, startWorkout, onDelete }) {
        return (
            <div id="myWorkoutCtn">
                <h3>{name}</h3>
                {exercise}
                <button onClick={startWorkout} className="button">Start Workout</button>
                <button onClick={onDelete} className="button">Delete</button>
            </div>
        );
    }

    const handleNewWorkout = async (e) => {
        e.preventDefault();
        const time = new Date();
        const userWeight = oldWeight[oldWeight.length-1]?.value ?? 100; // use 100kg to calculate exp if weight not logged
        const expInc = workoutForLogging.map(ex => {
            if (ex.weight >= ex.expectedWeight && ex.sets >= ex.expectedSets && ex.reps >= ex.expectedReps) {
                return Number(Math.round(ex.weight / userWeight * ex.sets * ex.reps * 1.1))
            } else {
                return Number(Math.round(ex.weight / userWeight * ex.sets * ex.reps))
            }
        }).reduce((a, b) => a + b, 0);
        const entry = {
                workout: workoutPlanForLogging, 
                exercises: workoutForLogging,
                time: time,
                exp: expInc
        };

        const activityEntry = {
            note: `Workout '${workoutPlanForLogging}' logged`,
            time
        } 
            
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

            const userActivityDocRef = doc(db, "Users", userId, "Activity_Log", docId);
            await setDoc(userActivityDocRef, activityEntry);
        } catch (err) {
            console.error("Error adding workout:", err);
        }

        try {
            await updateDoc(doc(db, "Users", userId), { 
                exp: increment(expInc)
            });
            console.log("User EXP updated");
        } catch (err) {
            console.error("Error updating EXP:", err);
        }
    }

    const handleDeleteWorkout = async (id) => {
        
        const workout = oldWorkout.find((entry) => entry.id == id);
        const exp = workout.exp;

        const time = new Date();
        const workoutName = workout.workout;
        const activityEntry = {
            note: `Workout '${workoutName}' deleted`,
            time
        } 

        try {
            await deleteDoc(doc(db, "Users", userId, "User_Workout", id));
            const updatedWorkout = oldWorkout.filter((entry) => entry.id !== id);
            setWorkout(updatedWorkout);
            
            const docId = Date.now().toString();
            const userActivityDocRef = doc(db, "Users", userId, "Activity_Log", docId);
            await setDoc(userActivityDocRef, activityEntry);
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
        const [showDetails, setShowDetails] = useState(false); 
        return (
            <div>
                <h3 className="no_margin">{name}</h3>
                <p className="no_margin">Date of Workout: {time.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}</p>
                {
                    showDetails && (
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
                    )
                }
                <button onClick={() => setShowDetails(!showDetails)}>Details</button>
                <button onClick={onDelete} className="button">Delete</button>
            </div>
        );
    }

    function BodyPart({ name, count }) {
        return (
            <div>
                <p>{name}: {count}</p>
            </div>
        )
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
                                                <br />
                                                <label>Rest time between sets: </label> 
                                                <input type="number" value={ex.restMinutes} onChange={(e) => {
                                                    const updatedExercises = [...selectedExercises];
                                                    updatedExercises[index].restMinutes = parseInt(e.target.value);
                                                    setSelectedExercises(updatedExercises);
                                                }}/>
                                                min
                                                <input type="number" value={ex.restSeconds} onChange={(e) => {
                                                    const updatedExercises = [...selectedExercises];
                                                    updatedExercises[index].restSeconds = parseInt(e.target.value);
                                                    setSelectedExercises(updatedExercises);
                                                }}/>
                                                s
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
                                            <li key={index}>{e.exercise} ({e.weight}KG) - {e.sets} sets x {e.reps} reps
                                            <br/>
                                            Rest between sets: {e.restMinutes} min {String(e.restSeconds).padStart(2, "0")} s</li>
                                        ))}
                                    </ul>
                                }
                                startWorkout={() => handleStartWorkout(entry.id)}
                                onDelete={() => handleDeleteWorkoutPlan(entry.id)}/></li>))}
                </ul>
            </div>

            <div>
                <div>
                    <h2>Body parts hit in past week</h2>
                    <ul className="listWithNoPointers">
                        {nameOfBodyParts.map((entry, index) => 
                        (<li key={entry}><BodyPart name={entry} count={numberOfTimesHit[index]}/></li>))}
                    </ul>
                </div>
                <h2 className="no_margin">{showAllWorkouts ? "All past workouts" : "Workouts in past week"}</h2>
                <p className="no_margin">Tip: Hitting your workout expectations grants extra EXP!</p>
                <div className="buttonContainer">
                    <button onClick={() => setShowWorkoutForm(true)} className="button">+ Log Your Workout</button>
                    <button onClick={() => setShowAllWorkouts(!showAllWorkouts)} className="button">{showAllWorkouts ? "Show only past 7 days" : "Show all past workouts"}</button>
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
                    {(showAllWorkouts 
                        ? oldWorkout
                        : pastSevenDaysWorkouts())
                        .sort((a, b) => b.time - a.time)
                        .map((entry, index) => 
                        (<li id="training_log_ctn" className="listItemInBox" key={entry.id}>
                            <Workout name={entry.workout} exercises={entry.exercises} time={entry.time} onDelete={() => handleDeleteWorkout(entry.id)}/>
                        </li>))}
                </ul>
            </div>
        </div>
    )
}

export default TrainingPage;