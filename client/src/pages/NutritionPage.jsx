import Widget from '../components/Widget'
import { useState, useEffect, useRef } from 'react';
import CustomizeUser from '../components/CustomizeUser';


const NutritionPage = () => {


    return (
        <>
          <CustomizeUser />
          <div>
          <Widget content="calories" />
          </div>
          <div>
          <Widget content="weight" />
          </div>

        </>
      )
}

export default NutritionPage;