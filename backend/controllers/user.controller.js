import User from '../models/user.js'
import extend from 'lodash/extend.js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_temp');

const create = async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    return res.status(200).json({
      message: "Successfully signed up!"
    })
  } catch (err) {
    return res.status(400).json({
      error: err.message
    })
  }
}

/**
 * Load user and append to req.
 */
const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id)
    if (!user)
      return res.status('400').json({
        error: "User not found"
      })
    req.profile = user
    next()
  } catch (err) {
    return res.status('400').json({
      error: err.message
    })
  }
}

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const list = async (req, res) => {
  try {
    let users = await User.find().select('name email updated created')
    res.json(users)
  } catch (err) {
    return res.status(400).json({
      error: err.message
    })
  }
}

const update = async (req, res) => {
  try {
    let user = req.profile
    user = extend(user, req.body)
    user.updated = Date.now()
    await user.save()
    user.hashed_password = undefined
    user.salt = undefined
    res.json(user)
  } catch (err) {
    return res.status(400).json({
      error: err.message
    })
  }
}

const remove = async (req, res) => {
  try {
    let user = req.profile
    let deletedUser = await user.remove()
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  } catch (err) {
    return res.status(400).json({
      error: err.message
    })
  }
}

const stripeCustomer = async (req, res, next) => {
  try {
    let user = req.profile;
    if (user.stripe_customer) {
      return next();
    }
    const customer = await stripe.customers.create({
      email: user.email,
    });
    user.stripe_customer = customer.id;
    await user.save();
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const createCharge = async (req, res, next) => {
  try {
    const charge = await stripe.charges.create({
      amount: req.body.amount, // Amount should be in cents (e.g., $10 = 1000)
      currency: "usd",
      customer: req.profile.stripe_customer,
      source: req.body.token, // the payment token
    });
    req.chargeId = charge.id;
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const isShopKeeper = (req, res, next) => {
  const isShopKeeper = req.profile && req.profile.is_shop_keeper;
  if (!isShopKeeper) {
    return res.status(403).json({
      error: "User is not authorized as a shop keeper"
    });
  }
  next();
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  stripeCustomer,
  createCharge,
  isShopKeeper
}  