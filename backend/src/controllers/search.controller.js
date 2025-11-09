import mongoose from 'mongoose';
import Doctor from '../models/doctor.model.js';

// Utility function to escape special regex characters in search text
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export const searchController = async (req, res) => {
  try {
    const { name, city, specialization, page, limit } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

    // Build regex conditions for city and specialization only (skip name filtering here)
    const matchQuery = {};
    if (city) {
      matchQuery['userInfo.address.city'] = { $regex: escapeRegex(city), $options: 'i' };
    }
    if(name){
        matchQuery['userInfo.name'] = { $regex: escapeRegex(name), $options: 'i' };
    }
    if (specialization) {
      matchQuery.specialization = { $regex: escapeRegex(specialization), $options: 'i' };
    }

    // Aggregation pipeline with $lookup and $match for city/specialization
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $match: Object.keys(matchQuery).length ? matchQuery : {},
      },
      {
        $project: {
          _id: 1,
          specialization: 1,
          experience: 1,
          fees: 1,
          'userInfo._id': 1,
          'userInfo.name': 1,
          'userInfo.email': 1,
          'userInfo.address.city': 1,
          'userInfo.phone': 1,
        },
      },
    ];

    // Apply pagination limits here to reduce data volume for fuzzy filtering
    pipeline.push({ $skip: (pageNum - 1) * limitNum}); // Fetch extra for fuzzy filtering
    pipeline.push({ $limit: limitNum});

    const docs = await Doctor.aggregate(pipeline);

    // Fuzzy filtering logic
    const filteredResults = docs.filter((doc) => {
      const nameMatch = name ? doc.userInfo.name.toLowerCase().includes(name.toLowerCase()) : true;
      const cityMatch = city ? doc.userInfo.address.city.toLowerCase().includes(city.toLowerCase()) : true;
      const specializationMatch = specialization ? doc.specialization.toLowerCase().includes(specialization.toLowerCase()) : true;
      return nameMatch && cityMatch && specializationMatch;
    });
  
    // Pagination on fuzzy filtered results
    const paginatedResults = filteredResults.slice(0, limitNum);

    return res.status(200).json({ data: paginatedResults, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
