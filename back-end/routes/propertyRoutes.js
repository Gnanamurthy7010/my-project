import express from "express";
import path from "path";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Property from "../models/PropertyModel.js";
import User from "../models/user.js";

const router = express.Router();

// ✅ ADD PROPERTY
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

      // Store image paths
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
        owner: req.user.id,
      });

      await property.save();
      res.status(201).json({ message: "Property added successfully", property });
    } catch (error) {
      console.error("Add Property Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// ✅ FETCH ALL PROPERTIES
router.get("/", async (req, res) => {
  try {
    const { search, type } = req.query;
    const filter = {};

    if (type && type !== "all") filter.type = type;
    if (search && search.trim() !== "") {
      filter.$or = [
        { "location.city": { $regex: search, $options: "i" } },
        { "location.state": { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const properties = await Property.find(filter).populate({
      path: "owner",
      select: "name email",
    });

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
    console.error("Fetch Properties Error:", error);
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
});

// ✅ DELETE PROPERTY
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Ensure only the owner can delete
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete Property Error:", error);
    res.status(500).json({ message: "Failed to delete property", error: error.message });
  }
});

export default router;
