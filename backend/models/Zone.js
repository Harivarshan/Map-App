const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    color: { type: String, default: '#f97316' },
    summary: {
      avgValuation: { type: Number },
      medianRent: { type: Number },
      annualTransactions: { type: Number },
      primaryPropertyType: { type: String },
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        required: true,
      },
      coordinates: {
        type: Array,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

zoneSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Zone', zoneSchema);
