function formatDateToYYYYMMDD(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error("Invalid Date object provided.");
    }
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}

function formatDateToDDMMYYYY(date) {
 if (!(date instanceof Date) || isNaN(date)) {
 throw new Error("Invalid Date object provided.");
 }

 const year = date.getFullYear();
 const month = String(date.getMonth() + 1).padStart(2, '0');
 const day = String(date.getDate()).padStart(2, '0');

 return `${day}-${month}-${year}`;
}

function calculateBMR(gender, weight, height, age, activityFactor) {

  var genderFactor = 0;
  if (gender == 'M') {
       genderFactor = 5;
  } else {
      genderFactor = -161;
  }
  return (10 * weight + 6.25 * height - 5 * age + genderFactor) * activityFactor;
}

function getGoal(goal) {
  switch (goal) {
      case 'gain fast':
          return 500;
      case 'gain slow':
          return 200;
      case 'lose slow':
          return (-200);
      case 'lose fast':
          return (-500);
      default:
          return 0; //maintain
  }
}

function getActivityLevel(activity) {
  switch (activity) {
      case 'light':
          return (1.375);
      case 'moderate':
          return(1.55);
      case 'active':
          return (1.725);
      case 'very active':
          return(1.9);
      default:
          return (1.2); //sedentary
  }
}

function extractCalories(nutritionFactsString) {
  const regex = /Calories: (\d+)kcal/;
  const match = nutritionFactsString.match(regex);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

export { formatDateToYYYYMMDD, formatDateToDDMMYYYY, calculateBMR, getGoal, getActivityLevel, extractCalories };