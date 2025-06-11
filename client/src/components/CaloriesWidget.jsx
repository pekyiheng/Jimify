import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';

const CaloriesWidget = ({totalCalories, dailyCaloriesGoal}) => {
    console.log(totalCalories / dailyCaloriesGoal);
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
        <div style={{ width: 200, height: 200, justifyContent: 'space-around'  }}>
            <h2>Calories</h2>
            <div style={{ height: 120, paddingLeft: '30px', paddingRight: '30px' }}>
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