const axios = require('axios')

// Recurssive functions
// /////////////////////

// Comment checker
const flat = [];
// Must use for loop and not forEach...forEach is not async function

//  Using this link for testing
// https://hacker-news.firebaseio.com/v0/item/8863.json (it's from the docs)

const post = {
    "by" : "dhouston",
    "descendants" : 71,
    "id" : 8863,
    "kids" : [ 9224, 8917, 8952, 8884, 8887, 8869, 8958, 8940, 8908, 9005, 8873, 9671, 9067, 9055, 8865, 8881, 8872, 8955, 10403, 8903, 8928, 9125, 8998, 8901, 8902, 8907, 8894, 8870, 8878, 8980, 8934, 8943, 8876 ],
    "score" : 104,
    "time" : 1175714200,
    "title" : "My YC app: Dropbox - Throw away your USB drive",
    "type" : "story",
    "url" : "http://www.getdropbox.com/u/2/screencast.html"
  }


async function commentChecker(initialCommentsArray) {
    const flat = [];
    const parentComments = initialCommentsArray;
    async function recurssiveComments(commentsArray) {
        // Recurrsivly look through comments, returning all the IDs into a flattened array
        // This way, we can simply loop through each id, make api call, check the text
        const mainPostComments = commentsArray;
        for (let i = 0; i < mainPostComments.length; i++) {
            flat.push(mainPostComments[i]);
            let res = await axios(`https://hacker-news.firebaseio.com/v0/item/${mainPostComments[i]}.json`);
            let comment = res.data
            if (comment.kids){
                recurssiveComments(comment.kids);
            }
        }
    }
    await recurssiveComments(parentComments);
    console.log('==============================')
    console.log('FLAT::::::::::::::::::::', flat)
    console.log('==============================')
    console.log("flat.length: ",flat.length )
    console.log('initialCommentsArray.length: ', initialCommentsArray.length)
    console.log('Does FLAT contain 9224?: ',flat.includes(9224))
    console.log('==============================')
}

commentChecker(post.kids);
console.log("post.descendants: ", post.descendants);