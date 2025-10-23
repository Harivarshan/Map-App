const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
    },
    name: { type: String, required: true },
    address: { type: String, required: true },
    propertyType: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    sizeSqm: { type: Number, required: true },
    valuationGBP: { type: Number, required: true },
    rentPerMonth: { type: Number, required: true },
    rentalYield: { type: Number, required: true },
    description: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

propertySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);
