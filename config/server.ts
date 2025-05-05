module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', process.env.PORT || 1337), // Bu kısım önemli!
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('PUBLIC_URL'),
});