const Blog = require('../models/blog')
var _ = require('lodash')

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

const mostBlogs = (blogList) => {
  const counts = _.countBy(blogList, 'author')
  console.log('keys', Object.values(counts))
  //const newCounts = Object.keys(counts).map(key => ({
  //  [key]: counts[key]
  //}))

  const KeysOfData = Object.keys(counts)
  const newCounts = KeysOfData.map(key => {
    const value = counts[key]
    return {
      key1: key,
      key2: value
    }
  })
  function comparator(a, b) {
    return b.key2 - a.key2
  }
  const answer = newCounts.sort(comparator)[0]
  const { key1: author, key2: blogs, ...rest } = answer
  const newAnswer = { author, blogs, ...rest }
  return newAnswer
}

const mostLikes = (blogs) => {

  const counts = {}

  for (const blog of blogs) {
    counts[blog.author] = counts[blog.author] ? counts[blog.author] + 1 : 1
  }

  let oneOccurences = []

  for (const [key, value] of Object.entries(counts)) {
    if (value === 1) {
      oneOccurences.push({ key: key, value: value })
    }
  }

  let resultarr = []
  oneOccurences.forEach(author => {
    const added = _.find(blogs, ['author', author.key])
    resultarr.push({ author: added.author, likes: added.likes })
  })

  function comparator(a, b) {
    return b.likes - a.likes
  }

  blogs.forEach(d => {
    blogs.forEach(d2 => {
      if(d2.author === d.author && d.title !== d2.title){
        let result = { author: d.author, likes: d.likes + d2.likes }
        const existing = _.find(resultarr, ['author'], result.author)
        if (existing !== undefined ) {
          if(!(resultarr.some(item => item.author === result.author && existing.likes > result.likes))) {
            resultarr.push(result)
          }
        } else if(!(resultarr.some(item => item.author === result.author))){
          resultarr.push(result)
        }
      }
    })
  })
  const mostLikes = resultarr.sort(comparator)[0]
  return mostLikes
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  dummy, totalLikes, favoriteBlog, blogsInDb, mostBlogs, mostLikes
}