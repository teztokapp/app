import "dotenv/config";
import { createYoktezApp } from "./app.js";

const app = createYoktezApp();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`YOK Tez standalone server listening on http://localhost:${port}`);
});
