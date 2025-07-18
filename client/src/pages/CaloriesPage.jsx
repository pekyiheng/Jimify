import React from 'react';
import AddFood from "../components/AddFood";
import Spinner from '../components/Spinner';
import { formatDateToYYYYMMDD } from "../helper";
import { useState, useEffect, useRef } from "react";
import { getDoc, doc, } from "firebase/firestore";
import { db, model } from "../firebase_config"
import { useUser } from "../UserContext";

const CaloriesPage = () => {
    const [totalCalories, setTotalCalories] = useState(0);
    const [curDate, setCurDate] = useState(new Date());
    const [imageFile, setImageFile] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showErr, setShowErr] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Please select an image")
    const [loading, setLoading] = useState(false)
    const [aiResponse, setAiResponse] = useState('');
    const dialogRef = useRef(null);
    const fileInputRef = useRef(null);
    const { userId } = useUser();

    useEffect(() => {
        if (showDialog) {
            dialogRef.current.showModal();
        } else {
            dialogRef.current.close();
        }
    }, [showDialog]);

    useEffect(() => {
        fetchCalories(userId)
    }, [curDate])

    const promptAI = async () => {
        if (imageFile === null) {
            setErrorMessage("Please select an image")
            setShowErr(true);
            return;
        }

        const prompt = "Can you estimate how much calories is in the food? Your response should be in this format. A brief breakdown of the food present, and a new line stating total calories"
        setLoading(true);

        try {
            const imagePart = await fileToGenerativePart(imageFile);
            const result = await model.generateContent([prompt, imagePart]);
            const response = result.response;
            const text = response.text();
            setAiResponse(text);
        }
        catch (e) {
            setErrorMessage("An error occured. Please try again.")
            setShowErr(true);
            console.error(e);
            return;
        }
        finally {
            setLoading(false);
        }
    }

async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }
  

    const fetchCalories = async (uid) => {
        const userCaloriesDocRef = doc(db, "Users", uid, "User_Calories", formatDateToYYYYMMDD(curDate));

        try {
            const docSnap = await getDoc(userCaloriesDocRef);
            let newCalories = 0;
            if (docSnap.exists) {
                const data = docSnap.data();
                newCalories = data.totalCalories || 0;
            }
            setTotalCalories(newCalories);
        }
        catch (e) {
            console.error(e);
            setTotalCalories(0);
            return null;
        }
    }

    const handleFoodChange = () => {
        fetchCalories(userId);
    }

    const cancelAIDialog = () => {
        setShowErr(false);
        setShowDialog(false);
        setAiResponse('');
        setImageFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
    }


    return (
        <div>            
            <dialog id='dialogBox' ref={dialogRef}>
                <input 
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setImageFile(e.target.files[0])}
                />
                <p className='invalidFields'>{showErr ? errorMessage : ""}</p>
                <Spinner isLoading={loading}></Spinner>
                <div>
                    {loading && <p>Loading...</p>}
                    {aiResponse !== '' && <p>{aiResponse}</p>}
                </div>
                <button onClick={promptAI} >Scan with Gemini AI </button>
                <button onClick={cancelAIDialog}>Cancel</button>
            </dialog>
            <header>
                <h2>Calories Tracker</h2>
            </header>
            <div className="caloriesDateNav">
                <button onClick={() => setCurDate(new Date(curDate.setDate(curDate.getDate() - 1)))}>
                    &lt;
                </button>
                <input type='Date' value={formatDateToYYYYMMDD(curDate)} onChange={(e) => setCurDate(new Date(e.target.value))}></input>
                <button onClick={() => setCurDate(new Date(curDate.setDate(curDate.getDate() + 1)))}>
                    &gt;
                </button>
            </div>
            <p>Calories: {totalCalories}</p>
            <AddFood mealType="Breakfast" curDate={formatDateToYYYYMMDD(curDate)} userId={userId} onFoodChange={handleFoodChange} />
            <AddFood mealType="Lunch" curDate={formatDateToYYYYMMDD(curDate)} userId={userId} onFoodChange={handleFoodChange} />
            <AddFood mealType="Dinner" curDate={formatDateToYYYYMMDD(curDate)} userId={userId} onFoodChange={handleFoodChange} />
            <div className='AI_Scanner_ctn'>
                <div className='AI_Scanner_btn'>
                    <button onClick={() => setShowDialog(true)}>Need help estimating calories? Ask Gemini</button>
                </div>
            </div>
        </div>
    );
}

export default CaloriesPage;