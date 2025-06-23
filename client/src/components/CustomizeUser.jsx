import { useState, useEffect, useRef } from 'react';
import { db } from "../firebase_config"
import { getDoc, getDocs, collection, setDoc, doc, } from "firebase/firestore";
import { useUser } from "../UserContext";
import { calculateBMR, getGoal, getActivityLevel } from '../helper';
import { formatDateToYYYYMMDD } from '../helper';

const CustomizeUser = () => {

    const { userId } = useUser();
    const [showDialog, setShowDialog] = useState(false);
    const dialogRef = useRef(null);
    const [username, setUsername] = useState('');
    const [dailyCalories, setDailyCalories] = useState(0);
    const [weight, setWeight] = useState(0);
    const [height, setHeight] = useState(0);
    const [birthdate, setBirthdate] = useState(new Date());
    const [gender, setGender] = useState('M');
    const [activityLevel, setActivityLevel] = useState('sedentary');
    const [goal, setGoal] = useState('maintain');

    const fetchUserProfile = async (uid) => {
        const userProfileDocRef = doc(db, "Users", uid);
        try {
            const docSnap = await getDoc(userProfileDocRef);
            if (docSnap.exists() && docSnap.data().Username) {
                setUsername(docSnap.data().Username);
                docSnap.data().Gender && setGender(docSnap.data().Gender);
                docSnap.data().Birthdate && setBirthdate(formatDateToYYYYMMDD(docSnap.data().Birthdate.toDate()));
                docSnap.data().Height && setHeight(docSnap.data().Height);
                docSnap.data().Goal && setGoal(docSnap.data().Goal);
                docSnap.data().Activity_Level && setActivityLevel(docSnap.data().Activity_Level);
                docSnap.data().Daily_Calories && setDailyCalories(docSnap.data().Daily_Calories);
                fetchWeight(uid);
            }

        } catch (e) {
            console.error("Error fetching food list:", e);
        }
    }

    const fetchWeight = async (uid) => {
        const userWeightColRef = collection(db, "Users", uid, "User_Weight");
        
        try {
            const docSnap = await getDocs(userWeightColRef);
            const lastDoc = docSnap.docs[docSnap.docs.length - 1];
            const data = lastDoc.data().value;
            setWeight(data);

        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    const toggleDialog = () => {
        setShowDialog(!showDialog);
    };

    useEffect(() => {
        if (showDialog) {
            fetchUserProfile(userId);
            dialogRef.current.showModal();
            console.log(birthdate)
        } else {
            dialogRef.current.close();
        }
    }, [showDialog]);

    useEffect(() => {
        if (!birthdate) return;
        const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
        console.log(age);
        const dailyGoal = Math.round(calculateBMR(gender, weight, height, age, getActivityLevel(activityLevel)) + getGoal(goal));
        setDailyCalories(dailyGoal);
    }, [activityLevel, goal])

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const userProfileDocRef = doc(db, "Users", userId);
        setDoc(userProfileDocRef, {
            Username: username,
            Daily_Calories: dailyCalories,
            Height: height,
            Birthdate: new Date(birthdate),
            Gender: gender,
            Activity_Level: activityLevel,
            Goal: goal,
        }, {merge: true});

    }

    return (
        <>
            <button onClick={toggleDialog}>Edit profile</button>
            <dialog ref={dialogRef}>
                <header className='registerHeader'>
                    <h2>Edit profile </h2>
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
                        <h4>Current weight: {weight} kg</h4>
                        <button onClick={toggleDialog}>Close</button>
                        <input type='submit' value="Save" className='button' ></input>
                    </form>
                    <p>Daily calories goal: {dailyCalories}</p>
                </div>
                
            </dialog>
        </>
    )
}

export default CustomizeUser;