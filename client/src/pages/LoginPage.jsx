import { useState } from "react";
import { Link , useNavigate} from "react-router-dom";
import '../App.css';
import { auth } from '../firebase_config'; 
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [hiddenTag, setHiddenTag] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            /* const res = await axios.post("http://localhost:8080/login/", {username, password});
            if (res.data == "success") {
                navigate("/");
            } else {
                setHiddenTag(false);
                console.log("no user");
            } */
            await signInWithEmailAndPassword(auth, username, password);
            navigate("/");
            
        } 
        catch(e) {
            console.error("Firebase Authentication Error:", e.message);
            setHiddenTag(false);
        }
        
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>Username: </label>
                <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <br/>
                <label>Password: </label>
                <input type="text" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <br/>
                <button type="submit">Login</button>
                <br/>
                <p hidden={hiddenTag} id="userNotFoundMessage">Username does not exist or password is wrong</p>
            </form>
            <label>New here? </label><Link to="/registerPage">Create an account</Link>
        
        </div>
    )
}

export default LoginPage;