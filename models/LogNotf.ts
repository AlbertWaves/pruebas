import mongoose from "mongoose"

const LogNotfSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fechaHora: {
      type: Date,
      required: true,
    },
    tipo: {
      type: String,
      required: true,
      enum: ["temperatura", "humedad"],
    },
    valor: {
      type: Number,
      required: true,
    },
    umbral: {
      type: Number,
      required: true,
    },
    condicion: {
      type: String,
      required: true,
      enum: ["mayor", "menor"],
    },
    idComponente: {
      type: Number,
      required: true,
      ref: "Componentes",
    },
  },
  {
    _id: false,
    versionKey: false,
    timestamps: false,
  },
)

export default mongoose.models.LogNotf || mongoose.model("LogNotf", LogNotfSchema, "LOGNOTF")
