import mongoose from 'mongoose';

const MONGO_URL = "mongodb://localhost:27017/patterns";

// One shared connection per server process. Cached on globalThis so dev hot
// reloads reuse it instead of piling up new connections. Routes must not call
// connection.close() — that would kill the connection under concurrent requests.
type MongoCache = { promise: Promise<typeof mongoose> | null }
const globalForMongo = globalThis as unknown as { _patternsMongo?: MongoCache }
const cache: MongoCache = globalForMongo._patternsMongo ??= { promise: null }

export const connectMongoPatterns = async () => {
    if (!cache.promise) {
        cache.promise = mongoose.connect(MONGO_URL, { family: 4 }).catch((err) => {
            // Let the next request retry instead of caching the failure
            cache.promise = null
            throw err
        })
    }
    return cache.promise
}
