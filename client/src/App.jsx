import './App.css'
import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'
import Header from './components/Header'

function App() {

  return (
    <div className='app'>
      <Header />
      <Outlet />
      <NavBar />
    </div>
  )
}

export default App
