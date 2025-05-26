import Widget from '../components/Widget'
import { Outlet } from 'react-router-dom'

const NutritionPage = () => {
    return (
        <>
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