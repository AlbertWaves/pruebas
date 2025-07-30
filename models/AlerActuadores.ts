import mongoose from "mongoose"

const AlerActuadoresSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    fechaRegistro: {
      type: Date,
      required: true,
    },
    idActuador: {
      type: Number,
      required: true,
      ref: "Actuadores",
    },
    idInfoIncubadora: {
      type: Number,
      required: true,
      ref: "InfoIncubadora",
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.AlerActuadores ||
  mongoose.model("AlerActuadores", AlerActuadoresSchema, "ALERACTUADORES")
