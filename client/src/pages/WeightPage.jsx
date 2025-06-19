import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../firebase_config"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useUser } from "../UserContext";

const WeightPage = () => {

    const [oldWeight, setWeight] = useState([]);
    const { userId } = useUser();

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
                };
        });

        setWeight(data);

        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    const handleNewWeight = async () => {
        const input = prompt("New Entry (KG):");
        const value = parseFloat(input);
        
        if (!isNaN(value)) {

            const time = new Date();
            const entry = {
                value, time,
            };
            
            console.log("submitting entry:", entry);

            try {
                const docId = Date.now().toString();
                const userWeightDocRef = doc(db, "Users", userId, "User_Weight", docId);
                const docRef = await setDoc(userWeightDocRef, entry);
                console.log("Successfully added to Firestore:", docId);
                setWeight([...oldWeight, { ...entry, id: docId }]);
            } catch (err) {
                console.error("Error adding weight:", err);
            }
        }
    }

    const handleDeleteWeight = async (id) => {
        try {
            await deleteDoc(doc(db, "Users", userId, "User_Weight", id));
            const updatedWeights = oldWeight.filter((entry) => entry.id !== id);
            setWeight(updatedWeights);
        } catch (err) {
            console.error("Error deleting weight:", err);
        }
    }
    
    function WeightEntry({ weight, time, onDelete }) {
        return (
            <div>
                <h3>{weight} KG</h3>
                <p>{time.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}</p>
                <button onClick={onDelete}>Delete</button>
            </div>
        );
    }

    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

    const chartData = {
        labels: oldWeight.map(entry => entry.time.toLocaleDateString("en-GB", { day: "2-digit", month: "short"})),
        datasets: [
            {
                label: 'Weight (KG)',
                data: oldWeight.map(entry => entry.value),
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
                <button onClick={handleNewWeight}>+ New Entry</button>
            </div>

            <div className="weightHistoryContainer">
                <ul className="verticalListOfBoxes">
                    {oldWeight.map((entry, index) => 
                        (<li className="listItemInBox" key={entry.id}><WeightEntry weight={entry.value} time={entry.time} onDelete={() => handleDeleteWeight(entry.id)}/></li>))}
                </ul>
            </div>
        </div>
    )
}

export default WeightPage;