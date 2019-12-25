# Hacker News Scanner

## By Michael Claus - mclausaudio@gmail.com

www.michaelclaus.io

The script in index.js will scan through a number of Hacker News' top articles and return any article that contains a user determined term.

This is useful if you'd like to see if a particular company, technology or person is being talked about in Hacker News and don't want to read through every article yourself.

### How to Use

At the top of index.js, invoke the hackerNews function. The first argument is the term, the second is the number of top articles you'd like to search through. So, if you'd like to see if you'd like to see if the term "Apple" is in the top 10 Hacker News articles pages, you'd use:

hackerNews("Apple", 10);

Results are then written to .json in the results folder

Note: This scans the entire page source, not just readable text content.
