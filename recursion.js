const axios = require('axios');

//  Using this link for testing
// https://hacker-news.firebaseio.com/v0/item/8863.json (it's from the docs)

// const post = {
//     "by" : "dhouston",
//     "descendants" : 71,
//     "id" : 8863,
//     "kids" : [ 9224, 8917, 8952, 8884, 8887, 8869, 8958, 8940, 8908, 9005, 8873, 9671, 9067, 9055, 8865, 8881, 8872, 8955, 10403, 8903, 8928, 9125, 8998, 8901, 8902, 8907, 8894, 8870, 8878, 8980, 8934, 8943, 8876 ],
//     "score" : 104,
//     "time" : 1175714200,
//     "title" : "My YC app: Dropbox - Throw away your USB drive",
//     "type" : "story",
//     "url" : "http://www.getdropbox.com/u/2/screencast.html"
//   }

// const post = {
//     "by" : "michellepiped",
//     "descendants" : 4,
//     "id" : 22006910,
//     "kids" : [ 22015528, 22016618 ],
//     "score" : 57,
//     "time" : 1578611775,
//     "title" : "A Brief Guide to Startup Pivots",
//     "type" : "story",
//     "url" : "http://blog.eladgil.com/2019/05/a-brief-guide-to-startup-pivots-4-types.html"
//   }

module.exports = async function commentChecker(initialCommentsArray) {
    try {
        const flat = [];
        const parentComments = initialCommentsArray;
        async function recurssiveComments(commentsArray) {
            try {
                // Recurrsivly look through comments, returning all the IDs into a flattened array
                // This way, we can simply loop through each id, make api call, check the text
                const mainPostComments = commentsArray;
                for (let i = 0; i < mainPostComments.length; i++) {
                    let res = await axios(`https://hacker-news.firebaseio.com/v0/item/${mainPostComments[i]}.json`);
                    let comment = res.data;
                    // Sometimes HackerNews API returns 'null' for a comment, so we check to make sure something is there
                    if (comment){
                        // Make the comment.deleted is false, and that it doesn't exist on object
                        if (!comment.deleted) {
                            flat.push(mainPostComments[i]);
                        }
                        if (comment.kids){
                            recurssiveComments(comment.kids);
                        }
                    }
                }
            } catch (err) {
                console.log('Error in recurssiveComments: ', err.message)
            }
        }
        await recurssiveComments(parentComments);
        return flat;
    } catch(err) {
        console.log('Error in commentChecker:  ', err)
    }
}