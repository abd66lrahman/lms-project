import express from "express";
import * as usersController from "./../controllers/usersController.js";
const Router = express.Router();

Router.route("/register").post(usersController.signUp);
Router.route("/login").post(usersController.signIn)

export default Router;
 