import mongoose from "mongoose"

const EdoSensoresSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    edoCalefactor: {
      type: Boolean,
      required: true,
    },
    edoDht11A: {
      type: Boolean,
      required: true,
    },
    edoDht11B: {
      type: Boolean,
      required: true,
    },
    edoHumificador: {
      type: Boolean,
      required: true,
    },
    edoVentilador: {
      type: Boolean,
      required: true,
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.EdoSensores || mongoose.model("EdoSensores", EdoSensoresSchema, "EDOSENSORES")
