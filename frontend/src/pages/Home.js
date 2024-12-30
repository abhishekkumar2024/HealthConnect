import { LandingPage } from "../Components/FirstUI";
import { DoctorCard } from "../utility/DoctorCard";
import { FeatureCard } from "../utility/FeatureCard";
import { NavBar } from "../Components/NavBar";
import {
  Stethoscope,
  Calendar,
  FileText
} from 'lucide-react';

const Home = () => {
    return (
        <main className="flex-grow flex flex-col justify-center">
            < LandingPage />
        </main>
    );
}
export { Home }