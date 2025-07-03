import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, updateDoc, increment, query, where, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase_config"
import { useUser } from '../UserContext';


const MyProfilePage = () => {

    const { userId } = useUser();
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        fetchActivity(userId);
    }, [])

    const fetchActivity = async (uid) => {
        const userActivityColRef = collection(db, "Users", uid, "Activity_Log");
        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        
        try {
            const q = query(userActivityColRef, where("time", ">=", oneWeekAgo));
            const docSnap = await getDocs(q);
            const data = docSnap.docs.map((doc) => {
                const docData = doc.data();
                return {
                    id: doc.id,
                    note: docData.note,
                    time: docData.time,
                };
        }).reverse();

        setActivity(data);

        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    function ActivityEntry({ activity, time }) {
        return (
            <div>
                <p>{time.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}: {activity}</p>
            </div>
        );
    }

    return ( 
        <div>
            <h2>My Profile</h2>
            <h3>Activity Log for past week</h3>
            <ul>
                {activity.map((entry, index) => 
                    (<li key={entry.id}><ActivityEntry activity={entry.note} time={entry.time.toDate()}/></li>))}
            </ul>
        </div>
    ) 
}

export default MyProfilePage;