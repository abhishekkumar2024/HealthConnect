import { NavBar} from "./Components/NavBar"; 
import { FirstUI } from "./Components/FirstUI";
function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-600 border-solid border-blue-950 border-4 text-white">
        <NavBar />
        <main className="flex-grow">
          <FirstUI />
        </main>
    </div>
  );
}

export default App;
