import Widget from '../components/Widget'
import { Outlet } from 'react-router-dom'

const MainNutritionPage = () => {
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

const NutritionPage = () => {
    return (
        <div>
            <Outlet />
        </div>
    )
}

export {MainNutritionPage, NutritionPage};