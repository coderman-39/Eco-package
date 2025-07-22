import express from 'express';
import { body, validationResult } from 'express-validator';
import Package from '../models/Package.js';
import User from '../models/User.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all packages (with pagination and filters)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };
    
    // Apply filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { packageId: { $regex: search, $options: 'i' } },
        { rfidTag: { $regex: search, $options: 'i' } },
        { 'currentLocation.facility': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const packages = await Package.find(query)
      .populate('delivery.customerId', 'username firstName lastName')
      .populate('return.returnedBy', 'username firstName lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Package.countDocuments(query);

    res.json({
      packages,
      pagination: {
        currentPage: page * 1,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit * 1
      }
    });

  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      error: 'Failed to fetch packages',
      message: 'Internal server error'
    });
  }
});

// Get package by ID
router.get('/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;

    const packageData = await Package.findOne({ 
      $or: [
        { packageId: packageId.toUpperCase() },
        { rfidTag: packageId.toUpperCase() },
        { nfcTag: packageId }
      ],
      isActive: true
    })
    .populate('delivery.customerId', 'username firstName lastName email')
    .populate('return.returnedBy', 'username firstName lastName')
    .populate('trackingHistory.scannedBy', 'username firstName lastName');

    if (!packageData) {
      return res.status(404).json({
        error: 'Package not found',
        message: 'No package found with the provided ID'
      });
    }

    res.json({ package: packageData });

  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      error: 'Failed to fetch package',
      message: 'Internal server error'
    });
  }
});

// Create new package (admin/seller only)
router.post('/', requireRole(['admin', 'seller']), [
  body('packageId').isLength({ min: 1 }).withMessage('Package ID is required'),
  body('rfidTag').isLength({ min: 1 }).withMessage('RFID tag is required'),
  body('type').isIn(['cardboard', 'plastic', 'paper', 'fabric', 'composite']).withMessage('Invalid package type'),
  body('material').isLength({ min: 1 }).withMessage('Material is required'),
  body('size').optional().isObject(),
  body('sustainability').optional().isObject(),
  body('manufacturer').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      packageId,
      rfidTag,
      nfcTag,
      type,
      material,
      size,
      sustainability,
      manufacturer,
      tags
    } = req.body;

    // Check if package already exists
    const existingPackage = await Package.findOne({
      $or: [
        { packageId: packageId.toUpperCase() },
        { rfidTag: rfidTag.toUpperCase() },
        { nfcTag: nfcTag }
      ]
    });

    if (existingPackage) {
      return res.status(409).json({
        error: 'Package already exists',
        message: 'A package with this ID or tag already exists'
      });
    }

    // Create new package
    const newPackage = new Package({
      packageId: packageId.toUpperCase(),
      rfidTag: rfidTag.toUpperCase(),
      nfcTag,
      type,
      material,
      size,
      sustainability: {
        recyclable: true,
        biodegradable: false,
        carbonFootprint: 0,
        plasticContent: 0,
        recycledContent: 0,
        ...sustainability
      },
      manufacturer,
      tags,
      currentLocation: {
        type: 'Point',
        coordinates: [0, 0],
        facility: 'Manufacturing Facility',
        city: 'Unknown',
        state: 'Unknown'
      }
    });

    await newPackage.save();

    res.status(201).json({
      message: 'Package created successfully',
      package: newPackage
    });

  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({
      error: 'Failed to create package',
      message: 'Internal server error'
    });
  }
});

// Update package location and status
router.put('/:packageId/update-location', [
  body('location').isObject().withMessage('Location object is required'),
  body('status').optional().isIn(['manufactured', 'dispatched', 'in_transit', 'delivered', 'returned', 'processing', 'recycled', 'lost']),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { packageId } = req.params;
    const { location, status, notes } = req.body;

    const packageData = await Package.findOne({ 
      packageId: packageId.toUpperCase(),
      isActive: true
    });

    if (!packageData) {
      return res.status(404).json({
        error: 'Package not found',
        message: 'No package found with the provided ID'
      });
    }

    // Update location and status
    await packageData.updateLocation(location, status, req.user._id);

    // Add notes if provided
    if (notes) {
      packageData.notes = notes;
      await packageData.save();
    }

    res.json({
      message: 'Package location updated successfully',
      package: packageData
    });

  } catch (error) {
    console.error('Update package location error:', error);
    res.status(500).json({
      error: 'Failed to update package location',
      message: 'Internal server error'
    });
  }
});

// Process package return
router.post('/:packageId/return', [
  body('location').isObject().withMessage('Return location is required'),
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor', 'damaged']).withMessage('Invalid condition')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { packageId } = req.params;
    const { location, condition = 'good' } = req.body;

    const packageData = await Package.findOne({ 
      packageId: packageId.toUpperCase(),
      isActive: true
    });

    if (!packageData) {
      return res.status(404).json({
        error: 'Package not found',
        message: 'No package found with the provided ID'
      });
    }

    if (packageData.status === 'returned') {
      return res.status(400).json({
        error: 'Package already returned',
        message: 'This package has already been returned'
      });
    }

    // Process return
    await packageData.processReturn(req.user._id, location, condition);

    // Award tokens to user
    const user = await User.findById(req.user._id);
    await user.addPackageReturn(
      packageData.return.carbonSaved,
      packageData.return.plasticReduced
    );
    await user.addTokens(packageData.return.tokensAwarded, 'Package return');

    res.json({
      message: 'Package returned successfully',
      package: packageData,
      tokensAwarded: packageData.return.tokensAwarded,
      carbonSaved: packageData.return.carbonSaved,
      plasticReduced: packageData.return.plasticReduced
    });

  } catch (error) {
    console.error('Process return error:', error);
    res.status(500).json({
      error: 'Failed to process package return',
      message: 'Internal server error'
    });
  }
});

// Scan NFC/RFID tag
router.post('/scan', [
  body('tagId').isLength({ min: 1 }).withMessage('Tag ID is required'),
  body('location').optional().isObject(),
  body('iotData').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { tagId, location, iotData } = req.body;

    // Find package by RFID or NFC tag
    const package = await Package.findOne({
      $or: [
        { rfidTag: tagId.toUpperCase() },
        { nfcTag: tagId }
      ],
      isActive: true
    });

    if (!package) {
      return res.status(404).json({
        error: 'Package not found',
        message: 'No package found with the provided tag'
      });
    }

    // Update IoT data if provided
    if (iotData) {
      await package.updateIoTData(iotData);
    }

    // Update location if provided
    if (location) {
      await package.updateLocation(location, null, req.user._id);
    }

    res.json({
      message: 'Package scanned successfully',
      package: {
        id: package._id,
        packageId: package.packageId,
        status: package.status,
        currentLocation: package.currentLocation,
        iotData: package.iotData,
        environmentalScore: package.environmentalScore,
        age: package.age
      }
    });

  } catch (error) {
    console.error('Scan package error:', error);
    res.status(500).json({
      error: 'Failed to scan package',
      message: 'Internal server error'
    });
  }
});

// Get packages by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 50 } = req.query;

    const packages = await Package.getByStatus(status, limit);

    res.json({
      packages,
      count: packages.length
    });

  } catch (error) {
    console.error('Get packages by status error:', error);
    res.status(500).json({
      error: 'Failed to fetch packages by status',
      message: 'Internal server error'
    });
  }
});

// Get packages near location
router.get('/near/:longitude/:latitude', async (req, res) => {
  try {
    const { longitude, latitude } = req.params;
    const { maxDistance = 10000 } = req.query;

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    const packages = await Package.getNearLocation(coordinates, maxDistance);

    res.json({
      packages,
      count: packages.length,
      searchLocation: coordinates,
      maxDistance
    });

  } catch (error) {
    console.error('Get packages near location error:', error);
    res.status(500).json({
      error: 'Failed to fetch packages near location',
      message: 'Internal server error'
    });
  }
});

// Get package analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const analytics = await Package.getAnalytics();
    
    res.json({
      analytics: analytics[0] || {
        totalPackages: 0,
        activePackages: 0,
        returnedPackages: 0,
        totalCarbonSaved: 0,
        totalPlasticReduced: 0,
        avgEnvironmentalScore: 0
      }
    });

  } catch (error) {
    console.error('Get package analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch package analytics',
      message: 'Internal server error'
    });
  }
});

// Delete package (admin only)
router.delete('/:packageId', requireRole(['admin']), async (req, res) => {
  try {
    const { packageId } = req.params;

    const package = await Package.findOne({ 
      packageId: packageId.toUpperCase(),
      isActive: true
    });

    if (!package) {
      return res.status(404).json({
        error: 'Package not found',
        message: 'No package found with the provided ID'
      });
    }

    // Soft delete
    package.isActive = false;
    await package.save();

    res.json({
      message: 'Package deleted successfully'
    });

  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      error: 'Failed to delete package',
      message: 'Internal server error'
    });
  }
});

export default router; 