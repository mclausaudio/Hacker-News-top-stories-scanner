const axios = require("axios");
const fs = require("fs");

hackerNews("apple", 10);

//Define function
async function hackerNews(searchTerm, numOfTopArticles) {
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
					//Grab the article itself from the URL
					if (res.data.url === undefined) {
						console.log(
							`Article does not provide valid URL: "${res.data.title}" by ${res.data.by}`
						);
					} else {
						let page = await axios(res.data.url);
						//  If the article contains the term.. push the result into results array
						if (
							page.data
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
						) {
							let result = {
								title: res.data.title,
								url: res.data.url,
								type: res.data.type,
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
