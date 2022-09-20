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
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
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

afterAll(() => {
  mongoose.connection.close()
})