import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';

const CaloriesWidget = ({totalCalories, dailyCaloriesGoal}) => {
    var percentage = 0;
    if (dailyCaloriesGoal) {
        percentage = Math.round(totalCalories / dailyCaloriesGoal * 100);
    }
    const circleStyles = buildStyles({
        rotation: 0,
        strokeLinecap: 'round',
        pathTransition: 'none',

        pathColor: `rgba(62, 152, 199, 1)`,
        trailColor: '#d6d6d6',
        backgroundColor: '#3e98c7',
      });

    return (
        <div className='caloriesWidget'>
            <h2>Calories</h2>
            <div className='caloriesWidgetBar'>
                <CircularProgressbarWithChildren value={percentage} styles={circleStyles}>
                    <div>
                        <h3>
                            {percentage}%
                        </h3>
                    </div>
                </CircularProgressbarWithChildren>
            </div>
        </div>
     );
};

export default CaloriesWidget;