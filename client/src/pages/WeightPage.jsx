import { useState, useEffect } from "react";
import axios from "axios";

const WeightPage = () => {
    const [oldWeight, setWeight] = useState([]);

    
    const handleNewWeight = () => {
        const value = prompt("New Entry:");
        
        if (value != null && value.trim() != "" && !isNaN(value)) {

            const time = new Date().toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"});

            setWeight([...oldWeight, {value, time}]);
        }
    }

    const handleDeleteWeight = (index) => {
        const updatedWeights = oldWeight.filter((_, i) => i !== index);
        setWeight(updatedWeights);
    }
    
    function WeightEntry({ weight, time, onDelete }) {
        return (
            <div>
                <h3>{weight} KG</h3>
                <p>{time}</p>
                <button onClick={onDelete}>Delete</button>
            </div>
        );
    }

    return (
        <div className="weightContainer">
            {oldWeight.length > 0 ? (
                <>
                <h1>{oldWeight[oldWeight.length - 1].value} KG</h1>
                <h2>Last Updated: {oldWeight[oldWeight.length - 1].time}</h2>
                </>)
                : <h2>No Entries Yet</h2>
            }
            
            <div>
                <ul className="verticalListOfBoxes">
                    {oldWeight.map((entry, index) => 
                        (<li className="listItemInBox" key={index}><WeightEntry weight={entry.value} time={entry.time} onDelete={() => handleDeleteWeight(index)}/></li>))}
                </ul>
            </div>
            
            <div>
                <button onClick={handleNewWeight}>+ New Entry</button>
            </div>
        </div>
    )
}

export default WeightPage;