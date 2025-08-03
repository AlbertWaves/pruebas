import mongoose from "mongoose"

const InfoIncubadoraSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    temperActual: {
      type: Number,
      required: true,
    },
    humedActual: {
      type: Number,
      required: true,
    },
    sensores: {
      type: [Number],
      required: true,
    },
    actuadores: {
      type: [Number],
      required: true,
    },
  },
  {
    _id: false,
    versionKey: false,
    timestamps: false,
  },
)

export default mongoose.models.InfoIncubadora ||
  mongoose.model("InfoIncubadora", InfoIncubadoraSchema, "INFOINCUBADORA")
