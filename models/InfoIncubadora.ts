import mongoose from "mongoose"

const InfoIncubadoraSchema = new mongoose.Schema(
  {
    _id: { type: Number, required: true },
    nombreIncubadora: { type: String, required: true },
    descripcion: { type: String, required: true },
    tempMin: { type: Number, required: true },
    tempMax: { type: Number, required: true },
    humedadMin: { type: Number, required: true },
    humedadMax: { type: Number, required: true },
    temperActual: { type: Number, required: true },
    humedActual: { type: Number, required: true },
    idSensores: [{ type: Number }],
    idActivadores: [{ type: Number }],
    edoDht11A: { type: Boolean, default: true },
    edoDht11B: { type: Boolean, default: true },
    edoCalefactor: { type: Boolean, default: false },
    edoHumificador: { type: Boolean, default: false },
    edoVentilador: { type: Boolean, default: false },
  },
  {
    collection: "infoincubadora",
    versionKey: false,
    timestamps: false,
  },
)

export default mongoose.models.InfoIncubadora || mongoose.model("InfoIncubadora", InfoIncubadoraSchema)
