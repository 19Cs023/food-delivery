import express from 'express';
import Rating from '../models/rating.js';

const postRating = async (req, res) => {
  try {
    const { user, product, rating, review } = req.body;
    const ratings = new Rating({ user, product, rating, review });
    await ratings.save();
    res.json(ratings);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const getRatingsByProduct = async (req, res) => {
  try {
    const ratings = await Rating.find({ product: req.params.productId }).populate('user', 'name');
    res.json(ratings);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
};

const getRatingsByUser = async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.params.userId }).populate('product', 'name');
    res.json(ratings);
    } catch (err) {
    return res.status(400).json({
        error: err.message
    });
  }
};

export { postRating, getRatingsByProduct, getRatingsByUser };
