import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { db } from "../firebase_config"
import { getDocs, getDoc, setDoc, doc, query, collection, where } from "firebase/firestore";
import { useUser } from "../UserContext";
import { formatDateToYYYYMMDD, calculateBMR, getGoal, getActivityLevel } from '../helper';

const OnboardUser = ({setToOnboard}) => {

    const { userId } = useUser();
    const [step, setStep] = useState(0);
    const [invalid, setInvalid] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [username, setUsername] = useState('');
    const [dailyCalories, setDailyCalories] = useState(0);
    const [weight, setWeight] = useState(0);
    const [height, setHeight] = useState(0);
    const [birthdate, setBirthdate] = useState(formatDateToYYYYMMDD(new Date()));
    const [gender, setGender] = useState('M');
    const [activityLevel, setActivityLevel] = useState('sedentary');
    const [goal, setGoal] = useState('0');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
        console.log(age);
        const dailyGoal = Math.round(calculateBMR(gender, weight, height, age, getActivityLevel(activityLevel)) + getGoal(goal));
        setDailyCalories(dailyGoal);
        const userProfileDocRef = doc(db, "Users", userId);
        try {
            const docRef = await setDoc(userProfileDocRef, {
                Username: username,
                Daily_Calories: dailyGoal,
                Height: height,
                Birthdate: new Date(birthdate),
                Gender: gender,
                Activity_Level: activityLevel,
                Goal: goal,
            }, {merge: true});
            await addWeight();
            setStep(step + 1);
        } catch (err) {
            console.error("Error adding user profile:", err);
        }
    }

    const addWeight = () => {
        const userWeightDocRef = doc(db, "Users", userId, "User_Weight", Date.now().toString());
        setDoc(userWeightDocRef, {
            value: weight,
            time: new Date(),
        });
    }

    const preventSubmit = (e) => {
        e.preventDefault();
    }

    const backToHome = () => {
        setToOnboard(false);
    }

    const handleHeight = (e) => {
        if (Number.isNaN(e.target.value)) {
            return;
        }
        
        setHeight(parseInt(e.target.value));
    }

    const handleWeight = (e) => {
        if (Number.isNaN(e.target.value)) {
            return;
        }

        setWeight(parseInt(e.target.value))
    }

    

    const steps = [
        {
            id: 0,
            content: <div className='registerHeader'>
                        <h2>Welcome to Jimify! Let's set up yout profile </h2>
                    </div>
        },
        {
          id: 1,
          content: <form onSubmit={preventSubmit}>
                        <label htmlFor='usernameField' >Username</label>
                        <br></br>
                        <input required id='usernameField' type='text' value={username} onChange={e => setUsername(e.target.value)}></input>
                        {invalid && <p className='invalidFields'>{errorMessage}</p>}
                    </form>, 
        },
        {
          id: 2,
          content: <form onSubmit={preventSubmit} className='radio-button-container'>
                        <label htmlFor='genderField' >What is your gender?</label>
                        <br></br>
                        <select required id='genderField' value={gender} onChange={e => setGender(e.target.value)} >
                            <option value='M' >Male</option>
                            <option value='F' >Female</option>
                        </select>

                    </form>
        },
        {
          id: 3,
          content: <form onSubmit={preventSubmit}>
                        <label htmlFor='birthdateField' >What is your birthdate?</label>
                        <br></br>
                        <input required id='birthdateField' type='date' value={birthdate} onChange={e => setBirthdate(e.target.value)} ></input>
                        {invalid && <p className='invalidFields'>Please enter a valid date</p>}
                    </form>
        },
        {
          id: 4,
          content: <form onSubmit={preventSubmit}>
                        <label htmlFor='heightField' >What is your height?</label>
                        <br></br>
                        <input required id='heightField' type='number' value={height} onChange={handleHeight} ></input>
                        {invalid && <p className='invalidFields'>Please enter a valid height</p>}
                    </form>
        },
        {
            id: 5,
          content: <form onSubmit={preventSubmit}>
                        <label htmlFor='initialWeightField' >What is your current weight?</label>
                        <br></br>
                        <input required id='initialWeightField' type='number' value={weight} onChange={handleWeight} ></input>
                        {invalid && <p className='invalidFields'>Please enter a valid weight</p>}
                    </form>
        }, 
        {
            id: 6,
          content: <form onSubmit={preventSubmit}>
                        <label htmlFor='goalField' >What is your goal?</label>
                        <br></br>
                        <select required id="goalField" name="goalField" value={goal} onChange={(e) => setGoal(e.target.value)}>
                            <option value="gain fast">Gain weight (fast)</option>
                            <option value="gain slow">Gain weight (slow)</option>
                            <option value="maintain">Maintain weight</option>
                            <option value="lose slow">Lose weight (slow)</option>
                            <option value="lose fast">Lose weight (fast 0.5kg/week)</option>
                        </select>
                        
                        <br></br>
                    </form>
        },
        {
            id: 7,
          content: <form onSubmit={preventSubmit}>
                        <label htmlFor='activityField' >How active are you??</label>
                        <select required id="activityField" name="activityField" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
                        <option value="sedentary">Sedentary</option>
                            <option value="light">Lightly active</option>
                            <option value="moderate">Moderately active</option>
                            <option value="active">Active</option>
                            <option value="very active">Very active</option>
                        </select>
                    </form>
        },
        {
            id: 8,
          content: <div>
            <p>Daily calories goal: {dailyCalories}</p>
            </div>
        }, {
            id: 9,
          content: <div>
            <p>You're all set and ready to start your fitness journey..</p>
            <button onClick={backToHome}>Let's Go </button>
            </div>
        }
            
      ];

      const handleNext = async (e) => {
        if (step > steps.length) {
            return;
        }
        if (step == 1) {
            if (username == '') {
                setErrorMessage("Please enter a username");
                setInvalid(true);
                return;
            } else {
                const toUserIdQuery = query(collection(db, "Users"), where("Username", "==", username));
                const toUserIdSnapshot = await getDocs(toUserIdQuery);
                if (!toUserIdSnapshot.empty) {
                    setErrorMessage("Username already exists");
                    setInvalid(true);
                    return;
                } else {
                    console.log("No user found with that username");
                }
            }

        }

        if (step == 3 && (birthdate == ''|| birthdate == null || new Date() < new Date(birthdate))) {
            setInvalid(true);
            return
        }

        if (step == 4 && (Number.isNaN(height) || height == null || height <= 0)) {
            setInvalid(true);
            return
        }

        if (step == 5 && (Number.isNaN(weight) || weight == null || weight <= 0)) {
            setInvalid(true);
            return
        }

        setInvalid(false);
        setStep(step + 1);
      };

      const handleBack = () => {
        setInvalid(false);
        setStep(step - 1);
      }
    

    return (
        <>
            <div>
                {steps[step].content}
            </div>
            <div>
                {step > 0 && step < steps.length - 2 && (
                    <button onClick={handleBack}>Back</button>
                )}
                {step < steps.length - 1 && step != steps.length - 3 && (
                    <button onClick={handleNext}>Next</button>
                )}
                {step == steps.length - 3 && (
                    <button onClick={handleSubmit}>Submit</button>
                )}
                
            </div>
        </>
    )
}

export default OnboardUser;