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
    idIncubadora: {
      type: Number,
      required: true,
      ref: "Incubadora",
    },
    idSensores: {
      type: [Number],
      required: true,
    },
    idActivadores: {
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
