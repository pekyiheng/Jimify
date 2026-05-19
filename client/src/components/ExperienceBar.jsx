import { useUser } from '../UserContext';

const ExperienceBar = () => {
    
    const { exp } = useUser();
    const level = Math.floor(Math.pow(exp / 100, 2/3));
    const nextLevel = level + 1;
    const expForNextLevel = Math.pow(nextLevel, 3/2) * 100;
    const expForCurrentLevel = Math.pow(level, 3/2) * 100;
    const diffBtnLevels = expForNextLevel - expForCurrentLevel;
    const progress = exp - expForCurrentLevel;
    const progressPercentage = (progress / diffBtnLevels) * 100;
    
    return (
        <div>
            Level: {level}
            <br/>
            EXP Progress: <progress value={progress} max={diffBtnLevels} /> {Math.floor(progressPercentage)}%
        </div>
    )
}

export default ExperienceBar;