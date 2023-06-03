// controllers/farmController.js
const Farm = require("../models/Farm");
const Animal = require("../models/Animal");

// Create a new Farm
exports.create_farm = async (req, res) => {
  const farm = new Farm({
    farm_name: req.body?.farm_name,
    farm_address: req.body?.farm_address,
    farm_capacity: req.body?.farm_capacity,
  });
  try {
    await farm.save();
    return res.status(200).json({
      success: true,
      message: [],
      farm,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err,
    });
  }
};

// Get new farm
exports.get_farms = async (req, res) => {
  try {
    const farms = await Farm.find();
    return res.status(200).json({
      success: true,
      message: [],
      data: farms,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

//Get Farm By Id
exports.getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm)
      return res.status(404).json({
        success: false,
        message: `No farm is found with id ${req.params.id}`,
      });
    return res.status(200).json({
      success: true,
      message: [],
      data: farm,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: ["Server Error try again"],
      error: err,
    });
  }
};

// Get Animals Details By a Farm_Id
exports.getAnimalByFarm_uuid = async (req, res) => {
  try {
    const animals = await Animal.find({ farm_Id: req.params.id });
    if (animals.length === 0)
      return res.status(404).json({
        success: false,
        message: `No animals is found with id ${req.params.id}`,
      });
    return res.status(200).json({
      success: true,
      message: [],
      data: animals,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: ["Server Error try again"],
      error: err,
    });
  }
};
