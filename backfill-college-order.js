/*
  One-time migration script:
  - Ensures every document in `subharambham_colleges` has:
    - orderId (unique, never reused)
    - displayOrder (manual ordering; defaults to orderId)
  - Updates the `counters` collection for `_id = subharambham_colleges`

  Usage:
    node backfill-college-order.js

  Requires:
    MONGO_URI in .env
*/

require("dotenv").config();
const mongoose = require("mongoose");

const SubharambhamCollege = require("./src/models/SubharambhamCollege.model");
const Counter = require("./src/models/Counter.model");

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const colleges = await SubharambhamCollege.find({}).sort({
    createdAt: 1,
    _id: 1,
  });

  const existingOrderIds = colleges
    .map((c) => c.orderId)
    .filter((v) => typeof v === "number" && Number.isFinite(v));

  let nextOrderId = existingOrderIds.length
    ? Math.max(...existingOrderIds) + 1
    : 1;
  let maxOrderId = existingOrderIds.length ? Math.max(...existingOrderIds) : 0;

  let updatedCount = 0;

  for (const college of colleges) {
    const update = {};

    if (
      typeof college.orderId !== "number" ||
      !Number.isFinite(college.orderId)
    ) {
      update.orderId = nextOrderId;
      update.displayOrder = update.displayOrder ?? nextOrderId;
      maxOrderId = Math.max(maxOrderId, nextOrderId);
      nextOrderId += 1;
    }

    if (
      typeof college.displayOrder !== "number" ||
      !Number.isFinite(college.displayOrder)
    ) {
      update.displayOrder = update.displayOrder ?? college.orderId;
    }

    if (Object.keys(update).length > 0) {
      await SubharambhamCollege.updateOne(
        { _id: college._id },
        { $set: update }
      );
      updatedCount += 1;
    }
  }

  // Ensure counter is at least maxOrderId
  if (maxOrderId > 0) {
    await Counter.findByIdAndUpdate(
      "subharambham_colleges",
      { $max: { seq: maxOrderId } },
      { upsert: true }
    );
  }

  console.log(
    `Backfill complete. Updated ${updatedCount}/${colleges.length} colleges. Max orderId=${maxOrderId}.`
  );

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
