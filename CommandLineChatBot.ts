import * as readline from "readline";

const EXIT_CHAT_WORD = "exit";
const USER_CHAT_PROMPT = "You: ";
const BOT_CHAT_PROMPT = "Bot: ";

export type asyncChat = (text: string) => Promise<string>;

export interface IChatBotClient {
    chat: asyncChat;
}

export class CommandLineChatBot {
    private rl: readline.Interface;
    private chatBot: IChatBotClient;
    private endCallback: () => void = () => { };
    private beforeCallback: () => void = () => { };

    public constructor(chatBot: IChatBotClient, beforeCallback?: () => void, endCallback?: () => void) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        this.chatBot = chatBot;
        if (beforeCallback) this.beforeCallback = beforeCallback;
        if (endCallback) this.endCallback = endCallback;
    }

    public async start(prompt = USER_CHAT_PROMPT) {
        this.beforeCallback();
        while (1) {
            try {
                await this.readLine(prompt, this.chatBot.chat);
            } catch (error) {
                console.error(error);
            }
        }
    }

    private end() {
        console.log("Exit chat.");
        this.endCallback();
        this.rl.close();
    }

    public async readLine(
        prompt: string,
        chatBot: asyncChat
    ): Promise<void> {
        return new Promise((resolve) => {
            this.rl.question(prompt, (input) => {
                if (input == EXIT_CHAT_WORD) {
                    this.end();
                    return;
                }
                const message = chatBot(input);
                message.then((value) => {
                    console.log(BOT_CHAT_PROMPT + value);
                    resolve();
                });
            });
        });
    }
}