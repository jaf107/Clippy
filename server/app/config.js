const mongoose = require("mongoose");

const APP_NAME = "Boilerplate API";
const ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 8080;

/**
 * Connect to mongoose asynchronously or bail out if it fails
 */
async function connectToDatabase() {
  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://clippy:clippy2023@cluster0.tlrl1sh.mongodb.net/?retryWrites=true&w=majority";

  mongoose.Promise = Promise;
  if (ENV === "development" || ENV === "test") {
    mongoose.set("debug", true);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      autoIndex: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`${APP_NAME} successfully connected to database.`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

/**
 * Configuration middleware to enable cors and set some other allowed headers.
 *  You can also just use the 'cors' package.
 */
function globalResponseHeaders(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization"
  );
  response.header(
    "Access-Control-Allow-Methods",
    "POST,GET,PATCH,DELETE,OPTIONS"
  );
  response.header("Content-Type", "application/json");
  return next();
}

module.exports = {
  APP_NAME,
  ENV,
  PORT,
  connectToDatabase,
  globalResponseHeaders,
};
