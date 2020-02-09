require('dotenv').config()
module.exports = {
  env: {
    FOURSQUARE_CLIENT_ID: process.env.FOURSQUARE_CLIENT_ID,
    FOURSQUARE_CLIENT_SECRET: process.env.FOURSQUARE_CLIENT_SECRET,
  },
}