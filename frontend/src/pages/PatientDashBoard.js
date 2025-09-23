import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Users, Clock, Stethoscope, User } from 'lucide-react';
import { NavBar } from '../Components/NavBar';
import { useDarkMode } from '../contextAPI/contextApi';
import { PatientDashboardAPI } from '../api/auth.api';
import { useParams } from 'react-router-dom';
import { Footer } from '../Components/Footer';
import { DoctorCard } from '../Components/DoctorCard';
import { DoctorFilterTabs } from './DoctorFilterTabs';

const PatientDashboard = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [hoveredSpecialtyId, setHoveredSpecialtyId] = useState(null);
    const { themeStyles } = useDarkMode();
    const [patientData, setPatientData] = useState(null);
    const { id } = useParams();

    const fetchPatientData = useCallback(async () => {
        try {
            const response = await PatientDashboardAPI(id);
            setPatientData(response.data);
        } catch (error) {
            console.error("Error fetching patient data:", error);
        }
    }, [id]);

    useEffect(() => {
        fetchPatientData();
    }, [fetchPatientData]);

    const specialties = [
        {
            id: 1,
            title: "Cardiologist",
            icon: "❤️",
            shortDesc: "Heart and blood vessel specialist",
            stats: {
                patients: "1000+",
                experience: "8+ years",
                procedures: "50+ types"
            },
            color: "from-red-500 to-pink-500",
            image: "/api/placeholder/400/300"
        },
        {
            id: 2,
            title: "Neurologist",
            icon: "🧠",
            shortDesc: "Brain and nervous system specialist",
            stats: {
                patients: "800+",
                experience: "10+ years",
                procedures: "40+ types"
            },
            color: "from-blue-500 to-purple-500",
            image: "/api/placeholder/400/300"
        },
        {
            id: 3,
            title: "Dermatologist",
            icon: "🔬",
            shortDesc: "Skin, hair, and nail specialist",
            stats: {
                patients: "1200+",
                experience: "6+ years",
                procedures: "30+ types"
            },
            color: "from-green-500 to-teal-500",
            image: "/api/placeholder/400/300"
        },
        {
            id: 4,
            title: "Orthopedist",
            icon: "🦴",
            shortDesc: "Bone and joint specialist",
            stats: {
                patients: "900+",
                experience: "12+ years",
                procedures: "45+ types"
            },
            color: "from-yellow-500 to-orange-500",
            image: "/api/placeholder/400/300"
        },
        {
            id: 5,
            title: "Pediatrician",
            icon: "👶",
            shortDesc: "Children's health specialist",
            stats: {
                patients: "1500+",
                experience: "9+ years",
                procedures: "35+ types"
            },
            color: "from-indigo-500 to-blue-500",
            image: "/api/placeholder/400/300"
        }
    ];

    const nextSlide = () => {
        setActiveSlide((prev) =>
            prev === specialties.length - 3 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setActiveSlide((prev) =>
            prev === 0 ? specialties.length - 3 : prev - 1
        );
    };

    const specialtyElements = specialties.map((specialty) => (
        <div
            key={specialty.id}
            className="min-w-[33.333%] px-4"
            onMouseEnter={() => setHoveredSpecialtyId(specialty.id)}
            onMouseLeave={() => setHoveredSpecialtyId(null)}
        >
            <div
                className={`relative overflow-hidden rounded-2xl shadow-xl transform transition-all duration-300 ${themeStyles.featureCard} ${hoveredSpecialtyId === specialty.id ? 'scale-105' : 'scale-100'}`}
            >
                {/* Card Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${specialty.color} opacity-90`} />

                {/* Card Content */}
                <div className="relative p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-4xl">{specialty.icon}</span>
                        <div className="text-right">
                            <h3 className="text-2xl font-bold mb-2">{specialty.title}</h3>
                            <p className={`${themeStyles.subtext}`}>{specialty.shortDesc}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="text-center">
                            <Users className={`h-6 w-6 mx-auto mb-2 ${themeStyles.iconColor}`} />
                            <p className="font-semibold">{specialty.stats.patients}</p>
                            <p className={`text-sm ${themeStyles.subtext}`}>Patients</p>
                        </div>
                        <div className="text-center">
                            <Clock className={`h-6 w-6 mx-auto mb-2 ${themeStyles.iconColor}`} />
                            <p className="font-semibold">{specialty.stats.experience}</p>
                            <p className={`text-sm ${themeStyles.subtext}`}>Experience</p>
                        </div>
                        <div className="text-center">
                            <Stethoscope className={`h-6 w-6 mx-auto mb-2 ${themeStyles.iconColor}`} />
                            <p className="font-semibold">{specialty.stats.procedures}</p>
                            <p className={`text-sm ${themeStyles.subtext}`}>Procedures</p>
                        </div>
                    </div>

                    {/* Learn More Button */}
                    <button
                        className={`mt-8 w-full py-3 px-6 rounded-lg transition-all duration-300 ${themeStyles.buttonBg} ${themeStyles.buttonHoverBg} ${themeStyles.text}`}
                    >
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    ));

    return (
        <>
            <NavBar />
            <div className={`min-h-screen py-12 px-4 ${themeStyles.background} ${themeStyles.text}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold">Explore Medical Specialties</h1>
                    </div>

                    {/* Carousel Container */}
                    <div className="relative flex flex-wrap">
                        {/* Navigation Buttons */}
                        <button
                            onClick={prevSlide}
                            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-3 rounded-full shadow-lg transition-all ${themeStyles.cardBg}`}
                        >
                            <ChevronLeft className={`h-6 w-6 ${themeStyles.iconColor}`} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-3 rounded-full shadow-lg transition-all ${themeStyles.cardBg}`}
                        >
                            <ChevronRight className={`h-6 w-6 ${themeStyles.iconColor}`} />
                        </button>

                        {/* Cards Container */}
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-out"
                                style={{ transform: `translateX(-${activeSlide * (100 / 3)}%)` }}
                            >
                                {specialtyElements}
                            </div>
                        </div>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center mt-8 gap-2">
                        {Array.from({ length: specialties.length - 2 }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveSlide(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-8 bg-blue-500' : 'w-2 bg-gray-300'}`}
                            />
                        ))}
                    </div>
                    < DoctorFilterTabs />
                </div>
            </div>
            <Footer />
        </>
    );
};

export { PatientDashboard };
