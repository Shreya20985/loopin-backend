import express from "express";
import { getUser, updateUser, getUserSuggestions, getFollowing } from "../controllers/user.js";

const router = express.Router();

router.get("/find/:userId", getUser);
router.get("/suggestions", getUserSuggestions);
router.get("/following", getFollowing);
router.put("/", updateUser);

export default router;