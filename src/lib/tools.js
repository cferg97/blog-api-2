import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { readJSON, writeJSON } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

const postsJSONpath = join(dataFolderPath, "blogposts.json");
export const getPosts = () => readJSON(postsJSONpath);
export const writePosts = (postArr) => writeJSON(postsJSONpath, postArr);
