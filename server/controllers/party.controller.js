const Party = require('../models/Party.model');

const getParties = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const parties = await Party.find(filter).sort({ name: 1 });
    res.json(parties);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createParty = async (req, res) => {
  try {
    const party = await Party.create(req.body);
    res.status(201).json(party);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updateParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const deleteParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndDelete(req.params.id);
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json({ message: 'Party deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getParties, getPartyById, createParty, updateParty, deleteParty };
