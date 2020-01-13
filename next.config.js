require('dotenv').config()
module.exports = {
  env: {
    // Reference a variable that was defined in the .env file and make it available at Build Time
    FOURSQUARE_CLIENT_ID: process.env.FOURSQUARE_CLIENT_ID,
    FOURSQUARE_CLIENT_SECRET: process.env.FOURSQUARE_CLIENT_SECRET,
  },
}