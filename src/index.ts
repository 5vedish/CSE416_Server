import express from "express";
import cors from "cors";
import { PrismaClient } from ".prisma/client";
const app = express();

const PORT = process.env.PORT || 8080;

const prisma = new PrismaClient();

app.use(
  cors({
    origin: "https://cse416democlient.herokuapp.com",
    credentials: true,
  })
);

app.options("*", cors);

app.get("/", (req, res) => res.send("Express + TypeScript Server"));

app.post("/test", async (req, res) => {
  res.status(200).json({
    prisma: await prisma.user.create({
      data: {
        email: "penis@gmail.com",
        name: "kyle",
        question_bank: {
          create: [],
        },
      },
    }),
  });
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at ${PORT}`);
});
