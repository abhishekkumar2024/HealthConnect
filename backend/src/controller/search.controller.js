import User from "../models/user.model.js"
import { ApiResponse } from "../utilities/ApiResponse.js";
// ust path to your User model

/**
 * Search users with both full-text and partial (regex) support.
 * Also works for suggestions/autocomplete.
 *
 * @param {String} query - The search term
 * @param {Number} limit - Max number of results (default: 10)
 * @returns {Array} users
 */
export const searchUsers = async (req, res) => {

    const { searchText, location, Specilization, pg, pgS } = req.query
    const page = parseInt(pg) || 1;
    const pageSize = parseInt(pgS) || 10;
    const skip = (page - 1) * pageSize;

    try {
        const skip = (page - 1) * pageSize;
        
        // Build query conditions
        const conditions = [];
        
        // Name search condition
        if (searchText) {
            conditions.push({
                $or: [
                    { "name.firstName": { $regex: searchText, $options: "i" } },
                    { "name.lastName": { $regex: searchText, $options: "i" } }
                ]
            });
        }
        
        // Location search condition
        if (location) {
            conditions.push({
                $or: [
                    { "address.city": { $regex: location, $options: "i" } },
                    { "address.state": { $regex: location, $options: "i" } },
                    { "address.country": { $regex: location, $options: "i" } },
                    { "address.pincode": { $regex: location, $options: "i" } }
                ]
            });
        }
        
        // Specialization condition
        if (Specilization) {
            conditions.push({
                Specialization: { $regex: Specilization, $options: "i" }
            });
        }
        
        const query = conditions.length > 0 ? { $and: conditions } : {};
        const users = await User.find(query).select('-password -accessToken -refreshToken -isDeleted -isBlocked -isVerified -otp')
            .skip(skip)
            .limit(pageSize)
            .lean();
        
        return res.status(200).json(new ApiResponse(200, users, "Search results fetched successfully."));
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
};

export const searchSuggestions = async (req, res) => {
    const { query, limit } = req.query
    if (!query || query.trim() === "") {
        return [];
    }
    const users = await User.find(
        {
            $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { phone: { $regex: query, $options: "i" } }
            ]
        },
        { name: 1, email: 1, phone: 1, role: 1 }
    ).limit(limit);
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                `Fetched Document with suggestions successfully.`
            )
        )
};

// export {searchUsers}