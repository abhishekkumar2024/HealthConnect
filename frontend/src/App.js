import { NavBar } from "./Components/NavBar";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  Navigate 
} from 'react-router-dom';
import { Home } from "./pages.js/Home";
import { Login } from "./pages.js/Login"
import { Register } from "./pages.js/Register";

function App() {
  return (
    <Router>
        <div className="min-h-screen flex flex-col bg-gray-600 border-solid border-blue-950 border-4 text-white">
          <NavBar />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          </Routes>
        </div>
    </Router>
  );
}

export default App;
