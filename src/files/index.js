import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import * as dotenv from "dotenv";
import { writePosts, getPosts } from "../lib/tools.js";


const filesRouter = express.Router();
dotenv.config();
const cloudinaryUploaderAvatar = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "products/images",
    },
  }),
}).single("avatar");

const cloudinaryUploaderCover = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "products/cover",
    },
  }),
}).single("cover");

filesRouter.post(
  "/:authorId",
  cloudinaryUploaderAvatar,
  async (req, res, next) => {
    try {
      // const originalFileExtension = extname(req.file.originalname);
      // const fileName = req.params.authorId + originalFileExtension;
      // await saveUsersAvatar(fileName, req.f ile.buffer);
      const url = req.file.path;
      const users = await getAuthors();
      const index = users.findIndex((user) => user.id === req.params.authorId);
      if (index !== -1) {
        const oldUser = users[index];
        const author = { ...oldUser.author, avatar: url };
        const updatedUser = { ...oldUser, author, updatedAt: new Date() };
        users[index] = updatedUser;
        await writeAuthors(users);
      }
      res.send("File Uploaded");
    } catch (err) {
      next(err);
    }
  }
);

filesRouter.post(
  "/:postid",
  cloudinaryUploaderCover,
  async (req, res, next) => {
    try {
      // const originalFileExtension = extname(req.file.originalname);
      // const fileName = req.params.postid + originalFileExtension;
      // await savePostCover(fileName, req.file.buffer);
      const posts = await getPosts();
      const index = posts.findIndex((post) => post.id === req.params.postid);
      if (index !== -1) {
        const oldPost = posts[index];
        const updatedPost = {
          ...oldPost,
          cover: req.file.path,
          updatedAt: new Date(),
        };
        posts[index] = updatedPost;
        await writePosts(posts);
      }
      res.send("File uploaded");
    } catch (err) {
      next(err);
    }
  }
);

export default filesRouter;
