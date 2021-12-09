const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const recipeschema = new Schema({
    title: String,

    description: String,

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

recipeschema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('recipe', recipeschema);