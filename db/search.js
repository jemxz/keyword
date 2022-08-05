const Posts = require("../model/posts-model");

    async function getCollection() {
        const collection =  await Posts.find()
        return collection;
    }
    
    async function searchItem(searchItem) {
        const result = await getCollection()
        const items = []
            result.map(e1 => {
                const str1 = e1.postContent.toLowerCase()
                const str2 = searchItem.toLowerCase()
               // console.log(str2);
                if(str1.includes(str2)){
                    var temp = {
                        _id: e1._id,
                        poster: e1.poster,
                        postLink: e1.postId,
                        postContent: e1.postContent,
                        numberOfLikes: e1.numberOfLikes,
                        numberOfShares: e1.numberOfShares,
                        timeOfPost: e1.timeOfPost,
                        date:e1.date 
                    }
                    items.push(temp)
                }
            })
        return items
    }
    



module.exports = searchItem