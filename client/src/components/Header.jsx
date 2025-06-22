import { signOut } from "firebase/auth";
import { auth } from '../firebase_config';
import { GiWeightLiftingUp } from "react-icons/gi";
import { Navigate } from "react-router-dom";

const Header = () => {
    const handleLogOut = () => {
        signOut(auth);
        Navigate('/loginPage');
    };

    return (
        <div className="header">
            <h1>Jimify <GiWeightLiftingUp /></h1>
            
            <button onClick={handleLogOut}>Sign out</button>
        </div>
    )
}

export default Header;