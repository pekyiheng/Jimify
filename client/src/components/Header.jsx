import { signOut } from "firebase/auth";
import { auth } from '../firebase_config';
import { GiWeightLiftingUp } from "react-icons/gi";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CustomizeUser from '../components/CustomizeUser';

const Header = ({toOnboard}) => {
    const [showSignOut, setShowSignOut] = useState(false);
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                setShowSignOut(false);
            } else {
                setShowSignOut(true);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogOut = () => {
        signOut(auth);
        Navigate('/loginPage');
    };

    return (
        <div className="header">
            <h1>Jimify <GiWeightLiftingUp /></h1>
            
            {showSignOut && <>
                                {!toOnboard && <CustomizeUser />}
                                <button onClick={handleLogOut}>Sign out</button>
                            </>
            }
        </div>
    )
}

export default Header;