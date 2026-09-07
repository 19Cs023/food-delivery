/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
import {Order, CartItem} from '../models/order.js'

const create = async (req, res) => {
  try {
    req.body.order.user = req.profile
    const order = new Order(req.body.order)
    let result = await order.save()
    res.status(200).json(result)
  } catch (err){
    return res.status(400).json({
      error: err.message
    })
  }
}

const listByShop = async (req, res) => {
  try {
    let orders = await Order.find({"products.shop": req.shop._id})
      .populate({path: 'products.product', select: '_id name price'})
      .sort('-created')
      .exec()
    res.json(orders)
  } catch (err){
    return res.status(400).json({
      error: err.message
    })
  }
}

const update = async (req, res) => {
  try {
    const { cartItemId, status } = req.body
    const allowedStatuses = CartItem.schema.path('status').options.enum

    if (!cartItemId || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'A valid cart item id and order status are required'
      })
    }

    const order = await Order.findOneAndUpdate(
      { 'products._id': cartItemId },
      { $set: { 'products.$.status': status } },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ error: 'Order item not found' })
    }

    res.json(order)
  } catch (err){
    return res.status(400).json({
      error: err.message
    })
  }
}

const getStatusValues = (req, res) => {
  res.json(CartItem.schema.path('status').options.enum)
}

const orderByID = async (req, res, next, id) => {
  try {
    let order = await Order.findById(id).populate('products.product', 'name price').populate('products.shop', 'name').exec()
    if (!order)
      return res.status(400).json({
        error: "Order not found"
      })
    req.order = order
    next()
  } catch (err){
    return res.status(400).json({
      error: err.message
    })
  }
}

const listByUser = async (req, res) => {
  try{
    let orders = await Order.find({ "user": req.profile._id })
        .sort('-created')
        .exec()
    res.json(orders)
  } catch (err){
    return res.status(400).json({
      error: err.message
    })
  }
}

const read = (req, res) => {
  return res.json(req.order)
}

export default {
  create,
  listByShop,
  update,
  getStatusValues,
  orderByID,
  listByUser,
  read
}