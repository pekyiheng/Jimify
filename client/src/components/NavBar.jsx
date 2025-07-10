import { Link } from "react-router-dom";

const NavBar = () => {
    return (
        <div className="navbar">
            <Link to="/">Nutrition</Link>
            <span className="divider"></span>
            <Link to="trainingPage">Training</Link>
            <span className="divider"></span>
            <Link to="friendsPage">Friends</Link>
            <span className="divider"></span>
            <Link to="myProfilePage">My Profile</Link>
        </div>
    )
}

export default NavBar;