// npm packages
const dotenv = require("dotenv");
const express = require("express");
const cookieSession = require("cookie-session");
const cloudinary = require("cloudinary");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

// app imports
const { connectToDatabase, globalResponseHeaders } = require("./db.config");
const { errorHandler } = require("./controllers");
const {
  thingsRouter,
  authRouter,
  userRouter,
  paperRouter,
} = require("./routes");

// global constants
dotenv.config();
const app = express();
const {
  bodyParserHandler,
  globalErrorHandler,
  fourOhFourHandler,
  fourOhFiveHandler,
} = errorHandler;

// database
connectToDatabase();

// body parser setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ type: "*/*" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// response headers setup; CORS
app.use(globalResponseHeaders);

app.use(
  cookieSession({
    name: "clippy-session",
    secret: "COOKIE_SECRET", // should use as secret environment variable
    httpOnly: true,
  })
);

//Cloudinary Config
cloudinary.config({
  cloud_name: "dpf3hdncd",
  api_key: "397994995141357",
  api_secret: "1-IKBhBI4GlM2iwKJ0TQ5N5fa90",
});

app.use("/things", thingsRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/paper", paperRouter);

// catch-all for 404 "Not Found" errors
app.get("*", fourOhFourHandler);
// catch-all for 405 "Method Not Allowed" errors
app.all("*", fourOhFiveHandler);

app.use(globalErrorHandler);

/**
 * This file does NOT run the app. It merely builds and configures it then exports it.config
 *  This is for integration tests with supertest (see __tests__).
 */
module.exports = app;
