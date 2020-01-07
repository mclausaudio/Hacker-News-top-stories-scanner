const axios = require("axios");
const fs = require("fs");

hackerNews("evaluating state", 1);

//Define function
async function hackerNews(searchTerm, numOfTopArticles) {
	console.log(`Search started for "${searchTerm}"... This may take a few minutes...`)
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
		// Loop through ID array
		let scanArticle = async () => {
			for (let i = 0; i < articles.length; i++) {
				try {
					let id = articles[i].toString();
					//Grab the articles info
					let res = await axios(
						`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
					);
					const foundArticle = res.data;
					

					// We have the article object.
					console.log('===========================')
					console.log(foundArticle)
					console.log('===========================')
					// Let's check the title of each post for the term, since they will always have one

					// Let's check the type (ex. story, poll, job.. )

					// Handle each type accordingly.

						// Is there a text, aka the post's body?

						// Is there comments?
							// If so, check each comment
								// Does the comment have comments?
									







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
		await scanArticle();
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