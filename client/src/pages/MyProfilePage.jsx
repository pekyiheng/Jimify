import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, updateDoc, increment, query, where, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase_config"
import { useUser } from '../UserContext';
import { VscAccount } from "react-icons/vsc";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase_config";


const MyProfilePage = () => {

    const { userId } = useUser();
    const [activity, setActivity] = useState([]);
    const [username, setUsername] = useState("");
    const [activityLevel, setActivityLevel] = useState("");
    const [gender, setGender] = useState("");
    const [birthdate, setBirthdate] = useState(new Date());
    const [height, setHeight] = useState(0);
    const [goal, setGoal] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [changeProfilePicture, setChangeProfilePicture] = useState(false);
    const [newProfilePicture, setNewProfilePicture] = useState("");
    const [level, setLevel] = useState(0);
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        fetchActivity(userId);
        fetchDetails(userId);
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
                    time: docData.time?.toDate ? docData.time.toDate() : docData.time,
                };
        }).reverse();

        setActivity(data);

        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    const fetchDetails = async (uid) => {
        const userDocRef = doc(db, "Users", uid);
        const userBadgesColRef = collection(db, "Users", uid, "User_Badges");
        
        try {
            const docSnap = await getDoc(userDocRef);
            const data = docSnap.data();
            setActivityLevel(data.Activity_Level);
            setBirthdate(data.Birthdate?.toDate ? data.Birthdate.toDate() : data.Birthdate);
            setGender(data.Gender);
            setGoal(data.Goal);
            setHeight(data.Height);
            setUsername(data.Username);
            setProfilePicture(data.Profile_Picture || "");
            setLevel(Math.floor(Math.pow(data.exp / 100, 2/3)));

            const userBadgesSnap = await getDocs(userBadgesColRef);
            if (!userBadgesSnap.empty) {
                const badgesColRef = collection(db, "Badges");

                const userBadgesPromise = userBadgesSnap.docs.map(async (badge) => {
                    const name = badge.id;
                    const time = badge.data().earnedOn?.toDate ? badge.data().earnedOn.toDate() : badge.data().earnedOn;
                    const badgeDocRef = doc(badgesColRef, name);
                    const badgeDocSnap = await getDoc(badgeDocRef); 
                    const imageUrl = badgeDocSnap.data().Picture;
                    const description = badgeDocSnap.data().Description;
                    return {
                        name: name,
                        time: time,
                        imageUrl: imageUrl,
                        description: description
                    }
                })

                const userBadges = await Promise.all(userBadgesPromise);
                setBadges(userBadges);
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    const handleNewProfilePicture = async () => {
        console.log(newProfilePicture);
        if (!newProfilePicture) {
            return;
        }
        const storageRef = ref(storage, `Users/${userId}/ProfilePicture.jpg`);
        try {
            await uploadBytes(storageRef, newProfilePicture);
            const downloadURL = await getDownloadURL(storageRef);

            await updateDoc(doc(db, "Users", userId), {
                Profile_Picture: downloadURL
            });

            alert("Profile picture updated");
            setNewProfilePicture("");
            setProfilePicture(downloadURL);
            setChangeProfilePicture(false);
        } catch (e) {
            console.error("Error uploading profile picture: ", e);
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
            {profilePicture 
                ? (<img src={profilePicture} className="profilePicture"/>)
                : (<VscAccount size={150}/>)}
            <br/>
            <span className="highlighted" onClick={() => setChangeProfilePicture(!changeProfilePicture)}>Change profile picture</span>
            {changeProfilePicture
                ? (
                    <div>
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewProfilePicture(e.target.files[0])}
                        />
                        <br/>
                        <button onClick={handleNewProfilePicture} disabled={!newProfilePicture}>Upload profile picture</button>
                    </div>)
                : (<></>)}
            
            <p>Username: {username}</p>
            <p>Level: {level}</p>
            <p>Gender: {gender}</p>
            <p>Birthday: {birthdate.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}</p>
            <p>Height: {height}</p>
            <p>Activity Level: {activityLevel}</p>
            <p>Goal: {goal}</p>

            <h3>My Badges</h3>
            {badges.length == 0
                ? (<p>No badges yet</p>)
                : (<ul>
                    {badges.map((entry, index) =>
                        (<li key={entry.name} className="badgeItem">
                            <div><img src={entry.imageUrl} className="profilePicture"/></div>
                            <div className="rightContent">
                                <h4>{entry.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h4>
                                <p>Earned on: {entry.time.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})}</p>
                                <p>{entry.description}</p>
                            </div>
                        </li>))}
                </ul>)}
            <h3>Activity Log for past week</h3>
            {activity.length == 0
                ? (<p>Silent...</p>)
                : (<ul>
                    {activity.map((entry, index) => 
                        (<li key={entry.id}><ActivityEntry activity={entry.note} time={entry.time}/></li>))}
                </ul>)}
        </div>
    ) 
}

export default MyProfilePage;