import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../firebase_config"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useUser } from "../UserContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "../firebase_config"
import { calculateBMR, getActivityLevel, getGoal } from "../helper";


const WeightPage = () => {

    const [oldWeight, setWeight] = useState([]);
    const { userId } = useUser();
    const [newWeight, setNewWeight] = useState("");
    const [imageFile, setImageFile] = useState(null);

    const [showAllWeights, setShowAllWeights] = useState(false);

    const pastMonthWeights = () => {
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);
        return oldWeight.filter(entry => entry.time >= oneMonthAgo);
    }

    const displayWeights = [...(showAllWeights ? oldWeight : pastMonthWeights())];
    const reversedWeights = [...displayWeights].reverse();

    useEffect(() => {
        fetchWeights(userId);
    }, [])

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
                    imageUrl: docData.imageUrl || null,
                };
        });

        setWeight(data);

        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    const updateUserWeightField = async (newWeight) => {
        const userDocRef = doc(db, "Users", userId);
        //updates weight in user document
        const docSnap = await getDoc(userDocRef);
        const data = docSnap.data();
        const newDailyCalories = Math.round(calculateBMR(data.Gender, newWeight, data.Height, new Date().getFullYear() - new Date(data.Birthdate.toDate()).getFullYear(), getActivityLevel(data.Activity_Level)) + parseInt(getGoal(data.Goal)));
        setDoc(userDocRef, {
            Weight: newWeight,
            Daily_Calories: newDailyCalories,
        }, { merge: true });
    }

    const handleNewWeight = async () => {
        const value = parseFloat(newWeight);
        if (isNaN(value) || value <= 0) return alert("Please enter a valid number");

        const time = new Date();
        let imageUrl = "";

        if (imageFile) {
            try {
                const storageRef = ref(storage, `Users/${userId}/WeightPhotos/${Date.now()}.jpg`)
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            } catch (err) {
                console.error("Failed to upload image", err);
            }
        }

        const entry = {
            value, time, ...(imageUrl && { imageUrl })
        };
            
        console.log("submitting entry:", entry);

            try {
                const docId = Date.now().toString();
                const userWeightDocRef = doc(db, "Users", userId, "User_Weight", docId);
                const userDocRef = doc(db, "Users", userId);
                //updates weight in user document
                updateUserWeightField(value);
                //updates weight in user weight collection
                setDoc(userWeightDocRef, entry);
                console.log("Successfully added to Firestore:", docId);
                setWeight([...oldWeight, { ...entry, id: docId }]);
                setNewWeight("");
                setImageFile(null);
            } catch (err) {
                console.error("Error adding weight:", err);
            }
    }

    const handleDeleteWeight = async (id) => {
        try {
            await deleteDoc(doc(db, "Users", userId, "User_Weight", id));
            const updatedWeights = oldWeight.filter((entry) => entry.id !== id);
            const newLatestWeight = updatedWeights[updatedWeights.length - 1].value;
            console.log(newLatestWeight)
            updateUserWeightField(newLatestWeight);
            setWeight(updatedWeights);
        } catch (err) {
            console.error("Error deleting weight:", err);
        }
    }
    
    function WeightEntry({ weight, time, imageUrl, onDelete }) {
        return (
            <div>
                <h3>{weight} KG</h3>
                <p>{time.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}</p>
                {imageUrl && <img src={imageUrl} alt="Progress" width="150px" style={{ borderRadius: "10px" }}/>}
                <button onClick={onDelete}>Delete</button>
            </div>
        );
    }

    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

    const chartData = {
        labels: displayWeights.map(entry => entry.time.toLocaleDateString("en-GB", { day: "2-digit", month: "short"})),
        datasets: [
            {
                label: 'Weight (KG)',
                data: displayWeights.map(entry => entry.value),
                fill: false,
                borderColor: 'rgb(24, 22, 172)',
                tension: 0
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Weight Over Time' }
        }
    }

    return (
        <div className="weightContainer">
            {oldWeight.length > 0 ? (
                <>
                <h1>Current Weight: {oldWeight[oldWeight.length - 1].value} KG</h1>
                <h2>Last Updated: {oldWeight[oldWeight.length - 1].time.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}</h2>
                </>)
                : <h2>No Entries Yet</h2>
            }

            <div className="chartContainer">
                <Line data={chartData} options={chartOptions} />
            </div>
            
            <div>
                <input 
                    type="number"
                    placeholder="Enter Weight (KG)"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                />
                <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                />
                <button onClick={handleNewWeight} disabled={!newWeight}>Submit Weight Entry</button>
                <button onClick={() => setShowAllWeights(!showAllWeights)}>{showAllWeights ? "Show entries for the past month" : "Show all entries"}</button>
            </div>

            <div className="weightHistoryContainer">
                <ul className="verticalListOfBoxes">
                    {reversedWeights.map((entry, index) => 
                        (<li className="listItemInBox" key={entry.id}><WeightEntry weight={entry.value} time={entry.time} imageUrl={entry.imageUrl} onDelete={() => handleDeleteWeight(entry.id)}/></li>))}
                </ul>
            </div>
        </div>
    )
}

export default WeightPage;