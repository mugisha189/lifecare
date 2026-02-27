export default () => {
  // Helper function to safely parse integers with fallback
  const parseIntSafe = (value: string | undefined, defaultValue: number): number => {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Helper function to get string with fallback
  const getString = (value: string | undefined, defaultValue: string): string => {
    return value || defaultValue;
  };

  return {
    port: parseIntSafe(process.env.PORT, 3000),
    host: getString(process.env.HOST, 'localhost'),
    nodeEnv: getString(process.env.NODE_ENV, 'development'),
    corsOrigin: getString(process.env.CORS_ORIGIN, '*'),
    database: {
      url: process.env.DATABASE_URL,
    },
    redis: {
      host: getString(process.env.REDIS_HOST, 'localhost'),
      port: parseIntSafe(process.env.REDIS_PORT, 6379),
      password: process.env.REDIS_PASSWORD,
      ttl: parseIntSafe(process.env.REDIS_TTL, 3600),
    },
    jwt: {
      secret: getString(process.env.JWT_SECRET, 'change-this-secret-in-production-very-important'),
      refreshSecret: getString(
        process.env.JWT_REFRESH_SECRET,
        'change-this-refresh-secret-in-production-very-important'
      ),
      expiresIn: getString(process.env.JWT_EXPIRES_IN, '1h'),
      refreshExpiresIn: getString(process.env.JWT_REFRESH_EXPIRES_IN, '7d'),
    },
    mail: {
      host: getString(process.env.MAIL_HOST, 'smtp.gmail.com'),
      port: parseIntSafe(process.env.MAIL_PORT, 587),
      secure: process.env.MAIL_SECURE === 'true',
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASSWORD,
      from: getString(process.env.MAIL_FROM, `"LifeCare" <${process.env.MAIL_USER}>`),
    },
    sms: {
      pindoApiKey: process.env.PINDO_API_KEY,
      pindoApiUrl: getString(process.env.PINDO_API_URL, 'https://api.pindo.io/v1/sms'),
    },
    client: {
      url: getString(process.env.CLIENT_URL, 'http://localhost:3000'),
    },
    onesignal: {
      appId: process.env.ONESIGNAL_APP_ID,
      apiKey: process.env.ONESIGNAL_API_KEY,
    },
  };
};
