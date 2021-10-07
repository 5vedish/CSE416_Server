import express from 'express';
const app = express();

const PORT = process.env.PORT || 8080;

app.get('/', (req,res) => res.send('Express + TypeScript Server'));

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at ${PORT}`);
});