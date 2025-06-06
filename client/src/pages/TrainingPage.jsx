import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";

const TrainingPage = () => {
    const [oldWorkoutPlan, setWorkoutPlan] = useState([]);
    const [oldWorkout, setWorkout] = useState([]);
    const [userId, setUserId] = useState(null);
    
    useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    fetchWorkoutPlan(user.uid);
                    fetchWorkout(user.uid);
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
                    workout: docData.workout,
                    workoutDetails: docData.workoutDetails,
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
    
    const handleNewWorkoutPlan = async () => {
        const workout = prompt("New Workout Plan:");
        const workoutDetails = prompt("Workout Details:");
        if (workout && workoutDetails) {
            const time = new Date();
            const entry = {
                workout, workoutDetails, time,
            };
            
            console.log("submitting entry:", entry);

            try {
                const docId = Date.now().toString();
                const userWorkoutPlanDocRef = doc(db, "Users", userId, "User_Workout_Plan", docId);
                const docRef = await setDoc(userWorkoutPlanDocRef, entry);
                console.log("Successfully added to Firestore:", docId);
                setWorkoutPlan([...oldWorkoutPlan, { ...entry, id: docId }]);
            } catch (err) {
                console.error("Error adding workout plan:", err);
            }
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

    function WorkoutPlan({ name, details, onDelete }) {
        return (
            <div>
                <h3>{name}</h3>
                <p>{details}</p>
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
                    <button onClick={handleNewWorkoutPlan} className="button">+ Create New Workout</button>
                </div>
                <ul className="horizontalListOfBoxes">
                    {oldWorkoutPlan.map((entry, index) => 
                        (<li className="listItemInBox" key={entry.id}><WorkoutPlan name={entry.workout} details={entry.workoutDetails} onDelete={() => handleDeleteWorkoutPlan(entry.id)}/></li>))}
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