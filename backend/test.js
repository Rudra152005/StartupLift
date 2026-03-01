
// import dotenv from "dotenv";
// dotenv.config();
// import { sendEmail } from "./utils/sendEmail.js";

// (async () => {
//   try {
//     await sendEmail({
//       to: "shreyatpathi2607@gmail.com",
//       subject: "Test Email ✔",
//       html: "<h1>Email working!</h1><p>If you received this, Nodemailer works!</p>",
//     });
//   } catch (err) {
//     console.error(err);
//   }
// })();

import bcrypt from "bcryptjs";

const plain = "123456";
const hash = "$2b$10$iyLb/SX/QWmCmrSvs5KXhOXx62ReYJ07Dgm5je9lqhyhlPmp.bHSG";

const match = await bcrypt.compare(plain.trim(), hash.trim());
console.log(match); // should be true
