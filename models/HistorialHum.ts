import mongoose from "mongoose"

const HistorialHumSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fechaRegistro: {
      type: Date,
      required: true,
    },
    humedad: {
      type: mongoose.Schema.Types.Mixed, // Puede ser double o int
      required: true,
    },
    idInfoIncubadora: {
      type: Number,
      required: true,
      ref: "InfoIncubadora",
    },
    idComponente: {
      type: Number,
      required: true,
      ref: "Componentes",
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.HistorialHum || mongoose.model("HistorialHum", HistorialHumSchema, "HISTORIALHUM")
