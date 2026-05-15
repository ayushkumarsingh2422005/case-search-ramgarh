const mongoose = require('mongoose');

const InvestigatingOfficerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'investigatingOfficers',
});

const InvestigatingOfficer =
  mongoose.models.InvestigatingOfficer ||
  mongoose.model('InvestigatingOfficer', InvestigatingOfficerSchema);

module.exports = InvestigatingOfficer;
