import mongoose from "mongoose"

const ActuadoresSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    nombreActuador: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
)

export default mongoose.models.Actuadores || mongoose.model("Actuadores", ActuadoresSchema, "ACTUADORES")
