import mongoose from "mongoose"

const InfoIncubadoraSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    humedActual: {
      type: Number,
      required: true,
    },
    idEdoSensores: {
      type: Number,
      required: true,
      ref: "EdoSensores",
    },
    idIncubadora: {
      type: Number,
      required: true,
      ref: "Incubadora",
    },
    temperActual: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.InfoIncubadora ||
  mongoose.model("InfoIncubadora", InfoIncubadoraSchema, "INFOINCUBADORA")
