import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebase_config"
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from '../UserContext';

const ExperienceBar = () => {
    
    const { exp } = useUser();
    const level = Math.floor(Math.pow(exp / 100, 2/3));
    const nextLevel = level + 1;
    const expForNextLevel = Math.pow(nextLevel, 3/2) * 100;
    const expForCurrentLevel = Math.pow(level, 3/2) * 100;
    const diffBtnLevels = expForNextLevel - expForCurrentLevel;
    const progress = exp - expForCurrentLevel;
    const progressPercentage = (progress / diffBtnLevels) * 100;

    /*
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
    */
    
    return (
        <div>
            Level: {level}
            <br/>
            EXP Progress: <progress value={progress} max={diffBtnLevels} /> {Math.floor(progressPercentage)}%
        </div>
    )
}

export default ExperienceBar;