import { useState, useEffect } from "react";
import { collection, getDocs, setDoc, doc, updateDoc, increment} from "firebase/firestore";
import { db } from "../firebase_config"
import { useUser } from '../UserContext';
import { useLocation, useNavigate } from 'react-router-dom';

const WorkoutStartPage = () => {
    const { exp, userId } = useUser();
    
    const location = useLocation();
    const navigate = useNavigate();
    const { workoutName, exercises } = location.state || {};

    const [oldWeight, setWeight] = useState([]);

    const [workoutForLogging, setWorkoutForLogging] = useState([]);
    const [completed, setCompleted] = useState(false); // when reached last exercise
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [setNumber, setSetnumber] = useState(1); // which set number are you on?
    const [timer, setTimer] = useState(0);
    const [resting, setResting] = useState(false);

    //check if timer is running
    useEffect (() => {
        const endTime = localStorage.getItem('restTimerEndTime');
        const setNum = localStorage.getItem("setNumber");
        if (setNum) {
            console.log(setNum);
            setSetnumber(parseInt(setNum));
        }
        if (endTime) {
            const timeRemaining = Math.max(0, Math.round((parseInt(endTime) - Date.now()) / 1000));
            if (timeRemaining > 0) {
                setTimer(timeRemaining);
                setResting(true);
            } else {
                localStorage.removeItem('restTimerEndTime');
                setTimer(0);
                setResting(false);
            }
        }

    }, []);

    useEffect(() => {
        if (exercises.length > 0) {
            setWorkoutForLogging(exercises.map(ex => ({
                ...JSON.parse(JSON.stringify(ex)),
                expectedWeight: ex.weight,
                expectedSets: ex.sets,
                expectedReps: ex.reps,
                sets: 0,
            })));
            fetchWeights(userId);
        } else {
            setWorkoutForLogging([]);
        }
    }, [exercises])

    useEffect(() => {
        if (resting && timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (resting && timer <= 0) {
            setResting(false);
            localStorage.removeItem('restTimerEndTime');
        }
    }, [resting, timer])
    
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

    const handleSetComplete = () => {
        if (setNumber < currentExercise.expectedSets) {
            const updated = [...workoutForLogging];
            updated[exerciseIndex].sets = setNumber;
            setWorkoutForLogging(updated);
            setSetnumber(setNumber + 1);
            localStorage.setItem('setNumber', (setNumber + 1).toString());
            startRest(currentExercise.restMinutes, currentExercise.restSeconds);
        } else if (setNumber === currentExercise.expectedSets && exerciseIndex < exercises.length - 1) {
            const updated = [...workoutForLogging];
            updated[exerciseIndex].sets = setNumber;
            setWorkoutForLogging(updated);
            setExerciseIndex(exerciseIndex + 1);
            setSetnumber(1);
        } else {
            const updated = [...workoutForLogging];
            updated[exerciseIndex].sets = setNumber;
            setWorkoutForLogging(updated);
            setCompleted(true);
        }
    }

    const startRest = (min, sec) => {
        const totalSeconds = (min || 0) * 60 + (sec || 0);
        const endTime = Date.now() + totalSeconds * 1000;
        localStorage.setItem('restTimerEndTime', endTime.toString());
        setTimer(totalSeconds);
        setResting(true);
    }
    
    const handleSkipExercise = () => {
        if (exerciseIndex < workoutForLogging.length - 1) {
            setExerciseIndex(exerciseIndex + 1);
            setSetnumber(1);
            setResting(false);
        } else {
            setCompleted(true);
        }
    }
    
    const handleFinish = async (e) => {
        e.preventDefault();
        localStorage.removeItem('restTimerEndTime');
        localStorage.removeItem('setNumber');
        setResting(false);
        setTimer(0);
        
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
                workout: workoutName, 
                exercises: workoutForLogging,
                time: time,
                exp: expInc
        };

        const activityEntry = {
            note: `Workout '${workoutName}' logged`,
            time
        }
            
        console.log("submitting entry:", entry);

        try {
            const docId = Date.now().toString();
            const userWorkoutDocRef = doc(db, "Users", userId, "User_Workout", docId);
            const docRef = await setDoc(userWorkoutDocRef, entry);
            console.log("Successfully added to Firestore:", docId);

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

        navigate("/trainingPage");
    }

    if (!exercises || exercises.length === 0) {
        return (
            <div>
                <p>No workout selected</p>
                <button onClick={() => navigate("/trainingPage")}>Return</button>
            </div>
        );
    }

    const currentExercise = workoutForLogging?.[exerciseIndex] || "";

    return ( 
        <div>
            <h2>Workout Selected: {workoutName}</h2>

            {completed ? (
                <div>
                    <h2>Workout Complete!</h2>
                    <button className="button" onClick={handleFinish}>Finalise workout details</button>
                </div>
            ) : (
                <div>
                    <h3>Exercise in Progress: {currentExercise.exercise}</h3>
                    <p>{currentExercise.expectedReps} reps of {currentExercise.expectedWeight} KG</p>
                    <p>Set {setNumber} of {currentExercise.expectedSets}</p>

                    {resting ? (
                        <div id="restingState">
                            <p>Rest time left: {Math.floor(timer / 60)} : {String(timer % 60).padStart(2, "0")}</p>
                            <button onClick={() => setResting(false)}>End timer</button>
                        </div>
                    ) : (
                        <button className="button" onClick={handleSetComplete}>Set Completed</button>
                    )}
                    <button className="button" onClick={handleSkipExercise} disabled={exerciseIndex >= workoutForLogging.length - 1}>Skip to next exercise</button>
                    <button className="button" onClick={handleFinish}>Finish Workout Early</button>
                </div>
            )}

        </div>
    )
}

export default WorkoutStartPage;