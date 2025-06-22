import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, updateDoc, increment, query, where, arrayUnion } from "firebase/firestore";
import { db } from "../firebase_config"
import { useUser } from '../UserContext';

const FriendsPage = () => {

    const { userId } = useUser();
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [addFriend, setAddFriend] = useState("");

    useEffect(() => {
        fetchFriends(userId);
        fetchIncomingRequests(userId);
        fetchOutgoingRequests(userId);
    }, [])

    const fetchFriends = async (uid) => {
        const userDocRef = doc(db, "Users", uid);
        
        try {
            const docSnap = await getDoc(userDocRef);
            const data = docSnap.data();
            setFriends(data?.friends || []);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    const fetchOutgoingRequests = async (uid) => {
        try {
            const q = query(collection(db, "FriendRequests"), where("fromUserId", "==", uid), where("status", "==", "pending"));
            const docSnap = await getDocs(q);
            const data = docSnap.docs.map((docSnap) => {
                const docData = docSnap.data();
                return {
                    id: docSnap.id,
                    toUserId: docData.toUserId,
                };
            })
            setOutgoingRequests(data);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    const fetchIncomingRequests = async (uid) => {
        try {
            const q = query(collection(db, "FriendRequests"), where("toUserId", "==", uid), where("status", "==", "pending"));
            const docSnap = await getDocs(q);
            const data = docSnap.docs.map((docSnap) => {
                const docData = docSnap.data();
                return {
                    id: docSnap.id,
                    fromUserId: docData.fromUserId,
                };
            })
            setIncomingRequests(data);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    const handleAccept = async (id, fromUserId) => {
         try {
            await updateDoc(doc(db, "FriendRequests", id), {status: "accepted"});
            const updatedIncomingRequests = incomingRequests.filter((entry) => entry.id !== id);
            setIncomingRequests(updatedIncomingRequests);

            await setDoc(doc(db, "Users", userId), {
                friends: arrayUnion(fromUserId),
            }, { merge: true });

            await updateDoc(doc(db, "Users", fromUserId), {
                friends: arrayUnion(userId),
            }, { merge: true });

            fetchFriends(userId);

        } catch (err) {
            console.error("Error accepting request:", err);
        }
    }

    const handleReject = async (id) => {
        try {
            await updateDoc(doc(db, "FriendRequests", id), {status: "rejected"});
            const updatedIncomingRequests = incomingRequests.filter((entry) => entry.id !== id);
            setIncomingRequests(updatedIncomingRequests);
        } catch (err) {
            console.error("Error rejecting request:", err);
        }
    }

    const handleRequest = async () => {

        const toUserId = addFriend;
        if (toUserId === userId) {
            alert("Please select another user");
            return;
        }

        const existing = query(collection(db, "FriendRequests"), where("fromUserId", "==", userId), where("toUserId", "==", toUserId), where("status", "==", "pending"))
        const exists = await getDocs(existing);
        if (!exists.empty) {
            alert("Friend request already sent");
            return;
        }

        const entry = {
            fromUserId: userId,
            toUserId: toUserId,
            status: "pending",
        };

        try {
            const docId = Date.now().toString();
            const friendRequestDocRef = doc(db, "FriendRequests", docId);
            const docRef = await setDoc(friendRequestDocRef, entry);
            console.log("Friend Request ent: ", docId);
            setAddFriend("");
            fetchOutgoingRequests();
        } catch (err) {
            console.error("Error sending Friend Request:", err);
        }
    }

    function IncomingRequest({ fromUserId, onAccept, onReject }) {
        return (
            <>
                <p>{fromUserId}</p>
                <button className="button" onClick={onAccept}>Accept</button>
                <button className="button" onClick={onReject}>Reject</button>
            </>
        );
    }

    function OutgoingRequest({ toUserId }) {
        return (
            <>
                <p>{toUserId}</p>
                <p>Status: PENDING</p>
            </>
        );
    }

    return ( 
        <div>
            <h2>Friends:</h2>
            <ul> {friends.map((entry, index) => 
                (<li key={entry}>{entry}</li>))}</ul>
            <h2>Incoming Requests:</h2>
            <ul> {incomingRequests.map((entry, index) => 
                (<li key={entry.id}><IncomingRequest fromUserId={entry.fromUserId} onAccept={() => handleAccept(entry.id, entry.fromUserId)} onReject={() => handleReject(entry.id)}/></li>))}</ul>
            <h2>Outgoing Requests:</h2>
            <ul> {outgoingRequests.map((entry, index) => 
                (<li key={entry.id}><OutgoingRequest toUserId={entry.toUserId}/></li>))}</ul>

            <label>Add Friend: </label>
            <input type="text" value={addFriend} onChange={(e) => setAddFriend(e.target.value)} placeholder="user ID"></input>
            <button className="button" onClick={handleRequest} disabled={!addFriend}>Send Friend Request</button>
        </div>
    )
}

export default FriendsPage;