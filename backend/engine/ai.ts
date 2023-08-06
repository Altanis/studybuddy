import dotenv from "dotenv";
dotenv.config();

import { Configuration, OpenAIApi } from "openai";
import { Conversation, Game } from "../types/models";
import { db, Database } from "../firebase/db";

export const SYSTEM_INSTRUCTION = `
Your name is Assistant. You are a chatbot that helps students study for their exams.
You are currently in a conversation with a student. Your goal is to help them study for their exam.
You can do this by asking them questions about the topic they are studying.

The topic they are studying is: {{topic}}.
They request for a {{difficulty}} difficulty exam.

Do not give generic questions, such as "what is the definition of <x>". Give sophisticated and thought out questions.

When you ask a question, make sure to precede the question with and only with "Question:".
When you say anything else, make sure to precede the response with and only with "Response:".
When you rate out of 10, make sure to precede the rating with "Rating:".

When the student answers a question, rate their answer out of 10 points. Give a description as to what they did well and what they can improve on.
Be generous to answers which are generally correct, and harsh to answers which are not correct. 
If it is wrong or incomplete, make the rating between 0-2. If it is wrong but the reasoning is acceptable, vary it in between 2-8. If the answer is right, give it a 9-10.

Make each question worth 10 points.
Ensure that every message you make has a question in it, and every message after your first one has a rating and response and a question.

This marks the start of the conversation.
Assistant [asks a question]:
`;

/** A wrapper around GPT 3.5 to parse and analyze completion results. */
class AIEngine
{
    /** The OpenAI model. */
    public model = "gpt-3.5-turbo";
    /** The API to query for completions. */
    public api: OpenAIApi = new OpenAIApi(new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    }));
    /** The database to continuously store the conversation in. */
    public db: Database = db;

    /** Generate a response to the current conversation. */
    public async generateResponse(game: Game): Promise<{ message: string, rating: number, response: string, question: string } | string>
    {
        return new Promise((res, rej) => 
        {
            setTimeout(() =>
            {
                rej("An error occured while generating a response. Please try again later.")
            }, 10_000);

            this.api.createChatCompletion({
                model: this.model,
                messages: game.interaction
                    .map(({ role, content }) => {
                        return { role, content };
                    }),
                temperature: 1,
                max_tokens: 150,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            })
                .then(reply => {
                    const { choices } = reply.data;
                    let message = choices[0].message?.content;
                    if (!message) return rej("An error occurred while generating a response. Please try again later.");
                    
                    const { rating, response, question } = this.parseResponse(message, !game.answeredQuestions);

                    if (rating > 5) game.correctQuestions++;
                    game.finished = ++game.answeredQuestions >= game.totalQuestions;
                    game.interaction.push({ role: "assistant", content: message, parsed: { rating, response, question: game.finished ? "" : question } });

                    this.db.update("games", game.id, game);
                    res({ message, rating, response, question: game.finished ? "" : question });
                })
                .catch(err => {
                    console.error(err);
                    rej("An error occurred while generating a response. Please try again later.");
                });
        });
    };

    /** Parses a response into a rating, response, and question. */
    public parseResponse(reply: string, implicitQuestion = false): { rating: number, response: string, question: string }
    {
        let rating = -1;
        let response = "";
        let question = "";

        console.log(reply);

        const lines = reply.split("\n");
        for (const line of lines)
        {
            if (line.toLowerCase().startsWith("rating:"))
            {
                const ratingString = line.split(":")[1].trim();
                rating = parseInt(ratingString.split("/")[0]);
            }
            else if (line.toLowerCase().startsWith("question:"))
            {
                question = line.split(":")[1].trim();
            }
            else if (line.toLowerCase().startsWith("response:"))
            {
                response += line.split(":")[1].trim() + "\n";
            }
            else
            {
                if (implicitQuestion) question += line.trim() + "\n";
                else response += line.trim() + "\n";
            }
        };

        return { rating, response, question };
    };
};

export const ai = new AIEngine();