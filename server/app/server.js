const { APP_NAME, PORT } = require("./db.config");
const app = require("./app");

app.listen(PORT, () => {
  console.log(`${APP_NAME} is listening on port ${PORT}...`);
});
