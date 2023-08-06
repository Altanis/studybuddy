"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../firebase/db");
const ai_1 = require("../engine/ai");
const GameRouter = (0, express_1.Router)();
GameRouter.route("/create")
    .post(async function (req, res) {
    const { topic, difficulty, totalQuestions } = req.body;
    let { uid } = req.client;
    if (!topic || ![0, 1, 2].includes(difficulty) || !totalQuestions)
        return res.status(400).json({ message: "Missing required fields." });
    if (totalQuestions < 1 || totalQuestions > 10)
        return res.status(400).json({ message: "Invalid number of questions." });
    if (topic.length > 50)
        return res.status(400).json({ message: "Topic is too long." });
    const gameID = db_1.db.generateID("games");
    const user = db_1.db.get("users", () => { }, 1, uid)[0];
    if (!user)
        return res.status(404).json({ message: "Could not find user." });
    const existingGames = user.games.map(g => db_1.db.get("games", () => { }, 1, g)[0]);
    if (existingGames.filter(g => !g.finished).length)
        return res.status(400).json({ message: "You already have an unfinished game." });
    const instruction = ai_1.SYSTEM_INSTRUCTION
        .replace("{{topic}}", topic)
        .replace("{{difficulty}}", difficulty == 0 ? "easy" : (difficulty == 1 ? "medium" : "hard"));
    const game = {
        topic,
        difficulty,
        totalQuestions,
        correctQuestions: 0,
        answeredQuestions: -1,
        finished: false,
        id: gameID,
        user,
        timestamp: Date.now(),
        interaction: [{ role: "system", content: instruction }]
    };
    await db_1.db.add("games", gameID, game);
    user.games.push(gameID);
    await db_1.db.update("users", uid, user);
    ai_1.ai.generateResponse(game)
        .then(() => res.status(200).json({ message: "Successfully created game.", id: gameID }))
        .catch(err => console.error("Failed to generate response:", err));
});
GameRouter.route("/info/:id")
    .get(async function (req, res) {
    const { id } = req.params;
    const game = db_1.db.get("games", () => { }, 1, id)[0];
    if (!game)
        return res.status(404).json({ message: "Could not find game." });
    return res.status(200).json({
        message: "Successfully retrieved game info.",
        game: {
            id: game.id,
            topic: game.topic,
            difficulty: game.difficulty,
            totalQuestions: game.totalQuestions,
            answeredQuestions: game.answeredQuestions,
            correctQuestions: game.correctQuestions,
            finished: game.finished,
            timestamp: game.timestamp,
            interaction: game.interaction.slice(1),
            user: {
                id: game.user.id,
                name: game.user.name,
                games: game.user.games
            }
        }
    });
});
GameRouter.route("/answer/:id")
    .post(async function (req, res) {
    const { id } = req.params;
    const { answer } = req.body;
    if (!answer)
        return res.status(400).json({ message: "Missing required fields." });
    const game = db_1.db.get("games", () => { }, 1, id)[0];
    if (!game)
        return res.status(404).json({ message: "Could not find game." });
    if (game.finished)
        return res.status(400).json({ message: "Game is already finished." });
    if (game.interaction[game.interaction.length - 1].role !== "assistant")
        return res.status(400).json({ message: "It is not your turn to answer." });
    if (req.user?.id !== game.user.id)
        return res.status(400).json({ message: "You are not the owner of this game." });
    game.interaction.push({ role: "user", content: answer });
    ai_1.ai.generateResponse(game)
        .then(reply => {
        const { rating, response, question } = reply;
        return res.status(200).json({
            message: "Successfully generated response.",
            rating,
            response,
            question,
            finished: game.finished,
            correctQuestions: game.correctQuestions,
        });
    })
        .catch(err => {
        console.error(err);
        return res.status(500).json({ message: "An error occurred while generating a response. Please try again later." });
    });
});
exports.default = GameRouter;
