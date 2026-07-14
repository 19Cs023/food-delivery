import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, trim: true }
});

const Rating = mongoose.model('Rating', RatingSchema);

export default Rating;