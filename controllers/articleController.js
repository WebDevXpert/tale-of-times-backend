const fs = require('fs');
const path = require('path');
const Article = require('../models/Article');


exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: `Error fetching articles: ${error.message}` });
  }
};


exports.createArticle = async (req, res) => {
  try {
    const { title, content, description } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null; 

    const newArticle = new Article({
      title,
      content,
      description,
      image,
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(400).json({ message: `Error creating article: ${error.message}` });
  }
};


exports.updateArticle = async (req, res) => {
  try {
    const { title, content, description } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null; 

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

   
    if (article.image && req.file) {
      const oldImagePath = path.join(__dirname, 'public', article.image.split('/').pop());
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Error deleting old image:', err);
      });
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { title, content, description, image },
      { new: true }
    );

    res.status(200).json(updatedArticle);
  } catch (error) {
    res.status(400).json({ message: `Error updating article: ${error.message}` });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: `Error fetching article: ${error.message}` });
  }
};


exports.deleteArticle = async (req, res) => {
  try {
    console.log('Deleting article with ID:', req.params.id);
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      console.log('Article not found');
      return res.status(404).json({ message: 'Article not found' });
    }

    console.log('Found article:', article);
    
    if (article.image) {
      const imagePath = path.join(__dirname, 'public', article.image.replace('/images', ''));
      console.log('Image path:', imagePath);

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        } else {
          console.log('Image deleted successfully');
        }
      });
    }

    await Article.findByIdAndDelete(req.params.id); 
    console.log('Article deleted successfully');
    res.status(204).end(); 

  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: `Error deleting article: ${error.message}` });
  }
};




