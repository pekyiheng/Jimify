import { useState } from "react";
import '../App.css';

const LoginPage = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {};

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>Username: </label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <br/>
                <label>Password: </label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <br/>
                <input type="submit" />
            </form>
        
        </div>
    )
}

export default LoginPage;