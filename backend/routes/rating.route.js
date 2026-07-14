import express from "express";
import { postRating, getRatingsByProduct, getRatingsByUser } from "../controllers/rating.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/api/ratings/product/:productId")
  .post(authCtrl.requireSignin, postRating);

router.route("/api/ratings/product/:productId")
  .get(getRatingsByProduct);

router.route("/api/ratings/user/:userId")
  .get(getRatingsByUser);

export default router;