const scrollToBottom = require("../middlewares/auto-scroll");
const Posts = require("../model/posts-model");
const mongoose = require("mongoose");
var Sentiment = require("sentiment");
const {
  selector_postLinks,
  selector_date,
  selector_noOfComments,
  selector_noOfShares,
  selector_post,
  selector_img,
  selector_name,
} = require("../config/html-selectors");

var sentiment = new Sentiment();
mongoose
  .connect("mongodb://localhost/facebook-data", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB ..."))
  .catch((err) => console.log(err.message));

module.exports = async function createGroups(ids, page) {
  var date = new Date().toLocaleString();
  const result = [];

  // NAVIGATION AND SCROLING TO THE DESIRED PAGE //
  try {
    await page.goto("https://m.facebook.com/search/posts/?q=" + ids);
    console.log("search succesfull");
    await page.waitForTimeout(1000);
    await scrollToBottom(page);
    console.log("scrolling success");
  } catch (error) {
    return console.log(error.message);
  }

  // Scraping for all post Links on a given page //
  try {
    let list_length = await page.evaluate((sel) => {
      let elements = Array.from(document.querySelectorAll(sel));
      return elements.length;
    }, selector_postLinks);
    console.log(list_length);
    let count = 0;
    for (let i = 0; i < list_length; i++) {
      /// post link scraper
      var postLink = await page.evaluate(
        (l, sel) => {
          let elements = Array.from(document.querySelectorAll(sel));
          let anchor = elements[l].getElementsByTagName("a")[0];
          if (anchor) {
            return anchor.href;
          } else {
            return "empty";
          }
        },
        i,
        selector_postLinks
      );
      /// post date scraper
      var postDate = await page.evaluate(
        (l, sel) => {
          let elements = Array.from(document.querySelectorAll(sel));
          let anchor = elements[l];
          if (anchor) {
            return anchor.innerText;
          } else {
            return "empty";
          }
        },
        i,
        selector_date
      );
      console.log(postDate);
      /// number of comment scraper
      var numOfComments = await page.evaluate(
        (l, sel) => {
          let elements = Array.from(document.querySelectorAll(sel));
          let anchor = elements[l];
          if (anchor) {
            return anchor.innerText;
          } else {
            return "empty";
          }
        },
        count,
        selector_noOfComments
      );
      console.log(numOfComments);
      /// number of shares scraper
      var numOfShares = await page.evaluate(
        (l, sel) => {
          let elements = Array.from(document.querySelectorAll(sel));
          let anchor = elements[l + 1];
          if (anchor) {
            return anchor.innerText;
          } else {
            return "empty";
          }
        },
        count,
        selector_noOfShares
      );
      console.log(numOfShares);
      ////  posts scraper
      var post = await page.evaluate(
        (l, sel) => {
          let elements = Array.from(document.querySelectorAll(sel));
          let anchor = elements[l];
          if (anchor) {
            return anchor.innerText;
          } else {
            return "empty";
          }
        },
        i,
        selector_post
      );
      console.log(post);
      /// post img scraper
      var postImg = await page.evaluate(
        (l, sel) => {
          let elements = Array.from(document.querySelectorAll(sel));
          let anchor = elements[l].getElementsByTagName("a")[0];
          if (anchor) {
            return anchor.href;
          } else {
            return "empty";
          }
        },
        i,
        selector_img
      );
      console.log(postImg);
      /// poster name scraper
      var posterName = await page.evaluate(
        (l, sel) => {
          let elements = Array.from(document.querySelectorAll(sel));
          let anchor = elements[l];
          if (anchor) {
            return anchor.innerText;
          } else {
            return "empty";
          }
        },
        i,
        selector_name
      );

      var sent = sentiment.analyze(post);
      const singlePost = {
        poster: posterName,
        postId: postLink,
        postContent: post,
        numberOfComments: numOfComments,
        numberOfShares: numOfShares,
        timeOfPost: postDate,
        postImg: postImg,
        postSentiment: sent,
        date: date,
      };
      result.push(singlePost);
      const posts = new Posts(singlePost);
      await posts.save();
      count = count + 2;
    }
  } catch (error) {
    console.log(error.message);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // for (let i = 0; i < postLinks.length; i++) {

  //     const commentContents = []
  //     const ids = []
  //     const names = []
  //     const comments = []

  //     try {
  //         await page.goto(postLinks[i]);
  //         await page.waitForTimeout(1000)
  //         // console.log("navigation succesfull");

  //     } catch (error) {
  //         return console.log(error.message);
  //     }

  // // Scraping for post content of a given post using postIds //
  //     try {
  //         let post_selector= "._5rgt";
  //         let post_length = await page.evaluate((sel) => {
  //             let elements = Array.from(document.querySelectorAll(sel));
  //             return elements.length;
  //         }, post_selector);
  //         for(let i=0; i< post_length; i++){
  //             var postContent = await page.evaluate((l, sel) => {
  //                         let elements= Array.from(document.querySelectorAll(sel))
  //                         let anchor  = elements[l]
  //                         if(anchor){
  //                             return anchor.innerText;
  //                         }else{
  //                             return 'empty';
  //                         }
  //                     }, i, post_selector);
  //         }
  //         // console.log(commentContents);
  //         // return comments

  //         } catch (error) {
  //             return console.log(error.message)
  //         }

  // // Scraping for comments of a given post using postIds   //
  //     try {
  //         let post_selector= "._2b06";
  //         let post_length = await page.evaluate((sel) => {
  //             let elements = Array.from(document.querySelectorAll(sel));
  //             return elements.length;
  //         }, post_selector);
  //         for(let i=0; i< post_length; i++){
  //             var postComment = await page.evaluate((l, sel) => {
  //                         let elements= Array.from(document.querySelectorAll(sel))
  //                         let anchor  = elements[l]
  //                         if(anchor){
  //                             return anchor.innerText;
  //                         }else{
  //                             return 'empty';
  //                         }
  //                     }, i, post_selector);
  //                 commentContents.push(postComment)

  //         }
  //         // console.log(commentContents);
  //         // return comments

  //         } catch (error) {
  //             return console.log(error.message)
  //         }

  // // Scraping for post commentor ids(Profile) of a given post using postIds //
  //     try {
  //         let selector= "._2b05";
  //         let post_length = await page.evaluate((sel) => {
  //             let elements = Array.from(document.querySelectorAll(sel));
  //             return elements.length;
  //         }, selector);
  //         for(let i=0; i< post_length; i++){
  //             var id = await page.evaluate((l, sel) => {
  //                 let elements= Array.from(document.querySelectorAll(sel))
  //                 let anchor  = elements[l].getElementsByTagName('a')[0];
  //                 if(anchor){
  //                     return anchor.href;
  //                 }else{
  //                     return 'empty';
  //                 }
  //                     }, i, selector);
  //                 ids.push(id)

  //         }
  //         // console.log(ids);
  //         // return ids

  //         } catch (error) {
  //             return console.log(error.message)
  //         }

  // // Scraping for post commentor names of a given post using postIds //
  //     try {
  //         let selector= "._2b05";
  //         let post_length = await page.evaluate((sel) => {
  //             let elements = Array.from(document.querySelectorAll(sel));
  //             return elements.length;
  //         }, selector);
  //         for(let i=0; i< post_length; i++){
  //             var name = await page.evaluate((l, sel) => {
  //                         let elements= Array.from(document.querySelectorAll(sel))
  //                         let anchor  = elements[l]
  //                         if(anchor){
  //                             return anchor.innerText;
  //                         }else{
  //                             return 'empty';
  //                         }
  //                     }, i, selector);
  //                 names.push(name)

  //         }
  //         // console.log(names);

  //         } catch (error) {
  //             return console.log(error.message)
  //         }

  // // Scraping for number of likes of a given post using post Ids //
  //     try {
  //         let selector= "._1g06";
  //         var like = await page.evaluate((sel) => {
  //                     let elements = []
  //                     elements= Array.from(document.querySelectorAll(sel))
  //                     let anchor  = elements[0]
  //                     if(anchor){
  //                         return anchor.innerText;
  //                     }else{
  //                         return '0 likes';
  //                     }
  //                 }, selector);
  //         } catch (error) {
  //             return console.log(error.message)
  //         }
  // // Scraping for poster of a given post using post Ids //
  //     try {
  //         let selector= "._52jd._52jb._52jh._5qc3._4vc-._3rc4._4vc-";
  //         var poster = await page.evaluate((sel) => {
  //                     let elements = []
  //                     elements= Array.from(document.querySelectorAll(sel))
  //                     let anchor  = elements[0]
  //                     if(anchor){
  //                         return anchor.innerText;
  //                     }else{
  //                         return '0 shares';
  //                     }
  //                 }, selector);
  //         } catch (error) {
  //             return console.log(error.message)
  //         }

  // // Scraping for the number of shares of a given post using post Ids
  //     try {
  //         let selector = "._1-ut .likes a, ._2sba._2sba a, ._43lx._43lx a, ._4kpx._4kpx a, ._4kpx._4kpx._4kpx._4kpx a";
  //         var share = await page.evaluate((sel) => {
  //                     let elements = []
  //                     elements= Array.from(document.querySelectorAll(sel))
  //                     let anchor  = elements[0]
  //                     if(anchor){
  //                         return anchor.innerText;
  //                     }else{
  //                         return '0 shares';
  //                     }
  //                 }, selector);
  //         } catch (error) {
  //             return console.log(error.message)
  //         }

  // // Scraping for time of post using post Link //
  //     try {
  //         let selector= "._52jc";
  //         var timeStamp = await page.evaluate((sel) => {
  //                     let elements =[]
  //                     elements= Array.from(document.querySelectorAll(sel))
  //                     let anchor  = elements[0]
  //                     if(anchor){
  //                         return anchor.innerText;
  //                     }else{
  //                         return 'empty';
  //                     }
  //                 }, selector);
  //         } catch (error) {
  //             return console.log(error.message)
  //         }

  //     for (let j = 0; j < names.length; j++) {
  //         comments.push({
  //             commentContent: commentContents[j],
  //             commenterName: names[j],
  //             commentorId: ids[j]
  //         })
  //     }
  // var date = new Date().toLocaleString()
  // const posts = new Posts({
  //     poster: poster,
  //     postId: postLinks[i],
  //     postContent: postContent,
  //     numberOfLikes: like,
  //     numberOfShares: share,
  //     timeOfPost: timeStamp,
  //     postSentiment: "",
  //     date: date
  //  })

  // await posts.save()
  // result.push({
  //     poster: poster,
  //     postId: postLinks[i],
  //     postContent: postContent,
  //     numberOfLikes: like,
  //     numberOfShares: share,
  //     timeOfPost: timeStamp,
  //     postSentiment: "",
  //     date: date
  // })
  // }
  //  console.log(result);
  return result;
};
