const axios = require("axios");
const fs = require("fs");

hackerNews("mac os", 1);

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
		console.log(articles)
		// Loop through ID array
		let scanPost = async () => {
			for (let i = 0; i < articles.length; i++) {
				try {
					let id = articles[i].toString();
					//Grab the articles info
					let res = await axios(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
					const foundArticle = res.data;
					console.log('===========================')
					console.log(`Article ${i} ::::::::::::::`,foundArticle)
					console.log('===========================')
					// Check the title of each post for the term - All posts have a title
					if (foundArticle.title.includes(searchTerm)){
						results.push(resultMaker(foundArticle, 'title'));
						continue;
					} 
					// Previous idea: Let's check the type (ex. story, poll, job.. )
					// Update:  The posts type won't matter, if there's next then lets check it.
					else if (foundArticle.text && foundArticle.text.include(searchTerm)){
						results.push(resultMaker(foundArticle, 'text'));
						continue;
					}
					// Is there comments?
					else if (foundArticle.kids) {
						const comments = foundArticle.kids;
						console.log('===========================')
						console.log('COMMENTS: ', comments)
						console.log('===========================')
						// Comments is an array of comment IDs
						// Each comment can have it's own comments, which is an array of IDs
						// This can go on infinitly
						const flat = [];
						// Must use for loop and not forEach...forEach is not async function

						let recur = async (id, index) => {
							let res = await axios(`https://hacker-news.firebaseio.com/v0/item/${comments[index]}.json`);

							if (res.data.kids) {
								for(let k = 0; k < res.data.kids; k++) {
									recur(id, k);
								}
							}
							console.log('res.data', res.data)
						}

						for (let j = 0; j < comments.length; j++) {
							console.log('comments[j] id', comments[j]);
							let res = await axios(`https://hacker-news.firebaseio.com/v0/item/${comments[j]}.json`);
							if (res.data.kids) {
								recur(id, j);
							}
						}

						
					}
					

					

					if (!foundArticle.url) {
						console.log(
							`Article does not provide valid URL: "${foundArticle.title}" by ${foundArticle.by} - HN post ID: ${id}`
						);
					} else {
						let page = await axios(foundArticle.url);
						//  If the article contains the term.. push the result into results array
						if (
							page.data
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						) {
							let result = {
								title: foundArticle.title,
								url: foundArticle.url,
								type: foundArticle.type,
								term: `Contains the term "${searchTerm}"`
							};
							results.push(result);
						}
					}
				} catch (err) {
					console.log(err);
				}
			}
		};
		let resultMaker = (post, termLocation) => {
			return {
				title: post.title,
				termLocation,
				postUrl: `https://news.ycombinator.com/item?id=${post.id}`,
				url: post.url,
				type: post.type,
				score: post.score,
				term: searchTerm
			};
		}
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
		console.log("ERROR", err);
	}
}

// NOTEPAD:

// Rather than nesting for loops - would it be faster to have two seperate for loops:
// 1st: Grab the text of every article and stick it inside an object/array
// 2nd: Loops through this new object/array and checks each index if the text contains the term.
// This would be one loop, followed by a nested loop.. Rather than a triple nested loop?