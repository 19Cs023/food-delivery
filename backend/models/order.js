import mongoose from 'mongoose'
const CartItemSchema = new mongoose.Schema({
  product: {type: mongoose.Schema.ObjectId, ref: 'Product'},
  quantity: Number,
  shop: {type: mongoose.Schema.ObjectId, ref: 'Shop'},
  status: {type: String,
    default: 'Not processed',
    enum: ['Not processed' , 'Processing', 'Shipped', 'Delivered', 'Cancelled']}
})
const CartItem = mongoose.model('CartItem', CartItemSchema)
const OrderSchema = new mongoose.Schema({
  products: [CartItemSchema],
  customer_name: {
    type: String,
    trim: true,
    required: [true, 'Name is required']
  },
  customer_email: {
    type: String,
    trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    required: [true, 'Email is required']
  },
  delivery_address: {
    street: {type: String, required: [true, 'Street is required']},
    city: {type: String, required: [true, 'City is required']},
    pincode: {type: String, required: [true, 'Pin Code is required']},
    
  },
  payment_id: {},
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  },
  user: {type: mongoose.Schema.ObjectId, ref: 'User'}
})

const Order = mongoose.model('Order', OrderSchema)

export {Order, CartItem}