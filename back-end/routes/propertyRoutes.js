import express from "express";
import path from "path";
import upload from "../middleware/upload.js"; // ✅ ensure this file exists at backend/middleware/upload.js
import authMiddleware from "../middleware/authMiddleware.js";
import Property from "../models/PropertyModel.js"; // ✅ fix filename capitalization (match your import in controller)
import User from "../models/user.js";

const router = express.Router();

// ✅ Add Property Route (unchanged)
router.post(
  "/add",
  authMiddleware,
  upload.array("images", 5), // allow up to 5 images
  async (req, res) => {
    try {
      const {
        title,
        type,
        description,
        price,
        squareFeet,
        bedrooms,
        bathrooms,
        lat,
        lng,
        city,
        state,
        address,
      } = req.body;

      // Uploaded image paths
      const imagePaths = req.files?.map((file) => `/uploads/${file.filename}`) || [];

      const property = new Property({
        title,
        type,
        description,
        price,
        squareFeet,
        bedrooms,
        bathrooms,
        location: {
          lat: parseFloat(lat) || 0,
          lng: parseFloat(lng) || 0,
          address: address || "N/A",
          city: city || "N/A",
          state: state || "N/A",
        },
        images: imagePaths,
        owner: req.user.id, // auth middleware sets req.user
      });

      await property.save();
      res.status(201).json({ message: "Property added successfully", property });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// ✅ Fetch All Properties with Owner Info + Search & Filter
router.get("/", async (req, res) => {
  try {
    const { search, type } = req.query;

    // Build filter object dynamically
    const filter = {};

    if (type && type !== "all") {
      filter.type = type;
    }

    if (search && search.trim() !== "") {
      filter.$or = [
        { "location.city": { $regex: search, $options: "i" } },
        { "location.state": { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Populate owner name and email
    const properties = await Property.find(filter).populate({
      path: "owner",
      select: "name email", // only fetch name and email
    });

    // Transform data to match frontend expectation
    const formattedProperties = properties.map((prop) => ({
      id: prop._id,
      title: prop.title,
      description: prop.description,
      price: prop.price,
      sqft: prop.squareFeet,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      type: prop.type,
      status: prop.status,
      images: prop.images,
      location: prop.location || {
        address: "N/A",
        city: "N/A",
        state: "N/A",
        lat: 0,
        lng: 0,
      },
      ownerId: prop.owner?._id || null,
      ownerName: prop.owner?.name || "Unavailable",
      ownerEmail: prop.owner?.email || "Unavailable",
    }));

    res.status(200).json(formattedProperties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
});

export default router;
