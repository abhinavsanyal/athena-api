// controllers/expert.controller.js

const Expert = require('../models/expert.model');

// Functions for creating, deleting, and managing experts go here

// Create a new expert
exports.createExpert = async (req, res) => {
    try {
        const expert = new Expert(req.body);
        await expert.save();
        res.status(201).json({ message: 'Expert created successfully', expert });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    }

// Get all experts
exports.getExperts = async (req, res) => {
    try {
        const experts = await Expert.find();
        res.status(200).json(experts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Get a single expert
exports.getExpert = async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id);
        res.status(200).json(expert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Update an expert
exports.updateExpert = async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id);
        if (expert == null) {
            return res.status(404).json({ message: 'Cannot find expert' });
        }
        if (req.body.name != null) {
            expert.name = req.body.name;
        }
        if (req.body.modelConfig != null) {
            expert.modelConfig = req.body.modelConfig;
        }
        const updatedExpert = await expert.save();
        res.status(200).json(updatedExpert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Delete an expert
exports.deleteExpert = async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id);
        if (expert == null) {
            return res.status(404).json({ message: 'Cannot find expert' });
        }
        await expert.remove();
        res.status(200).json({ message: 'Deleted expert' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
