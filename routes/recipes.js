const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { recipeschema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const recipe = require('../models/recipe');

const validaterecipe = (req, res, next) => {
    const { error } = recipeschema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const recipes = await recipe.find({});
    res.render('recipes/index', { recipes })
}));

router.get('/new', (req, res) => {
    res.render('recipes/new');
})


router.post('/', validaterecipe, catchAsync(async (req, res, next) => {
    // if (!req.body.recipe) throw new ExpressError('Invalid recipe Data', 400);
    const rec = new recipe(req.body.rec);
    //rec.title = "sgab"
    await rec.save();

    req.flash('success', 'Posted your new Recipe!');
    res.redirect(`/recipes/${rec._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const rec = await recipe.findById(req.params.id).populate('reviews');

    if (!rec) {
        req.flash('error', 'Cannot find that recipe!');
        return res.redirect('/recipes');
    }
    res.render('recipes/show', { rec });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const rec = await recipe.findById(req.params.id)
    if (!rec) {
        req.flash('error', 'Cannot find that recipe!');
        return res.redirect('/recipes');
    }
    res.render('recipes/edit', { rec });
}))

router.put('/:id', validaterecipe, catchAsync(async (req, res) => {
    const { id } = req.params;
    const rec = await recipe.findByIdAndUpdate(id, { ...req.body.rec });
    req.flash('success', 'Successfully updated recipe!');
    res.redirect(`/recipes/${rec._id}`)
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await recipe.findByIdAndDelete(id);
    req.flash('success', 'Deleted your recipe')
    res.redirect('/recipes');
}));

module.exports = router;