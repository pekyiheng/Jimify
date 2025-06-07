import { useState, useEffect, useRef } from 'react';

const CustomizeUser = () => {

    const [showDialog, setShowDialog] = useState(false);
    const dialogRef = useRef(null);
    const [dailyCalories, setDailyCalories] = useState(0);
    const [weight, setWeight] = useState(0);
    const [height, setHeight] = useState(0);
    const [age, setAge] = useState(0);
    const [gender, setGender] = useState('M');
    const [activityLevel, setActivityLevel] = useState(1.2);

    const toggleDialog = () => {
        setShowDialog(!showDialog);
    };

    useEffect(() => {
        if (showDialog) {
        dialogRef.current.showModal();
        } else {
        dialogRef.current.close();
        }
    }, [showDialog]);

    function calculateBMR(gender, weight, height, age, activityFactor) {
        var genderFactor = 0;
        if (gender == 'M') {
             genderFactor = 5;
        } else {
            genderFactor = -161;
        }
        return (10 * weight + 6.25 * height - 5 * age + genderFactor) * activityFactor;

    }

    const toggleActivityLevel = (e) => {
        switch (e.target.value) {
            case 'light':
                setActivityLevel(1.375);
                break;
            case 'moderate':
                setActivityLevel(1.55);
                break;
            case 'active':
                setActivityLevel(1.725);
                break;
            case 'very active':
                setActivityLevel(1.9);
                break;
            default:
                setActivityLevel(1.2);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setDailyCalories(calculateBMR(gender, weight, height, age, activityLevel));
    }

    return (
        <>
            <button onClick={toggleDialog}>Show dialog</button>
            <dialog ref={dialogRef}>
                <header>
                    Welcome to Jimify! Let's set up yout profile
                </header>
                <div>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor='usernameField' >Username</label>
                        <input id='usernameField' type='text'></input>
                        <br></br>
                        <label htmlFor='genderField' >What is your age?</label>
                        <select id='genderField' value={gender} onChange={e => setGender(e.target.value)} >
                            <option value='M' >Male</option>
                            <option value='F' >Female</option>
                        </select>
                        <br></br>
                        <label htmlFor='ageField' >What is your age?</label>
                        <input id='ageField' type='number' onChange={e => setAge(e.target.value)} ></input>
                        <br></br>
                        <label htmlFor='heightField' >What is your height?</label>
                        <input id='heightField' type='number' onChange={e => setHeight(e.target.value)} ></input>
                        <br></br>
                        <label htmlFor='initialWeightField' >What is your current weight?</label>
                        <input id='initialWeightField' type='number' onChange={e => setWeight(e.target.value)} ></input>
                        <br></br>
                        <label htmlFor='goalField' >What is your goal?</label>
                        <select id="goalField" name="goalField">
                            <option value="gain">Gain weight</option>
                            <option value="lose">Lose weight</option>
                            <option value="maintain">Maintain weight</option>
                        </select>
                        <label htmlFor='goalField' >How active are you??</label>
                        <select id="activityField" name="activityField" onChange={toggleActivityLevel} >
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
}

export default CustomizeUser;