import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";


dotenv.config("../.env");

export const MailTrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Yatharth Mishra",
};
