const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dateDebut: {
      type: Date,
      required: true,
    },
    dateFin: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate duration before saving
formationSchema.pre('save', function (next) {
  if (this.dateDebut && this.dateFin) {
    const start = new Date(this.dateDebut);
    const end = new Date(this.dateFin);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    if (months > 0) {
      this.duration = `${months} month${months > 1 ? 's' : ''}${days > 0 ? ` and ${days} day${days > 1 ? 's' : ''}` : ''}`;
    } else {
      this.duration = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  }
  next();
});

const Formation = mongoose.model('Formation', formationSchema);
module.exports = Formation;