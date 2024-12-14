import { NavBar } from "./Components/NavBar";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  Navigate 
} from 'react-router-dom';
import { Home } from "./pages/Home";
import { Login } from "./pages/Login"
import { Register } from "./pages/Register";

function App() {
  return (
    <Router>
        <div className="min-h-screen flex flex-col bg-gray-600 border-solid border-blue-950 border-4 text-white">
          <div className="bg-blue-300">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />}/>
            <Route path="/Register" element={<Register />} />
            </Routes>
          </div>
        </div>
    </Router>
  );
}

export default App;
