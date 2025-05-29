import { useState } from "react";
import { Link } from "react-router-dom";
import '../App.css';

const RegisterPage = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setComfirmPassword] = useState("");

    const handleSubmit = (event) => {};

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
                <label>Already have an account? </label><Link to="/loginPage">Sign in</Link>
            </form>
        
        </div>
    )
}

export default RegisterPage;