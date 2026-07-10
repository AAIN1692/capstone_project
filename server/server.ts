import { createApp } from "./app";
import { seedIfEmpty } from "./db/seed";

const PORT = process.env.PORT || 4000;

seedIfEmpty();

const app = createApp();

app.listen(PORT, () => {
  console.log(`Sales Pulse API listening on port ${PORT}`);
});
