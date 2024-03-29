const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

/*
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
} */

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user')
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog
    .findById(request.params.id).populate('user')
  response.json(blog.toJSON())
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  //const token = getTokenFrom(request)
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  console.log('body', request.body)
  console.log('tokens', request.token, decodedToken)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  //const user = await User.findById(decodedToken.id)

  const user = request.user
  console.log('user postissa ', user)
  console.log('blog request.bodyssa ', body)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: 0,
    user: user._id
  })

  console.log('blog backendissä', blog)

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog.toJSON())

})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  console.log('request.body', body)

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: body.user
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(201).json(updatedBlog.toJSON())
  } catch (exception) {
    console.log('exception ', exception)
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  console.log('tokens', request.token, decodedToken)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blogToDelete = await Blog.findById(request.params.id)
  console.log('blog to delete', blogToDelete)

  if (blogToDelete.user.toString() === user.id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }
  //const blog = await Blog.findById(decodedToken.id)
  return response.status(400).json({ error: 'only person who added the blog can delete it' })

})

blogsRouter.post('/:id/comments', async (request, response) => {
  const body = request.body
  const blogToBeUpdated = await Blog.findById(request.params.id)
  let commentsToUpdate = blogToBeUpdated.comments
  commentsToUpdate.push(body.comment)

  const blogWithComments = { ...blogToBeUpdated, comments: commentsToUpdate }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blogWithComments, { new: true })
    response.status(201).json(updatedBlog.toJSON())
  } catch (exception) {
    console.log('exception ', exception)
  }
})


module.exports = blogsRouter