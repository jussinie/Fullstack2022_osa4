const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.map(b => b.likes)
  const reducer = (acc, currVal) => acc + currVal
  return blogs.length === 0
    ? 0
    : likes.reduce(reducer)
}

const favoriteBlog = (blogs) => {
  const blogWithMostLikes = blogs.reduce(function(prev, current) {
    return blogs.length === 0
      ? 0
      : (prev.likes > current.likes) ? prev : current
  })
  console.log(blogWithMostLikes)
  return blogWithMostLikes
}

module.exports = {
  dummy, totalLikes, favoriteBlog
}