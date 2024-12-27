import { FirstUI } from "../Components/FirstUI";
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
        <main className="flex-grow mx-16 flex flex-col justify-center">
            <NavBar />
            <FirstUI />
            <h1 className="justify-center items-center text-start ml-4 mt-36 text-3xl font-bold font-sans">Doctor list</h1>
            <div className="flex-row flex-wrap flex px-3 py-4 gap-4">
                <DoctorCard />
                <DoctorCard />
                <DoctorCard />
                <DoctorCard />
            </div>
            <h1 className="mt-6 mx-6 text-slate-300 text-2xl flex justify-center items-center" >In Just Single Click, Get Best<span className="text-blue-400 text-3xl mx-2">Experience!</span></h1>
            <div className="flex flex-wrap mt-4 bg-blue-400 rounded-lg justify-center gap-3 px-3 py-11 space-x-7">
                <FeatureCard
                    icon={Calendar}
                    title="Easy Appointments"
                    description="Book and manage appointments seamlessly"
                    ArrowRight="ArrowRight"
                />
                <FeatureCard
                    icon={FileText}
                    title="Medical Records"
                    description="Securely store and access your health history"
                    ArrowRight="ArrowRight"
                />
                <FeatureCard
                    icon={Stethoscope}
                    title="Expert Consultation"
                    description="Connect with top healthcare professionals"
                    ArrowRight="ArrowRight"
                />
            </div>
        </main>
    );
}
export { Home }