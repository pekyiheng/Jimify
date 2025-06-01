import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../App.css';
import { auth } from '../firebase_config';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const RegisterPage = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setComfirmPassword] = useState("");
    const [hiddenTag, setHiddenTag] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, username, password);
            navigate("/loginPage");
        }
        catch (e) {
            console.error("Firebase Authentication Error:", e.message);
            setHiddenTag(false); 
        }
        
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <label>Username: </label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <br/>
                <label>Password: </label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <br/>
                <label>Confirm Password: </label>
                <input type="text" value={confirmPassword} onChange={(e) => setComfirmPassword(e.target.value)}/>
                <br/>
                <button type="submit">Register</button>
                <br/>
                <p hidden={hiddenTag} id="userExists">Username already exists</p>
                <label>Already have an account? </label><Link to="/loginPage">Sign in</Link>
            </form>
        
        </div>
    )
}

export default RegisterPage;