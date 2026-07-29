import Redis from "ioredis";

let redisClient = null;
let isRedisConnected = false;

try {
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) {
        return null; 
      }
      return Math.min(times * 100, 2000);
    },
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    console.log("Redis connected successfully");
  });

  redisClient.on("error", (err) => {
    isRedisConnected = false;
    console.warn("Redis connection warning (falling back to direct DB):", err.message);
  });
} catch (error) {
  console.warn("Redis initialization failed, operating in fallback mode:", error.message);
}


export const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis getCache error for key ${key}:`, error.message);
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds = 3600) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, "EX", ttlSeconds);
    return true;
  } catch (error) {
    console.error(`Redis setCache error for key ${key}:`, error.message);
    return false;
  }
};


export const deleteCache = async (key) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(`Redis deleteCache error for key ${key}:`, error.message);
    return false;
  }
};


export const deleteCachePattern = async (pattern) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys && keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (error) {
    console.error(`Redis deleteCachePattern error for pattern ${pattern}:`, error.message);
    return false;
  }
};

export default redisClient;
