import React from "react";
import { useState } from "react";
import { Link , useNavigate} from "react-router-dom";
import '../App.css';
import { auth } from '../firebase_config'; 
import { signInWithEmailAndPassword, signInAnonymously, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail  } from "firebase/auth";
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import GoogleButton from "react-google-button";

const LoginPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hiddenTag, setHiddenTag] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();

    const handleGoogleSignIn = () => {
        signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log(user.uid);
            navigate("/");
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
        });
        navigate("/");
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const user = userCred.user;
            if (!user.emailVerified) {
                setErrorMessage("Please verify your email before logging in.");
                setHiddenTag(false);
                await auth.signOut();
                return;
            }
            navigate("/");
            
        } 
        catch(e) {
            console.error("Firebase Authentication Error:", e.message);
            setHiddenTag(false);

            switch (e.code) {
                case "auth/user-not-found":
                    setErrorMessage("No user found with this email.")
                    break;
                case "auth/wrong-password":
                    setErrorMessage("Incorrect password.");
                    break;
                case "auth/invalid-email":
                    setErrorMessage("Please enter a valid email address.");
                    break
                default:
                    setErrorMessage("Login failed. Please try again.");
            }
        }
        
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setErrorMessage("Please enter your email address.");
            setHiddenTag(false);
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setErrorMessage("Check your email inbox for password reset instructions.");
            setHiddenTag(false);
        }
        catch (e) {
            console.error("Password reset error: ", e.message);
            setHiddenTag(false);

            switch (e.code) {
                case "auth/user-not-found":
                    setErrorMessage("No user found with this email");
                    break;
                case "auth/invalid-email":
                    setErrorMessage("Please enter a valid email address.");
                    break;
                default:
                    setErrorMessage("Password reset failed. Please try again.");
            }
        }
    }

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="inputContainer">
                    <input type="text" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <FaUser className="loginIcon"/>
                </div>

                <div className="inputContainer">
                    <input type="password" placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <FaLock className="loginIcon"/>
                </div>
                
                <button type="submit" className="button">Login</button>
                <button type="button" className="button" onClick={handlePasswordReset}>Reset Password</button>

                <p hidden={hiddenTag} id="userNotFoundMessage">{errorMessage}</p>
            </form>
            
            <label>New here? </label><Link to="/registerPage">Create an account</Link>
            <div className="OrLineBreak">
                <hr></hr>
                <span> Or </span> 
                <hr></hr>
            </div>
            <button style={{padding: "3px"}} onClick={handleGoogleSignIn}>
                <GoogleButton className="button"/>
            </button>
        
        </div>
    )
}

export default LoginPage;