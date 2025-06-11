import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';



const WeightWidget = () => {
    
    const [oldWeight, setWeight] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchWeights(user.uid);
            }
        });
        return () => unsubscribe();
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
        <div className="chartContainer">
            <Line data={chartData} options={chartOptions} />
        </div>
    )
}

export default WeightWidget;