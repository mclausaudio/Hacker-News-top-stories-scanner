module.exports = (post, searchTerm, termLocation) => {
    return {
        title: post.title,
        termLocation,
        hackerNewsUrl: `https://news.ycombinator.com/item?id=${post.id}`,
        linkUrl: post.url,
        type: post.type,
        score: post.score,
        term: searchTerm
    };
}