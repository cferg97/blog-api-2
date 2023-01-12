import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import { join } from "path";
import * as dotenv from "dotenv";

import postsRouter from "./posts/index.js";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandler.js";

dotenv.config();

const port = process.env.PORT;
const server = express();

const publicFolderPath = join(process.cwd(), "./public");

server.use(express.static(publicFolderPath));
server.use(cors());
server.use(express.json());

server.use("/blogposts", postsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on Port ${port}`);
});
