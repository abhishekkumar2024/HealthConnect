import { NavBar} from "./Components/NavBar"; 
import { FirstUI } from "./Components/FirstUI";
import { DoctorCard } from "./utility/DoctorCard";
function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-600 border-solid border-blue-950 border-4 text-white">
        <NavBar />
        <main className="flex-grow mx-16">
          <FirstUI />
          <h1 className="justify-center items-center ml-4 mt-36 text-3xl font-bold font-sans">Doctor list</h1>
          <div className="flex-row flex-wrap flex px-3 py-4 gap-4">
            <DoctorCard/>
            <DoctorCard/>
            <DoctorCard/>
            <DoctorCard/>
            <DoctorCard/>
            <DoctorCard/>
            <DoctorCard/>
            <DoctorCard/>
          </div>
        </main>
    </div>
  );
}

export default App;
