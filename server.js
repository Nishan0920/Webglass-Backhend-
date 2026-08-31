import dotenv from "dotenv";

dotenv.config();

import app from "./index.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`OptiFlow Backend listening on port ${PORT}`);
});