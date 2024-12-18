const express = require("express");
const multer = require("multer");
const router = express.Router();
const articleController = require("../controllers/articleController");
const auth = require("../middleware/authentication");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

router.post("/", auth, upload.single("image"), articleController.createArticle); // Upload single image
router.get("/", articleController.getAllArticles);
router.get("/:id", articleController.getArticleById);
router.put(
  "/:id",
  auth,
  upload.single("image"),
  articleController.updateArticle
);
router.delete("/:id", auth, articleController.deleteArticle);

module.exports = router;
