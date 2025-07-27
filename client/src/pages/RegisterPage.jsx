import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../App.css';
import { auth } from '../firebase_config';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";

const RegisterPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hiddenTag, setHiddenTag] = useState(true);
    const [errorMessage, setErrorMessage] =useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setHiddenTag(false);
            setErrorMessage("Passwords do not match.");
            return;
        }
        
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCred.user;

            await sendEmailVerification(user)
                .then(() => {
                    alert("Verification email sent. Please check your inbox.");
                })
                .catch((e) => {
                    console.error("Error sending verification email: ", e.errorMessage);
                });
            navigate("/loginPage");
        }
        catch (e) {
            console.error("Firebase Authentication Error:", e.message);
            setHiddenTag(false); 

            switch (e.code) {
                case "auth/email-already-in-use":
                    setErrorMessage("This email is already registered.")
                    break;
                case "auth/invalid-email":
                    setErrorMessage("Please enter a valid email address.");
                    break;
                case "auth/weak-password":
                    setErrorMessage("Password should be at least 6 characters.");
                    break
                default:
                    setErrorMessage("Registration failed. Please try again.");
            }
        }
        
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div className="inputContainer">
                    <input type="text" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <FaUser className="loginIcon"/>
                </div>

                <div className="inputContainer">
                    <input type="password" placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <FaLock className="loginIcon"/>
                </div>
                
                <div className="inputContainer">
                    <input type="password" placeholder="Confirm Password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                    <FaLock className="loginIcon"/>
                </div>

                <button type="submit" className="button">Register</button>
                <br/>
                <p hidden={hiddenTag} id="userExists">{errorMessage}</p>
                <label>Already have an account? </label><Link to="/loginPage">Sign in</Link>
            </form>
        
        </div>
    )
}

export default RegisterPage;