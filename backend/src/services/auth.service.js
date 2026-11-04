import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { createToken } from "../utils/jwt.js";
import { publicUser } from "../utils/public-user.js";

function authenticationResponse(user) {
  return { user, token: createToken(user.id) };
}

export async function registerUser({ name, email, password }) {
  try {
    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 12) },
      select: publicUser,
    });
    return authenticationResponse(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "El correo ya está registrado");
    }
    throw error;
  }
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, "Correo o contraseña incorrectos");
  }

  return authenticationResponse({ id: user.id, name: user.name, email: user.email });
}
