import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { IChatBotClient, asyncChat } from "./CommandLineChatBot";

const MAX_TOKENS = 100;
const MAX_TOTAL_TOKENS = 1000;
const CHAT_GPT_MODEL = "gpt-3.5-turbo";
const TOKEN_OVER_MESSAGE = "The maximum number of tokens allowed in this conversation has been exceeded.";

export class ChatGPTClient implements IChatBotClient{
    private chatLog: ChatCompletionRequestMessage[] = [];
    private spentToken = 0;
    private client: OpenAIApi;

    public constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.client = new OpenAIApi(configuration);
    }

    public chat: asyncChat = async (input: string): Promise<string> => {
        this.pushUserChat(input);

        if (this.spentToken > (MAX_TOTAL_TOKENS - MAX_TOKENS))
            return TOKEN_OVER_MESSAGE;

        try {
            const response = await this.client.createChatCompletion(
                {
                    model: CHAT_GPT_MODEL,
                    messages: this.chatLog,
                    max_tokens: MAX_TOKENS
                }
            );
            this.spentToken += response.data.usage?.total_tokens ?? 0;
            this.chatLog.push(response.data.choices[0].message as ChatCompletionRequestMessage);
            console.debug(`You spent ${this.spentToken} tokens.`)
            return response.data.choices[0].message?.content || "";
        } catch (error) {
            console.error(error);
            throw new Error("Error occured during call chatAPI.");
        }
    }

    private pushUserChat(text: string) {
        this.chatLog.push({ role: 'user', content: text });
    }

    public getChatLogs(): ChatCompletionRequestMessage[] {
        return this.chatLog;
    }
}