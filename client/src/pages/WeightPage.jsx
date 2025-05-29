import { useState, useEffect } from "react";
import axios from "axios";

const WeightPage = () => {
    const [weight, setWeight] = useState("XX");
    const [lastUpdated, setLastUpdated] = useState("XX");
    const [oldEntries, setEntries] = useState([]);

    const fetchAPI = async () => {
        const response = await axios.get("http://localhost:8080/");
        setWeight(response.data.weight);
    };

    useEffect(() => {
        fetchAPI();
    }, []);
    
    const handlePrompt = () => {
        const value = prompt("New Entry:");
        setWeight(value);
        
        const today = new Date().toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"});
        setLastUpdated(today);

        const newEntry = value + "KG, " + today;
        setEntries([...oldEntries, newEntry]);
    }

    return (
        <div className="weightContainer">
            <h1>{weight} KG</h1>
            <h2>Last Updated: {lastUpdated}</h2>
            <div>
                <ul>
                    {oldEntries.map(entry => (<li>{entry}</li>))}
                </ul>
            </div>
            
            <div>
                <button onClick={handlePrompt}>+ New Entry</button>
            </div>
        </div>
    )
}

export default WeightPage;