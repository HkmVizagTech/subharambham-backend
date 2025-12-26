const SubharambhamCollege = require("../models/SubharambhamCollege.model");
const Counter = require("../models/Counter.model");

const normalizeName = (value) => (value || "").toString().trim();
const parseOptionalPositiveInt = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
};

const listColleges = async (req, res) => {
  try {
    const colleges = await SubharambhamCollege.find({}).sort({
      displayOrder: 1,
      orderId: 1,
    });
    return res.json(colleges);
  } catch (error) {
    console.error("listColleges error:", error);
    return res.status(500).json({ error: "Failed to fetch colleges" });
  }
};

const nextCollegeOrderId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "subharambham_colleges",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const createCollege = async (req, res) => {
  try {
    const name = normalizeName(req.body?.name);
    if (!name) return res.status(400).json({ error: "College name required" });

    const requestedDisplayOrder = parseOptionalPositiveInt(
      req.body?.displayOrder
    );
    if (requestedDisplayOrder === null) {
      return res
        .status(400)
        .json({ error: "displayOrder must be a positive integer" });
    }

    const requestedOrderId = parseOptionalPositiveInt(req.body?.orderId);
    if (requestedOrderId === null) {
      return res
        .status(400)
        .json({ error: "orderId must be a positive integer" });
    }

    let orderId = requestedOrderId;
    if (orderId === undefined) {
      orderId = await nextCollegeOrderId();
    }
    const displayOrder = requestedDisplayOrder ?? orderId;
    const created = await SubharambhamCollege.create({
      name,
      orderId,
      displayOrder,
    });
    return res.status(201).json(created);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "College already exists" });
    }
    console.error("createCollege error:", error);
    return res.status(500).json({ error: "Failed to create college" });
  }
};

const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const name =
      req.body?.name !== undefined ? normalizeName(req.body?.name) : undefined;
    const displayOrder = parseOptionalPositiveInt(req.body?.displayOrder);
    const orderId = parseOptionalPositiveInt(req.body?.orderId);

    if (displayOrder === null) {
      return res
        .status(400)
        .json({ error: "displayOrder must be a positive integer" });
    }
    if (orderId === null) {
      return res
        .status(400)
        .json({ error: "orderId must be a positive integer" });
    }

    const update = {};
    if (name !== undefined) {
      if (!name)
        return res.status(400).json({ error: "College name required" });
      update.name = name;
    }
    if (displayOrder !== undefined) update.displayOrder = displayOrder;
    if (orderId !== undefined) update.orderId = orderId;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const updated = await SubharambhamCollege.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ error: "College not found" });
    return res.json(updated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "College already exists" });
    }
    console.error("updateCollege error:", error);
    return res.status(500).json({ error: "Failed to update college" });
  }
};

const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SubharambhamCollege.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "College not found" });
    return res.json({ ok: true });
  } catch (error) {
    console.error("deleteCollege error:", error);
    return res.status(500).json({ error: "Failed to delete college" });
  }
};

module.exports = {
  listColleges,
  createCollege,
  updateCollege,
  deleteCollege,
};
