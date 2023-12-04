const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const middleware = require("../utils/middleware");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const body = request.body;


  const user = request.user;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: user.id
  });

  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", middleware.userExtractor, async (request, response) => {
    const blog = await Blog.findById(request.params.id);
    const user = request.user
    if ( blog.user.toString() === user.id.toString() ){
        await Blog.findByIdAndDelete(request.params.id);
        response.status(204).end();
    }else{
        response.status(401).json({error: "not creator, no right to delete it"})
    }
  
});

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const newBlog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes ? body.likes : 0,
    }
  

    updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id, 
      newBlog,
      { new: true, runValidators: true, context: 'query' }
    ) 
      
    response.json(updatedBlog)

  })

module.exports = blogsRouter;
