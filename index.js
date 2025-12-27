const path = require("path");
const express = require("express");
const api = require("./api/api");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { dirname } = require("path");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const device = require("express-device");

const PORT = process.env.PORT || 5001;

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(jsonParser);
app.use(urlencodedParser);
app.use(device.capture());

app.use(express.static(path.resolve(__dirname, "client/build")));
app.use("/", api.getUserBalance);
app.use("/", api.getBalance);
app.use("/", api.depositMoney);
app.use("/", api.withdrawMoney);
app.use("/", api.rollback);
app.use("/", api.createUser);
app.use("/", api.auth);
app.use("/", api.createNewUser);
app.use("/", api.changePassword);
app.use("/", api.generateNewPassword);
app.use("/", api.updateProfileInfo);
app.use("/", api.gamesList);
app.use("/", api.openGame);
app.use("/", api.getUserData);
app.use("/", api.generateWalletAddress);
app.use("/", api.notifications);
app.use("/", api.requireWithdrawal);
app.use("/", api.notificationsPayout);
app.use("/", api.getNotifications);
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// All other GET requests not handled before will return our React app
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
// })

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
