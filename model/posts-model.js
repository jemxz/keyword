const mongoose = require('mongoose')
const {Schema } = mongoose

const posts = new Schema({
            poster: String,
            postId: String,
            postContent: String,
            numberOfComments: String,
            numberOfShares: String,
            timeOfPost: String,
            postImg:String,
            postSentiment: Object,
            date: String

})

const Posts = mongoose.model('Posts', posts)

module.exports = Posts