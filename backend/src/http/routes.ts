import express from "express";
import { HttpExpressAdapter } from "./../adapters";
import {
  userController,
  fileController,
  folderController,
} from "../controllers/";
import { authMiddleware } from "./middleware/authMiddleware";
import { uploadFileMiddleware } from "./middleware/uploadFileMiddleware";

const routes = express.Router();

//user
routes.post(
  "/user/register",
  HttpExpressAdapter.execute(userController.register.bind(userController)),
);
routes.post(
  "/user/login",
  HttpExpressAdapter.execute(userController.login.bind(userController)),
);

//files
routes.post(
  "/file/upload",
  authMiddleware.execute,
  uploadFileMiddleware.execute(),
  HttpExpressAdapter.execute(fileController.upload.bind(fileController)),
);

routes.get(
  "/files",
  authMiddleware.execute,
  HttpExpressAdapter.execute(fileController.list.bind(fileController)),
);

//folders
routes.post(
  "/folder",
  authMiddleware.execute,
  HttpExpressAdapter.execute(folderController.create.bind(folderController)),
);

routes.get(
  "/folders",
  authMiddleware.execute,
  HttpExpressAdapter.execute(folderController.list.bind(folderController)),
);

export default routes;
