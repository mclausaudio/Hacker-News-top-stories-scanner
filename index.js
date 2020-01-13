const axios = require("axios");
const fs = require("fs");

const commentChecker = require('./recursion');
const resultMaker = require('./resultMaker');



hackerNews("Postman", 100);

//Define function
async function hackerNews(searchTerm, numOfTopArticles) {
	console.log(`Search started for "${searchTerm}"... This may take a few minutes...`)
	searchTerm = searchTerm.toLowerCase();
	try {
		const results = [];
		// Grab the IDs for all the top stories
		let topStories = await axios(
			"https://hacker-news.firebaseio.com/v0/topstories.json"
		);
		//  push the number of IDs you'd like to search through into array
		let articles = [];
		for (let i = 0; i < numOfTopArticles; i++) {
			articles.push(topStories.data[i]);
		}
		// console.log(articles)
		// Loop through ID array
		let scanPost = async () => {
			for (let i = 0; i < articles.length; i++) {
				try {
					let id = articles[i].toString();
					//Grab the articles info
					let res = await axios(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
					const foundArticle = res.data;
					console.log('===========================')
					console.log(`Scanning HN Post #${i+1} of ${numOfTopArticles}  :::: "${foundArticle.title}"`);
					console.log('===========================')
					// Check the title of each post for the term - All posts have a title
					if (foundArticle.title.toLowerCase().includes(searchTerm)){
						results.push(resultMaker(foundArticle, searchTerm, 'title'));
						continue;
					} 
					// Previous idea: Let's check the type (ex. story, poll, job.. )
					// Update:  The posts type won't matter, if there's next then lets check it.
					else if (foundArticle.text && foundArticle.text.toLowerCase().include(searchTerm)){
						results.push(resultMaker(foundArticle, searchTerm, 'text'));
						continue;
					}
					// Is there comments?
					else if (foundArticle.kids) {
						const comments = foundArticle.kids;
						// Returns a flattened array of all comments / sub comments.
						const flat = await commentChecker(comments);
						// Search check each comment
						for (let j = 0; j<flat.length;j++){
							let res = await axios(`https://hacker-news.firebaseio.com/v0/item/${flat[j]}.json`);
							const comment = res.data;
							if (comment.text && comment.text.toLowerCase().includes(searchTerm)){
								results.push(resultMaker(foundArticle, searchTerm, 'comment'));
								continue;
							}
						}
					}
					// Now lets lastly check the article page
					 else {
						let page = await axios(foundArticle.url);
						//  If the article contains the term.. push the result into results array
						if (
							page.data
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						) {
							results.push(resultMaker(foundArticle, searchTerm, 'link'));
						}
					}
				} catch (err) {
					console.log("Something went wrong... :/ ---->", err.message);
				}
			}
		};
		await scanPost();
		//  Log the results to console, write results to JSON
		console.log("Results", results);
		let time = new Date();
		fs.writeFile(
			`results/${searchTerm} results - ${time}.json`,
			JSON.stringify(results),
			err => {
				if (err) console.log(err);
				console.log("Successfully Written to File.");
			}
		);
	} catch (err) {
		console.log("Something went wrong... :/ ---->", err.message);
	}
}

// NOTEPAD:

// Rather than nesting for loops - would it be faster to have two seperate for loops:
// 1st: Grab the text of every article and stick it inside an object/array
// 2nd: Loops through this new object/array and checks each index if the text contains the term.
// This would be one loop, followed by a nested loop.. Rather than a triple nested loop?