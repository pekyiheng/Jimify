import React from 'react';
import AddFood from "../components/AddFood";
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
    const [aiResponse, setAiResponse] = useState('');
    const dialogRef = useRef(null);
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
            setShowErr(true);
            return;
        }

        const prompt = "Can you estimate how much calories is in the food? Give me a definite number."
        
        const imagePart = await fileToGenerativePart(imageFile);
        console.log("prompting...")
  
    // To generate text output, call generateContent with the text and image
        const result = await model.generateContent([prompt, imagePart]);
  
        const response = result.response;
        const text = response.text();
        setAiResponse(text);
    }

    // Converts a File object to a Part object.
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
            if (docSnap.exists()) {
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
    }


    return (
        <div>            
            <dialog ref={dialogRef}>
                <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                />
                <p className='invalidFields'>{showErr ? "Please select an image" : ""}</p>
                <p>{aiResponse}</p>
                <button onClick={promptAI} >Scan with Gemini AI </button>
                <button onClick={cancelAIDialog}>Cancel</button>
            </dialog>
            <header className="caloriesDateNav">
                <button onClick={() => setCurDate(new Date(curDate.setDate(curDate.getDate() - 1)))}>
                    &lt;
                </button>
                <p>{formatDateToYYYYMMDD(curDate)}</p>
                <button onClick={() => setCurDate(new Date(curDate.setDate(curDate.getDate() + 1)))}>
                    &gt;
                </button>
            </header>
            <p>Calories: {totalCalories}</p>
            <AddFood mealType="Breakfast" curDate={formatDateToYYYYMMDD(curDate)} userId={userId} onFoodChange={handleFoodChange} />
            <AddFood mealType="Lunch" curDate={formatDateToYYYYMMDD(curDate)} userId={userId} onFoodChange={handleFoodChange} />
            <AddFood mealType="Dinner" curDate={formatDateToYYYYMMDD(curDate)} userId={userId} onFoodChange={handleFoodChange} />
            <div id='AI_Scanner_ctn'>
                <button onClick={() => setShowDialog(true)}>Scan with AI</button>
            </div>
        </div>
    );
}

export default CaloriesPage;