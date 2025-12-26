// Backfill missing orderId for SubharambhamCollege
const mongoose = require("mongoose");
const SubharambhamCollege = require("../src/models/SubharambhamCollege.model");
const Counter = require("../src/models/Counter.model");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/subharambham";

async function main() {
  await mongoose.connect(MONGO_URI);
  const colleges = await SubharambhamCollege.find({
    $or: [{ orderId: { $exists: false } }, { orderId: null }],
  }).sort({ createdAt: 1 });
  if (!colleges.length) {
    console.log("No colleges missing orderId.");
    return mongoose.disconnect();
  }
  let counter = await Counter.findById("subharambham_colleges");
  let nextOrderId = counter ? counter.seq + 1 : 1;
  for (const college of colleges) {
    college.orderId = nextOrderId++;
    if (college.displayOrder === undefined || college.displayOrder === null) {
      college.displayOrder = college.orderId;
    }
    await college.save();
    console.log(`Updated: ${college.name} -> orderId ${college.orderId}`);
  }
  await Counter.findByIdAndUpdate(
    "subharambham_colleges",
    { seq: nextOrderId - 1 },
    { upsert: true }
  );
  console.log("Backfill complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error during backfill:", err);
  mongoose.disconnect();
});
