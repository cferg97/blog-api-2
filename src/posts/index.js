import express from "express";
import uniqid from "uniqid";
import httpErrors from "http-errors";
import { pipeline } from "stream";
import { checkPostSchema, triggerBadRequest } from "./validator.js";
import { getPosts, writePosts, getJSONreadableStream } from "../lib/tools.js";

import json2csv from "json2csv";

const postsRouter = express.Router();

export default postsRouter;

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await getPosts();
    res.send(posts);
  } catch (err) {
    next(err);
  }
});

postsRouter.post(
  "/",
  checkPostSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newPost = {
        ...req.body,
        id: uniqid(),
        category: req.body.category,
        title: req.body.title,
        author: {
          name: req.body.author.name,
          avatar: `https://ui-avatars.com/api/?name=${req.body.author.name}`,
        },
        content: req.body.content,
        createdAt: new Date(),
      };
      const blogPosts = await getPosts();
      blogPosts.push(newPost);
      await writePosts(blogPosts);
      res.status(201).send({ id: newPost.id });
    } catch (err) {
      next(err);
    }
  }
);

postsRouter.get("/:postid", async (req, res, next) => {
  const postid = req.params.postid;
  try {
    const posts = await getPosts();
    const requestedPost = posts.find((post) => post.id === postid);
    res.send(requestedPost);
  } catch (err) {
    next(err);
  }
});

postsRouter.put("/:postid", async (req, res, next) => {
  try {
    const posts = await getPosts();
    const index = posts.findIndex((post) => post.id === req.params.postid);
    if (index !== -1) {
      const oldPost = posts[index];
      const updatedPost = {
        ...oldPost,
        ...req.body,
        author: {
          ...req.body.author,
          ...oldPost.author,
        },
        updatedAt: new Date(),
      };
      posts[index] = updatedPost;
      await writePosts(posts);
      res.status(201).send(updatedPost);
    } else {
      res.status(404).send();
    }
  } catch (err) {
    next(err);
  }
});

postsRouter.delete("/:postid", async (req, res, next) => {
  try {
    const posts = await getPosts();
    const remainingPosts = posts.filter(
      (post) => post.id !== req.params.postid
    );
    await writePosts(remainingPosts);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

postsRouter.get("/CSV", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=posts.csv");
    const source = getJSONreadableStream();
    const transform = new json2csv.Transform({
      fields: [
        "category",
        "title",
        "readTime.value",
        "readTime.unit",
        "author.name",
        "author.avatar",
        "content",
        "id",
        "createdAt",
        "updatedAt",
      ],
    });
    const destination = res;
    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (err) {
    next(err);
  }
});
