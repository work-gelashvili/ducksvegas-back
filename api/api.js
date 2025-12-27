const getBalance = require("./users/getBalance");
const depositMoney = require("./users/depositMoney");
const withdrawMoney = require("./users/WithdrawMoney");
const rollback = require("./users/rollback");
const createUser = require("./users/createUser");
const createNewUser = require("./usersMethods/createNewUser");
const auth = require("./usersMethods/auth");
const changePassword = require("./usersMethods/changePassword");
const generateNewPassword = require("./usersMethods/generateNewPassword");
const updateProfileInfo = require("./usersMethods/updateProfileInfo");
const gamesList = require("./games/gamesList");
const openGame = require("./games/openGame");
const getUserBalance = require("./users/getUserbalance");
const getUserData = require("./usersMethods/getUserData");
const generateWalletAddress = require("./wallet/generateWAlletAddress");
const notifications = require("./wallet/notifications");
const requireWithdrawal = require("./wallet/requireWithdraw");
const notificationsPayout = require("./wallet/withdrawNotification");
const getNotifications = require("./wallet/getNotification");

const api = {
  getBalance,
  depositMoney,
  withdrawMoney,
  rollback,
  createUser,
  createNewUser,
  auth,
  changePassword,
  generateNewPassword,
  updateProfileInfo,
  gamesList,
  openGame,
  getUserBalance,
  getUserData,
  generateWalletAddress,
  notifications,
  requireWithdrawal,
  notificationsPayout,
  getNotifications,
};

module.exports = api;
