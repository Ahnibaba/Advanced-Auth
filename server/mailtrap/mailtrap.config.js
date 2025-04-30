import { MailtrapClient } from "mailtrap"
import dotenv from "dotenv"

dotenv.config()


export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

// custom domain involving name.com - under verification
export const sender = {
  email: "hello@subdomain.advancedauth.live",
  name: "Mailtrap Test",
};

//demo domain - edet.aniebiet@lmu.edu.ng
// export const sender = {
//   email: "hello@demomailtrap.co",
//   name: "Mailtrap Test",
// };
