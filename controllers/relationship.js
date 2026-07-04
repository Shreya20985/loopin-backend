import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getRelationships = (req, res) => {
  const q = "SELECT followerUserId FROM relationships WHERE followedUserId = ?";

  db.query(q, [req.query.followedUserId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map((relationship) => relationship.followerUserId));
  });
};

export const addRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // FIX: check whether this follow relationship already exists before
    // inserting. Previously a duplicate click (or a slow network response
    // that let the button be clicked twice) could insert the SAME
    // (followerUserId, followedUserId) pair more than once, which is what
    // caused posts to appear duplicated in the feed.
    const checkQ =
      "SELECT * FROM relationships WHERE followerUserId = ? AND followedUserId = ?";

    db.query(checkQ, [userInfo.id, req.body.userId], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length) return res.status(200).json("Following");

      const q =
        "INSERT INTO relationships (`followerUserId`,`followedUserId`) VALUES (?)";
      const values = [userInfo.id, req.body.userId];

      db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Following");
      });
    });
  });
};

export const deleteRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";

    db.query(q, [userInfo.id, req.query.userId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Unfollow");
    });
  });
};