const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('../utils/test_helper')

const initialBlogs = [
  {
    title: 'test blog 1',
    author: 'Jussi',
    url: 'sample.com/blog',
    likes: 0
  },
  {
    title: 'test blog 2',
    author: 'Sepi',
    url: 'example.com/blog',
    likes: 0
  },
  {
    title: 'test blog 3',
    author: 'Without 0',
    url: 'zerosareneeded.com',
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[2])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog id field is named id', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToEvaluate = blogsAtStart[0]
  //helper function already converts id field to JSON
  expect(blogToEvaluate.id).toBeDefined()
})

test('if like is empty, it is set to 0', async () => {
  const blogsAtStart = await helper.blogsInDb()
  console.log(blogsAtStart)
  const blogToEvaluate = blogsAtStart[2]
  expect(blogToEvaluate.likes).toBe(0)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(initialBlogs.length)
})

test('individual blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  console.log('blogsAtStart', blogsAtStart)
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    initialBlogs.length - 1
  )

  const contents = blogsAtEnd.map(r => r.title)

  expect(contents).not.toContain(blogToDelete.title)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'with post added test blog 1',
    author: 'Jussi',
    url: 'sample.com/postblog',
    likes: 0
  }

  await api
    .post('/api/blogs/')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.title)

  expect(response.body).toHaveLength(initialBlogs.length + 1)
  expect(contents).toContain(
    'with post added test blog 1'
  )
})

test('blog without title or url cannot be added', async () => {
  const newBlog = {
    author: 'Jussi',
    url: 'sample.com/postblog',
    likes: 0
  }

  await api
    .post('/api/blogs/')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(initialBlogs.length)
})

test('an individual blog can be updated', async () => {

  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  blogToUpdate.likes = blogToUpdate.likes + 1

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogToUpdate)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(initialBlogs.length)

  const likes = blogsAtEnd.map(b => b.likes)
  expect(likes).toContain(1)
})

afterAll(() => {
  mongoose.connection.close()
})