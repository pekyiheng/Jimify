import { useState, useEffect, useRef } from 'react';
import { db } from "../firebase_config"
import { getDoc, setDoc, doc, } from "firebase/firestore";
import { useUser } from "../UserContext";
import { calculateBMR, getGoal, getActivityLevel } from '../helper';

const OnboardUser = () => {

    const { userId } = useUser();
    const [showDialog, setShowDialog] = useState(false);
    const dialogRef = useRef(null);
    const [username, setUsername] = useState('');
    const [dailyCalories, setDailyCalories] = useState(0);
    const [weight, setWeight] = useState(0);
    const [height, setHeight] = useState(0);
    const [birthdate, setBirthdate] = useState(0);
    const [gender, setGender] = useState('M');
    const [activityLevel, setActivityLevel] = useState('sedentary');
    const [goal, setGoal] = useState('maintain');

    useEffect(() => {
        //fetchUserProfile(userId);
    }, []);

    const fetchUserProfile = async (uid) => {
        const userProfileDocRef = doc(db, "Users", uid);
        try {
            const docSnap = await getDoc(userProfileDocRef);
            if (docSnap.exists() && docSnap.data().Username) {
                setUsername(docSnap.data().Username);
                docSnap.data().Gender && setGender(docSnap.data().Gender);
                docSnap.data().Birthdate && setBirthdate(docSnap.data().Birthdate);
                docSnap.data().Height && setHeight(docSnap.data().Height);
                docSnap.data().Weight && setWeight(docSnap.data().Weight);
                docSnap.data().Goal && setGoal(docSnap.data().Goal);
                docSnap.data().Activity_Level && setActivityLevel(docSnap.data().Activity_Level);
                docSnap.data().Daily_Calories && setDailyCalories(docSnap.data().Daily_Calories);
            } else {
                setShowDialog(true);
            }
            
        } catch (e) {
            console.error("Error fetching food list:", e);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
        console.log(age);
        const dailyGoal = Math.round(calculateBMR(gender, weight, height, age, getActivityLevel(activityLevel)) + getGoal(goal));
        setDailyCalories(dailyGoal);
        const userProfileDocRef = doc(db, "Users", userId);
        setDoc(userProfileDocRef, {
            Username: username,
            Daily_Calories: dailyGoal,
            Weight: weight,
            Height: height,
            Birthdate: birthdate,
            Gender: gender,
            Activity_Level: activityLevel,
            Goal: goal,
        }, {merge: true});

    }

    return (
        <>
             <header className='registerHeader'>
                <h2>Welcome to Jimify! Let's set up yout profile </h2>
            </header>
            <div>
                
            </div>
        </>
    )

    /*
    return (
        <>
            <button onClick={toggleDialog}>Edit profile</button>
            <dialog ref={dialogRef}>
                <header className='registerHeader'>
                    <h2>Welcome to Jimify! Let's set up yout profile </h2>
                </header>
                <div>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor='usernameField' >Username</label>
                        <input required id='usernameField' type='text' value={username} onChange={e => setUsername(e.target.value)}></input>
                        <br></br>
                        <label htmlFor='genderField' >What is your gender?</label>
                        <select required id='genderField' value={gender} onChange={e => setGender(e.target.value)} >
                            <option value='M' >Male</option>
                            <option value='F' >Female</option>
                        </select>
                        <br></br>
                        <label htmlFor='birthdateField' >What is your birthdate?</label>
                        <input required id='birthdateField' type='date' value={birthdate} onChange={e => setBirthdate(e.target.value)} ></input>
                        <br></br>
                        <label htmlFor='heightField' >What is your height?</label>
                        <input required id='heightField' type='number' value={height} onChange={e => setHeight(e.target.value)} ></input>
                        <br></br>
                        <label htmlFor='initialWeightField' >What is your current weight?</label>
                        <input required id='initialWeightField' type='number' value={weight} onChange={e => setWeight(e.target.value)} ></input>
                        <br></br>
                        <label htmlFor='goalField' >What is your goal?</label>
                        <select required id="goalField" name="goalField" value={goal} onChange={(e) => setGoal(e.target.value)}>
                            <option value="gain fast">Gain weight (fast)</option>
                            <option value="gain slow">Gain weight (slow)</option>
                            <option value="maintain">Maintain weight</option>
                            <option value="lose slow">Lose weight (slow)</option>
                            <option value="lose fast">Lose weight (fast 0.5kg/week)</option>
                        </select>
                        <br></br>
                        <label htmlFor='activityField' >How active are you??</label>
                        <select required id="activityField" name="activityField" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} >
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Lightly active</option>
                            <option value="moderate">Moderately active</option>
                            <option value="active">Active</option>
                            <option value="very active">Very active</option>
                        </select>

                        <input type='submit'></input>
                    </form>
                    <p>Daily calories goal: {dailyCalories}</p>
                </div>
                <button onClick={toggleDialog}>Close</button>
            </dialog>
        </>
    )
    */
}

export default OnboardUser;