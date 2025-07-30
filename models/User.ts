import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    primerApell: {
      type: String,
      required: true,
    },
    segundoApell: {
      type: String,
      default: "",
    },
    numTel: {
      type: String,
      required: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
    },
    contrasena: {
      type: String,
      required: true,
    },
    idRol: {
      type: Number,
      required: true,
      ref: "Role",
    },
  },
  {
    timestamps: true,
    _id: false,
  },
)

export default mongoose.models.User || mongoose.model("User", UserSchema, "USUARIOS")
