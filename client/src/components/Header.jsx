import { signOut } from "firebase/auth";
import { auth } from '../firebase_config';

const Header = () => {
    const handleLogOut = () => {
        signOut(auth);
    };

    return (
        <div className="header">
            <h1>Jimify</h1>
            <button onClick={handleLogOut}>Sign out</button>
        </div>
    )
}

export default Header;