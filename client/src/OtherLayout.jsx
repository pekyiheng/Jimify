import './App.css'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'

function OtherLayout() {

    return (
      <div className='app'>
        <Header />
        <Outlet />
      </div>
    )
  }
  
export default OtherLayout;