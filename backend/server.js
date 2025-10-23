require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDatabase = require('./config/database');
const Property = require('./models/Property');
const Zone = require('./models/Zone');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const randomInRange = (min, max) => Math.random() * (max - min) + min;

const mapZoneSummary = (zone) => ({
  id: zone._id,
  name: zone.name,
  slug: zone.slug,
  description: zone.description,
  color: zone.color,
  summary: zone.summary,
  geometry: zone.geometry,
  updatedAt: zone.updatedAt,
});

const formatPropertyResponse = (property, zone, source) => {
  const [lng, lat] = property.location.coordinates;

  return {
    source,
    name: property.name,
    address: property.address,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sizeSqm: property.sizeSqm,
    valuationGBP: property.valuationGBP,
    rentPerMonth: property.rentPerMonth,
    rentalYield: property.rentalYield,
    description: property.description,
    coordinates: {
      lat,
      lng,
    },
    zone: mapZoneSummary(zone),
    lastUpdated: property.updatedAt,
  };
};

const generateMockProperty = (lat, lng, zone) => {
  const sizeSqm = Math.round(randomInRange(35, 250));
  const valuationGBP = Math.round(randomInRange(250_000, 2_500_000));
  const rentalYield = Number(randomInRange(2.5, 6.5).toFixed(1));
  const rentPerMonth = Math.round(((valuationGBP * rentalYield) / 100) / 12);

  return {
    source: 'simulated',
    name: 'Simulated Property Insight',
    address: zone ? `${zone.name} (simulated)` : 'Ad-hoc location',
    propertyType: 'Unknown',
    bedrooms: Math.max(1, Math.round(sizeSqm / 45)),
    bathrooms: Math.max(1, Math.round(sizeSqm / 65)),
    coordinates: {
      lat,
      lng,
    },
    sizeSqm,
    valuationGBP,
    rentalYield,
    rentPerMonth,
    zone: zone ? mapZoneSummary(zone) : undefined,
    lastUpdated: new Date().toISOString(),
  };
};

app.get('/health', (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({ status: 'ok', dbConnected });
});

app.get('/zones', async (_req, res) => {
  try {
    const zones = await Zone.find({}).lean();
    return res.json(zones.map(mapZoneSummary));
  } catch (error) {
    console.error('Failed to load zones', error);
    return res.status(500).json({ message: 'Unable to load showcase zones.' });
  }
});

app.get('/property', async (req, res) => {
  const { lat, lng } = req.query;

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ message: 'Please provide valid lat and lng query parameters.' });
  }

  const point = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  try {
    const zone = await Zone.findOne({
      geometry: {
        $geoIntersects: {
          $geometry: point,
        },
      },
    }).lean();

    if (!zone) {
      return res.status(404).json({
        message:
          'This prototype currently focuses on the Westminster & Soho showcase zone. Try clicking inside the highlighted area to explore seeded properties.',
      });
    }

    const property = await Property.findOne({
      zone: zone._id,
      location: {
        $near: {
          $geometry: point,
          $maxDistance: 800,
        },
      },
    })
      .lean();

    if (property) {
      return res.json(formatPropertyResponse(property, zone, 'database'));
    }

    const fallback = await Property.findOne({ zone: zone._id }).lean();

    if (fallback) {
      return res.json(formatPropertyResponse(fallback, zone, 'database-fallback'));
    }

    const mock = generateMockProperty(latitude, longitude, zone);
    return res.json(mock);
  } catch (error) {
    console.error('Failed to resolve property insight', error);
    return res.status(500).json({ message: 'Unexpected error while fetching property insight.' });
  }
});

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to database connection issue', error);
    process.exit(1);
  });

module.exports = app;
