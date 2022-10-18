const { Schema, model } = require('mongoose');


module.exports = model("User", new Schema({
  vkId: Number,
  infected: new Schema({
    id: Number,
    firstName: String
  }),
  infectedCount: Number,
  deathTime: Number,
  intro: Boolean,
  rewarded: Boolean,
  timeStamp: Number,
  rewardedTime: Number,
  tablets: Number,
  repost: Boolean,
  repostWall: Boolean,
  date: Number,
  dead: Boolean,
  viewed: Boolean
}));