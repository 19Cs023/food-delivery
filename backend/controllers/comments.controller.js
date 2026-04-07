import express from 'express';
const router = express.Router();
import Comment from '../models/comments.js';
import Users from '../models/user.js';
import mongoose from 'mongoose';
const { get } = mongoose;
import extend from 'lodash/extend.js'

// Create a new comment
const create = async (req, res) => {
  try {
    req.body.recorded_by = req.auth._id
    const comment = new Comment(req.body)
    await comment.save()
    return res.status(200).json(comment)
  }
    catch (err) {
    return res.status(400).json({
        error: err.message
    })
  }
}

const commentByID = async (req, res, next, id) => {
    try {
      let comment = await Comment.findById(id).populate('recorded_by', '_id name').exec()
      if (!comment)
        return res.status('400').json({
          error: "Comment record not found"
        })
    } catch (err){
      return res.status(400).json({
          error: err.message
      })
    }
}


const read = (req, res) => {
    return res.json(req.comment)
}

const allcomments = async (req, res) => {
    try {
        let comments = await Comment.find().sort('-incurred_on').populate('recorded_by', '_id name')
        return res.json(comments)
    } catch (err) {
        return res.status(400).json({
            error: err.message
        })
    }
}

const listByUser = async (req, res) => {
  let firstDay = req.query.firstDay
  let lastDay = req.query.lastDay
    try {
        let query = { recorded_by: req.auth._id }
        if (firstDay && lastDay) {
            query.incurred_on = { $gte: firstDay, $lte: lastDay }
        }
        let comments = await Comment.find(query).sort('-incurred_on').populate('recorded_by', '_id name')
        return res.json(comments)
    } catch (err) {
        return res.status(400).json({
            error: err.message
        })
    }
}

const update = async (req, res) => {
    try {
        let comment = req.comment
        comment = extend(comment, req.body)
        comment.updated = Date.now()
        await comment.save()
        res.json(comment)
    } catch (err) {
        return res.status(400).json({
            error: err.message
        })
    }
}   

export default { create, commentByID, read, allcomments, listByUser, update }

