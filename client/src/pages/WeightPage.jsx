import { useState, useEffect } from "react";
import axios from "axios";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";

const WeightPage = () => {

    const [oldWeight, setWeight] = useState([]);
    const [userId, setUserId] = useState(null);

    //check if valid user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchWeights(user.uid);
            }
        });
        return () => unsubscribe();
    }, [])

    const fetchWeights = async (uid) => {
        const colRef = collection(db, "User_Weight");
        const q = query(colRef, where("uid", "==", uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((docSnap) => {
            const docData = docSnap.data();
            return {
                id: docSnap.id,
                value: docData.value,
                uid: docData.uid,
                time: docData.time.toDate(),
            };
        });
        setWeight(data);
    }

    const handleNewWeight = async () => {
        const input = prompt("New Entry:");
        const value = parseFloat(input);
        
        if (!isNaN(value)) {

            const time = new Date();
        
            const entry = {
                value, time, uid: auth.currentUser?.uid,
            };

            
        console.log("submitting entry:", entry);

            try {
                const docRef = await addDoc(collection(db, "User_Weight"), entry);
                console.log("Successfully added to Firestore:", docRef.id);
                setWeight([...oldWeight, { ...entry, id: docRef.id }]);
            } catch (err) {
                console.error("Error adding weight:", err);
            }
        }
    }

    const handleDeleteWeight = async (id) => {
        try {
            await deleteDoc(doc(db, "User_Weight", id));
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

    return (
        <div className="weightContainer">
            {oldWeight.length > 0 ? (
                <>
                <h1>{oldWeight[oldWeight.length - 1].value} KG</h1>
                <h2>Last Updated: {oldWeight[oldWeight.length - 1].time.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}</h2>
                </>)
                : <h2>No Entries Yet</h2>
            }
            
            <div>
                <ul className="verticalListOfBoxes">
                    {oldWeight.map((entry, index) => 
                        (<li className="listItemInBox" key={entry.id}><WeightEntry weight={entry.value} time={entry.time} onDelete={() => handleDeleteWeight(entry.id)}/></li>))}
                </ul>
            </div>
            
            <div>
                <button onClick={handleNewWeight}>+ New Entry</button>
            </div>
        </div>
    )
}

export default WeightPage;