import mongoose from 'mongoose';

export const connectMongoPatterns = async () => mongoose.connect("mongodb://localhost:27017/patterns", {family: 4}) 