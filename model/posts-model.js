const mongoose = require('mongoose')
const {Schema } = mongoose

const posts = new Schema({
            poster: String,
            postId: String,
            postContent: String,
            numberOfLikes: String,
            numberOfShares: String,
            timeOfPost: String,
            postSentiment: String,
            date: String

})

const Posts = mongoose.model('Posts', posts)

module.exports = Posts