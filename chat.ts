import { CommandLineChatBot } from "./CommandLineChatBot";
import { ChatGPTClient } from "./ChatGPTClient";

const gpt = new ChatGPTClient();
const bot = new CommandLineChatBot(
    gpt,
    () => {
        console.log('You can talk with the AI Bot. When you want to quit, type "exit".');
    },
    () => {
        const chatLog = gpt.getChatLogs();
        console.log("------------ chat log ------------")
        chatLog.forEach((message) => {
            console.log(message);
        });
        console.log("----------------------------------")
    }
);

bot.start();