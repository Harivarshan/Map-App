require('dotenv').config();

const connectDatabase = require('./config/database');
const Zone = require('./models/Zone');
const Property = require('./models/Property');

const WESTMINSTER_SHOWCASE = {
  name: 'Westminster & Soho Showcase Zone',
  slug: 'central-london-westminster',
  description:
    'Focus area covering Westminster, Soho, Mayfair, and Covent Garden — some of the most property-dense neighbourhoods in London.',
  color: '#f97316',
  summary: {
    avgValuation: 1850000,
    medianRent: 4200,
    annualTransactions: 1845,
    primaryPropertyType: 'Prime apartments & period townhouses',
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-0.1606, 51.5151],
        [-0.1768, 51.5081],
        [-0.1785, 51.5039],
        [-0.1668, 51.4978],
        [-0.1531, 51.4933],
        [-0.1297, 51.4898],
        [-0.1066, 51.4989],
        [-0.0974, 51.5054],
        [-0.0948, 51.5123],
        [-0.1032, 51.5182],
        [-0.1231, 51.5212],
        [-0.1444, 51.5219],
        [-0.1606, 51.5151],
      ],
    ],
  },
};

const PROPERTIES = [
  {
    name: 'Mayfair Penthouse',
    address: 'Brook Street, Mayfair W1K',
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 185,
    valuationGBP: 3250000,
    rentPerMonth: 12500,
    description: 'Top-floor lateral apartment with south-facing terraces overlooking Grosvenor Square.',
    coordinates: [-0.1496, 51.5108],
  },
  {
    name: 'Soho Creative Loft',
    address: 'Dean Street, Soho W1D',
    propertyType: 'Loft',
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 128,
    valuationGBP: 1425000,
    rentPerMonth: 5900,
    description: 'Converted warehouse loft with exposed brick and double-height ceilings designed for live/work.',
    coordinates: [-0.1328, 51.5139],
  },
  {
    name: 'Marylebone Mews House',
    address: 'Wimpole Mews, Marylebone W1G',
    propertyType: 'Mews House',
    bedrooms: 4,
    bathrooms: 3,
    sizeSqm: 205,
    valuationGBP: 2480000,
    rentPerMonth: 8150,
    description: 'Quiet cobbled mews with private garage and rooftop terrace moments from Marylebone High Street.',
    coordinates: [-0.1513, 51.5191],
  },
  {
    name: 'Covent Garden Pied-à-Terre',
    address: 'Henrietta Street, Covent Garden WC2E',
    propertyType: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 64,
    valuationGBP: 985000,
    rentPerMonth: 3600,
    description: 'Boutique apartment above the piazza with Juliet balcony and concierge services.',
    coordinates: [-0.1236, 51.5115],
  },
  {
    name: 'Westminster River View Flat',
    address: 'Millbank, Westminster SW1P',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 112,
    valuationGBP: 1580000,
    rentPerMonth: 5400,
    description: 'Corner apartment with panoramic Thames views and access to residents’ spa.',
    coordinates: [-0.1285, 51.4939],
  },
  {
    name: 'St James’s Period Residence',
    address: 'Jermyn Street, St James’s SW1Y',
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    sizeSqm: 156,
    valuationGBP: 2175000,
    rentPerMonth: 7800,
    description: 'Grade II listed apartment with original sash windows and bespoke joinery.',
    coordinates: [-0.1379, 51.5083],
  },
  {
    name: 'Fitzrovia Design Studio',
    address: 'Charlotte Street, Fitzrovia W1T',
    propertyType: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 74,
    valuationGBP: 865000,
    rentPerMonth: 3150,
    description: 'Dual-aspect design studio with polished concrete floors and flexible partition system.',
    coordinates: [-0.1351, 51.5186],
  },
  {
    name: 'West End Duplex',
    address: 'Wardour Street, West End W1F',
    propertyType: 'Duplex',
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 134,
    valuationGBP: 1680000,
    rentPerMonth: 6100,
    description: 'Duplex with gallery-level living space, tailored for entertainment and media professionals.',
    coordinates: [-0.1367, 51.5124],
  },
  {
    name: 'Hyde Park Corner Townhouse',
    address: 'Wilton Place, Belgravia SW1X',
    propertyType: 'Townhouse',
    bedrooms: 5,
    bathrooms: 4,
    sizeSqm: 312,
    valuationGBP: 4950000,
    rentPerMonth: 16800,
    description: 'Stucco-fronted townhouse with private garden square access and lower ground cinema.',
    coordinates: [-0.1508, 51.5035],
  },
  {
    name: 'Leicester Square Boutique Flat',
    address: 'Cranbourn Street, Leicester Square WC2H',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 98,
    valuationGBP: 1325000,
    rentPerMonth: 5100,
    description: 'Boutique residence with acoustic glazing ideal for pied-à-terre buyers seeking central access.',
    coordinates: [-0.129, 51.5101],
  },
  {
    name: 'Piccadilly Investment Suite',
    address: 'Piccadilly, St James’s W1J',
    propertyType: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 58,
    valuationGBP: 775000,
    rentPerMonth: 2850,
    description: 'High-floor one-bed with skyline vistas, currently configured as a turnkey rental suite.',
    coordinates: [-0.1406, 51.5088],
  },
  {
    name: 'Regent Street Corner Flat',
    address: 'Regent Street, Soho W1B',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 121,
    valuationGBP: 1710000,
    rentPerMonth: 6400,
    description: 'Corner aspect flat with Art Deco features and direct lift access to private lobby.',
    coordinates: [-0.1409, 51.5141],
  },
  {
    name: 'Golden Square Heritage Loft',
    address: 'Golden Square, Soho W1F',
    propertyType: 'Loft',
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 146,
    valuationGBP: 1550000,
    rentPerMonth: 5800,
    description: 'Top-floor loft within a converted publishing house, featuring exposed beams and skyline deck.',
    coordinates: [-0.1371, 51.5114],
  },
  {
    name: 'Victoria Contemporary Apartment',
    address: 'Cathedral Walk, Victoria SW1E',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 102,
    valuationGBP: 1480000,
    rentPerMonth: 5250,
    description: 'South-west facing apartment in a new build with residents’ lounge and rooftop gardens.',
    coordinates: [-0.1394, 51.4989],
  },
  {
    name: 'Lancaster Gate Lateral Home',
    address: 'Lancaster Gate, Bayswater W2',
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 189,
    valuationGBP: 2125000,
    rentPerMonth: 7600,
    description: 'Lateral apartment spanning two stucco-fronted buildings with Hyde Park views.',
    coordinates: [-0.1771, 51.5118],
  },
];

const seed = async () => {
  try {
    await connectDatabase();

    const zone = await Zone.findOneAndUpdate(
      { slug: WESTMINSTER_SHOWCASE.slug },
      WESTMINSTER_SHOWCASE,
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await Property.deleteMany({ zone: zone._id });

    const enrichedProperties = PROPERTIES.map(({ coordinates, ...rest }) => {
      const rentalYield = Number(((rest.rentPerMonth * 12) / rest.valuationGBP * 100).toFixed(1));

      return {
        ...rest,
        zone: zone._id,
        rentalYield,
        location: {
          type: 'Point',
          coordinates,
        },
      };
    });

    await Property.insertMany(enrichedProperties);

    console.log(`Seeded ${enrichedProperties.length} properties for ${zone.name}.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed', error);
    process.exit(1);
  }
};

seed();
