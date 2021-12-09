const express = require('express');
const router = express.Router({ mergeParams: true });

const recipe = require('../models/recipe');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



router.post('/', validateReview, catchAsync(async (req, res) => {
    const rec = await recipe.findById(req.params.id);
    const review = new Review(req.body.review);
    rec.reviews.push(review);
    await review.save();
    await rec.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/recipes/${rec._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await recipe.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/recipes/${id}`);
}))

module.exports = router;