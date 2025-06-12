import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";


const ExperienceBar = () => {
    
    const [exp, setExp] = useState(0);
    const level = Math.floor(exp / 100);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchExp(user.uid);
            }
        });
        return () => unsubscribe();
    }, [])

    const fetchExp = async (uid) => {
        const userRef = doc(db, "Users", uid);
        
        try {
            const userSnap = await getDoc(userRef);
            const exp = userSnap.exists() && !isNaN(userSnap.data().exp) ? userSnap.data().exp : 0;
            setExp(exp);
        }
        catch (e) {
            console.error(e);
        }
    }
    
    return (
        <div>
            Level: {level}
            <br/>
            EXP Progress: <progress value={exp % 100} max={100} />
        </div>
    )
}

export default ExperienceBar;