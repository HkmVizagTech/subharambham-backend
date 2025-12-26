const mongoose = require("mongoose");

const SubharambhamCollegeSchema = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "subharambham_colleges",
  }
);

SubharambhamCollegeSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model(
  "SubharambhamCollege",
  SubharambhamCollegeSchema
);
