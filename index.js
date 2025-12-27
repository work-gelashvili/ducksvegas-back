const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const device = require("express-device");

const api = require("./api/api");

const PORT = process.env.PORT || 5001;

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(device.capture());

// ===== API Routes =====
app.use("/", api.getUserBalance);
app.use("/", api.getBalance);
app.use("/", api.depositMoney);
app.use("/", api.withdrawMoney);
app.use("/", api.rollback);
app.use("/", api.createUser);
app.use("/", api.auth);
app.use("/", api.createNewUser);
// app.use("/", api.changePassword);
// app.use("/", api.generateNewPassword);
// app.use("/", api.updateProfileInfo);
// app.use("/", api.gamesList);
// app.use("/", api.openGame);
app.use("/", api.getUserData);
// app.use("/", api.generateWalletAddress);
// app.use("/", api.notifications);
app.use("/", api.requireWithdrawal);
// app.use("/", api.notificationsPayout);
// app.use("/", api.getNotifications);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
