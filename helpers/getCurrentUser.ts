import prisma from "@/database/prisma";

export default async function getCurrentUser(token: string) {
  const jwt = require("jsonwebtoken");
  const { id } = await jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return user;
}
