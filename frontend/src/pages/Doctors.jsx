import React, { useState, useEffect } from 'react';
import { doctorService } from '../services/doctor.service.js';
import DoctorCard from '../components/DoctorCard.jsx';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // rating, experience, fee, name
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [specialtyFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (specialtyFilter) {
        params.specialization = specialtyFilter;
      }
      const response = await doctorService.getDoctors(params);
      setDoctors(response.data || []);
    } catch (error) {
      toast.error('Failed to load doctors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors
    .filter((doctor) => {
      const matchesSearch =
        doctor.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = !specialtyFilter || doctor.specialization === specialtyFilter;
      
      return matchesSearch && matchesSpecialty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'fee':
          return (a.consultationFee || 0) - (b.consultationFee || 0);
        case 'name':
          return (a.userId?.name || '').localeCompare(b.userId?.name || '');
        default:
          return 0;
      }
    });

  const specialties = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
            <p className="text-gray-600">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} available
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-secondary flex items-center space-x-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, specialty, or description..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:flex flex-col md:flex-row gap-4`}>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Specialty
              </label>
              <select
                className="input-field"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                <option value="">All Specialties</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="input-field"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Highest Rating</option>
                <option value="experience">Most Experience</option>
                <option value="fee">Lowest Fee</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;

