import Shop from '../models/shop.js'
import extend from 'lodash/extend'
import formidable from 'formidable'
import fs from 'fs'
const defaultImage = '/public/default.png'

const create = (req, res) => {
  let form = formidable({ keepExtensions: true })
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        message: "Image could not be uploaded"
      })
    }
    let shop = new Shop(fields)
    shop.owner= req.profile
    if(files.image){
      let imageFile = Array.isArray(files.image) ? files.image[0] : files.image
      shop.image = shop.image || {}
      shop.image.data = fs.readFileSync(imageFile.filepath)
      shop.image.contentType = imageFile.mimetype
    }
    try {
      let result = await shop.save()
      res.status(200).json(result)
    }catch (err){
      return res.status(400).json({
        error: err.message
      })
    }
  })
}

const shopByID = async (req, res, next, id) => {
  try {
    let shop = await Shop.findById(id).populate('owner', '_id name').exec()
    if (!shop)
      return res.status(400).json({
        error: "Shop not found"
      })
    req.shop = shop
    next()
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve shop"
    })
  }
}

const photo = (req, res, next) => {
  if(req.shop.image.data){
    res.set("Content-Type", req.shop.image.contentType)
    return res.send(req.shop.image.data)
  }
  next()
}
const defaultPhoto = (req, res) => {
  return res.sendFile(process.cwd()+defaultImage)
}

const read = (req, res) => {
  req.shop.image = undefined
  return res.json(req.shop)
}

const update = (req, res) => {
  let form = formidable({ keepExtensions: true })
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        message: "Photo could not be uploaded"
      })
    }
    let shop = req.shop
    shop = extend(shop, fields)
    shop.updated = Date.now()
    if(files.image){
      let imageFile = Array.isArray(files.image) ? files.image[0] : files.image
      shop.image = shop.image || {}
      shop.image.data = fs.readFileSync(imageFile.filepath)
      shop.image.contentType = imageFile.mimetype
    }
    try {
      let result = await shop.save()
      res.json(result)
    }catch (err){
      return res.status(400).json({
        error: err.message
      })
    }
  })
}

const remove = async (req, res) => {
  try {
    let shop = req.shop
    let deletedShop = await shop.deleteOne()
    res.json(deletedShop)
  } catch (err) {
    return res.status(400).json({
      error: err.message
    })
  }  
}

const list = async (req, res) => {
  try {
    let shops = await Shop.find()
    res.json(shops)
  } catch (err){
    return res.status(400).json({
      error: err.message
    })
  }
}

const listByOwner = async (req, res) => {
  try {
    let shops = await Shop.find({owner: req.profile._id}).populate('owner', '_id name')
    res.json(shops)
  } catch (err){
    return res.status(400).json({
      error: err.message
    })
  }
}

const isOwner = (req, res, next) => {
  const isOwner = req.shop && req.auth && req.shop.owner._id == req.auth._id
  if(!isOwner){
    return res.status(403).json({
      error: "User is not authorized"
    })
  }
  next()
}

export default {
  create,
  shopByID,
  photo,
  defaultPhoto,
  list,
  listByOwner,
  read,
  update,
  isOwner,
  remove
}