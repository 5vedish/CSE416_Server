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

app.use(express.json());

app.get("/", (req, res) => res.send("Express + TypeScript Server"));

app.post("/create_question", async (req, res) => {
  res.status(200).json({
    prisma: await prisma.user.create({
      data: {
        question: "How does this question look?",
        choices: ["Good!", "Bad.", "~Smexy~", "No comment..."],
        answerIndex: 0,
      },
    }),
  });
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at ${PORT}`);
});
