const mongoose = require("mongoose");
const { Schema } = mongoose;

const setting = new Schema({
  timeOfScrape: String,
});

const Setting = mongoose.model("Setting", setting);

module.exports = Setting;
