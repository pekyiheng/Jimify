import { useState, useEffect } from "react";
import { collection, getDoc, getDocs, addDoc, setDoc, deleteDoc, doc, updateDoc, increment, query, where, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase_config"
import { useUser } from '../UserContext';

const FriendsPage = () => {

    const { userId } = useUser();
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [addFriend, setAddFriend] = useState("");
    const [ownUsername, setOwnUsername] = useState("");

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
            setOwnUsername(data?.Username || "");
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

        const toUsername = addFriend;
        if (toUsername === ownUsername) {
            alert("Please select another user");
            return;
        }

        let toUserId = null;
        const toUserIdQuery = query(collection(db, "Users"), where("Username", "==", toUsername));
        const toUserIdSnapshot = await getDocs(toUserIdQuery);
        if (!toUserIdSnapshot.empty) {
            const toUserDoc = toUserIdSnapshot.docs[0];
            toUserId = toUserDoc.id;
        } else {
            alert("No user found with that username");
            return;
        }

        const existingRequest = query(collection(db, "FriendRequests"), where("fromUserId", "==", userId), where("toUserId", "==", toUserId), where("status", "==", "pending"))
        const requestExists = await getDocs(existingRequest);
        if (!requestExists.empty) {
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
            console.log("Friend Request sent: ", docId);
            setAddFriend("");
            fetchOutgoingRequests(userId);
        } catch (err) {
            console.error("Error sending Friend Request: ", err);
        }
    }

    const handleRemoveFriend = async (friendUserId) => {
        try {
            await updateDoc(doc(db, "Users", userId), {
                friends: arrayRemove(friendUserId)
            });
            await updateDoc(doc(db, "Users", friendUserId), {
                friends: arrayRemove(userId)
            });
            setFriends(friends.filter(friend => friend !== friendUserId));
        } catch (err) {
            console.error("Error removing friend: ", err);
        }
    }

    function Friends({ friendUserId, onRemove }) {
        const [friendUsername, setFriendUsername] = useState("");

        useEffect(() => {
            const fetchFriendUsername = async () => {
                try {
                    const docSnap = await getDoc(doc(db, "Users", friendUserId));
                    const data = docSnap.data();
                    setFriendUsername(data?.Username || "Unknown");
                } catch (e) {
                    console.error(e);
                    return null;
                }  
            }
            fetchFriendUsername();
        }, [friendUserId])

        return (
            <>
                <p>{friendUsername}</p>
                <button className="button" onClick={onRemove}>Remove friend</button>
            </>
        )
    }

    function IncomingRequest({ fromUserId, onAccept, onReject }) {

        const [fromUsername, setFromUsername] = useState("");

        useEffect(() => {
            const fetchFromUsername = async () => {
                try {
                    const docSnap = await getDoc(doc(db, "Users", fromUserId));
                    const data = docSnap.data();
                    setFromUsername(data?.Username || "Unknown");
                } catch (e) {
                    console.error(e);
                    return null;
                }  
            }
            fetchFromUsername();
        }, [fromUserId])

        return (
            <>
                <p>{fromUsername}</p>
                <button className="button" onClick={onAccept}>Accept</button>
                <button className="button" onClick={onReject}>Reject</button>
            </>
        );
    }

    function OutgoingRequest({ toUserId }) {
        const [toUsername, setToUsername] = useState("");

        useEffect(() => {
            const fetchToUsername = async () => {
                try {
                    const docSnap = await getDoc(doc(db, "Users", toUserId));
                    const data = docSnap.data();
                    setToUsername(data?.Username || "Unknown");
                } catch (e) {
                    console.error(e);
                    return null;
                }  
            }
            fetchToUsername();
        }, [toUserId])
        
        return (
            <>
                <p>{toUsername}</p>
                <p>Status: PENDING</p>
            </>
        );
    }

    return ( 
        <div>
            <h2>Friends:</h2>
            <ul> {friends.map((entry, index) => 
                (<li key={entry}><Friends friendUserId={entry} onRemove={() => handleRemoveFriend(entry)} /></li>))}</ul>
            <h2>Incoming Requests:</h2>
            <ul> {incomingRequests.map((entry, index) => 
                (<li key={entry.id}><IncomingRequest fromUserId={entry.fromUserId} onAccept={() => handleAccept(entry.id, entry.fromUserId)} onReject={() => handleReject(entry.id)}/></li>))}</ul>
            <h2>Outgoing Requests:</h2>
            <ul> {outgoingRequests.map((entry, index) => 
                (<li key={entry.id}><OutgoingRequest toUserId={entry.toUserId}/></li>))}</ul>

            <label>Add Friend: </label>
            <input type="text" value={addFriend} onChange={(e) => setAddFriend(e.target.value)} placeholder="username"></input>
            <button className="button" onClick={handleRequest} disabled={!addFriend}>Send Friend Request</button>
        </div>
    )
}

export default FriendsPage;