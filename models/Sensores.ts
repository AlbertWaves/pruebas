import mongoose from "mongoose"

const SensoresSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    nombreSensor: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.Sensores || mongoose.model("Sensores", SensoresSchema, "SENSORES")
