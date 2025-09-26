const joi = require("joi");

const listingSchema = joi.object({
    listing : joi.object({
        title: joi.string().required(),
        description : joi.string().required(),
        image : joi.object({
            url: joi.string().allow("", null)
        }),
        price: joi.number().min(0),
        country: joi.string().required(),
        location : joi.string().required(),
    })
});
 module.exports = listingSchema;