import mongoose from "mongoose"

const HistorialTempSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fechaRegistro: {
      type: Date,
      required: true,
    },
    idInfoIncubadora: {
      type: Number,
      required: true,
      ref: "InfoIncubadora",
    },
    idSensor: {
      type: Number,
      required: true,
      ref: "Sensor",
    },
    temperatura: {
      type: mongoose.Schema.Types.Mixed, // Puede ser double o int
      required: true,
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.HistorialTemp || mongoose.model("HistorialTemp", HistorialTempSchema, "HISTORIALTEMP")
