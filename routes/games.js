const express = require('express');
const router = express.Router();
const Games = require('../db/games');
const Cards = require('../db/cards');
const Users = require('../db/users');
const { ensureAuthenticated } = require('../config/auth');

/* GAME BY URL (only for users part of the game) */
router.get("/:id", ensureAuthenticated, function (req, res, next) {

    const { id } = req.params; // Game_id
    let gameId = parseInt(id);

    Games.userListByGame(gameId)
    // .then((response) => response.json())
    .then((results) => {
        let inGame = false;
        for(let i = 0; i < results.length; i++) {
            if(results[i].user_id == req.user.id) {
                inGame = true;
            }
        }
        if(inGame) {
            res.render('game', { id: gameId, name: req.user.username });
        } else {
            res.redirect('../lobby');
            res.render('lobby', {
                name: req.user.username
            });
        }
    })
    .catch(console.log);
});

/* CREATE GAME */
router.post("/create", (req, res) => {

    // Req.user.id gets the user_id of the current logged in user.
    Games.create(req.user.id, req.body.title)
    .then((id) => { 
        console.log(id);
        return id; 
    })
    // .then(({ id }) => res.json({ id }))
    .then(({id}) => {
        res.redirect(`/games/${id}`);
        res.render('game', { id, name: req.user.username });
    })
    .catch(console.log);
});

/* JOIN A SPECIFIC GAME (by ID) */
router.post("/:id/join", (req, res) => {
    const { id } = req.params; // Game_id to join specific game by URL
    // Current logged in user (req.user.id) wants to join game by game_id = id
    Games.join(req.user.id, id)
    .then(({id}) => {
        console.log({id});
        return ({id});
    })
    .then(({ id }) => res.json({ id }))
    .catch(console.log);
    
});

/* LISTS ALL GAMES FROM DATABASE */
router.post("/list", (req, res) => {
    Games.listGames()
    .then((results) => res.json(results))
    .catch(console.log);
});

/* GETS LIST OF USERS IN SPECIFIC GAME (by game_id) */
router.get("/:id/users", (req, res) => {
    const { id } = req.params;
    let gameId = parseInt(id);
    Games.userListByGame(gameId)
    .then((results) => res.json(results))
    .catch(console.log);
});

router.get("/:id/gamestate", (req, res) => {
    const { id } = req.params;
    let gameId = parseInt(id);
    Games.getGameState(gameId)
    .then((results) => res.json(results))
    .catch(console.log);
})

/* PLAYS A CARD IN GAME #(:id) */
router.post("/:id/play/:card", (req, res, next) => {
    const { id, card } = req.params; // Game_id = id, card_id = card
    let userId = req.user.id; // Activer user's id
    let gameId = parseInt(id); // Parse string gameId
    let cardId = parseInt(card); // Parse string cardId

    // Hard coding special cards (change to more efficient method)
    // First two Red, next two Blue, then two Green, two Yellow
    let plusTwoCardIds = [20, 23, 45, 48, 70, 73, 95, 98];
    let reverseCardIds = [21, 24, 46, 49, 71, 74, 96, 99];
    let skipCardIds = [22, 25, 47, 50, 72, 75, 97, 100];

    // let plusFourCardIds = [102, 104, 106, 108];
    // let wildCardIds = [101, 103, 105, 107];

    console.log(req.user.username, "played card #", cardId, "in game #", gameId);
    // PLAY CARD VALIDATION:
    Promise.all([Games.userListByGame(gameId), Games.getCardFromGame(gameId, cardId), Games.getUserFromGame(gameId, userId)])
    .then(([users, gameCard, gameUser]) => {
        // Make sure there are 4 players who joined the game before doing any interactions.
        if(users.length == 4) {
            for(let i = 0; i < users.length; i++) {
                // Make sure user is in the game
                if(users[i].user_id == userId) {
                    // User is in the game.
                    // Make sure the user holds this card:
                    if(gameCard.user_id == userId && gameCard.discarded == 0 
                        && gameCard.draw_pile == 0) {
                            // User does hold the card.
                            // Make sure it's the user's turn:
                            if(gameUser.current_player) {
                                // It is the user's turn.
                                console.log("It is",req.user.username,"turn!");
                                // Can the card be played? (i.e. cant play Red 1 on Blue 2)
                                return Promise.all([
                                    users, gameCard, gameUser, 
                                    Games.getActiveDiscard(gameId)
                                ]);
                            }
                            else {
                                console.log("It is not this player's turn!");
                            }
                    }
                }
            }
        }
        else {
            console.log("There isn't 4 players in the game!");
        }
        // If Validation checks fail, send gameState back to front-end.
        Games.getGameState(gameId)
        .then((results) => {
            const response = JSON.stringify(results);
            res.end(response);
        })
        .catch(console.log);
    })
    .then(([users, gameCard, gameUser, discard]) => {
        // discard is an object
        // (user_id, game_id, card_id, order, discarded, active_discard, draw_pile)
        return Promise.all([
            gameCard, discard, gameUser,
            Cards.getTwoCardsByIds(gameCard.card_id, discard.card_id)
        ]);
    })
    .then(([gameCard, discard, gameUser, cards]) => {
        // Returns array of cards objects (id, color->string, displayName->string)
        let userCard, discardCard;
        if(cards[0].id == gameCard.card_id) {
            // Card[0] is user played card.
            userCard = cards[0];
            discardCard = cards[1];
        }
        else {
            // Card[1] is user played card.
            userCard = cards[1];
            discardCard = cards[0];
        }

        console.log("userCard=",userCard);
        console.log("discardCard=",discardCard);

        // SPECIAL CARDS CHECK: 
        let specialCard = false;
        // If a REVERSE card is played
        for(index in plusTwoCardIds) {
            if(cardId == plusTwoCardIds[index]) {
                console.log("Plus TWO card was played with cardId=", cardId);
                specialCard = true;
                let cardColor = userCard.color;
                Games.playPlusTwoCard(userCard.id, gameId, gameUser.order);
            }
        }
        for(index in reverseCardIds) {
            if(cardId == reverseCardIds[index]) {
                console.log("Reverse card was played with cardId=", cardId);
                specialCard = true;
                let cardColor = userCard.color;
                Games.playReverseCard(userCard.id, gameId, gameUser.order);
            }
        }
        for(index in skipCardIds) {
            if(cardId == skipCardIds[index]) {
                console.log("SKIP card was played with cardId=", cardId);
                specialCard = true;
                let cardColor = userCard.color;
                Games.playSkipCard(userCard.id, gameId, gameUser.order);
            }
        }
        // END SPECIAL CARDS CHECK

        if(!specialCard) {
            // Check if user selected card can be played against discard card.
            // First check if cards have the same colors:
            if(userCard.color == discardCard.color) {
                console.log("Cards have the same color!");
                Games.playValidCard(userCard.id, gameId, gameUser.order);
            }
            // Check if cards have same value:
            else if(userCard.displayName == discardCard.displayName) {
                console.log("Cards have the same value!");
                Games.playValidCard(userCard.id, gameId, gameUser.order);
            }
            // Check for Wild Cards:
            // (modify behavior later, act as every color card for now)
            else if(userCard.color == 'wild' || discardCard.color == 'wild') {
                console.log("There is a Wild card!");
                Games.playValidCard(userCard.id, gameId, gameUser.order);
            }
            else {
                console.log("Cards DONT share the same color/value!");
            }
        }

        // After playing a valid card, send gateState data to front-end.
        Games.getGameState(gameId)
        .then((results) => {
            const response = JSON.stringify(results);
            res.end(response);
        })
        .catch(console.log);
    })
    // .then((results) => console.log(results))
    .catch(console.log);

    Games.getGameState(gameId)
    .then((results) => res.json(results))
    .catch(console.log);

    // If all validations true, update the gameState
    // Then broadcast gameState to all users

    // If invalid, just update gameState
});

/* PLAYS A **WILD** CARD IN GAME #(:id) */
router.post("/:id/playwild/:card/:color", (req, res, next) => {
    const { id, card, color } = req.params; // Game_id = id, card_id = card
    let userId = req.user.id; // Activer user's id
    let gameId = parseInt(id); // Parse string gameId to int
    let cardId = parseInt(card); // Parse string cardId to int
    let cardColor = color; // String value

    // Hard coding Wild cardIds (change to more efficient method)
    let plusFourCardIds = [102, 104, 106, 108];
    let wildCardIds = [101, 103, 105, 107];

    console.log(req.user.username, "played card #", cardId, "in game #", gameId);
    // PLAY CARD VALIDATION:
    Promise.all([Games.userListByGame(gameId), Games.getCardFromGame(gameId, cardId), Games.getUserFromGame(gameId, userId)])
    .then(([users, gameCard, gameUser]) => {
        // Make sure there are 4 players who joined the game before doing any interactions.
        if(users.length == 4) {
            for(let i = 0; i < users.length; i++) {
                // Make sure user is in the game
                if(users[i].user_id == userId) {
                    // User is in the game.
                    // Make sure the user holds this card:
                    if(gameCard.user_id == userId && gameCard.discarded == 0 
                        && gameCard.draw_pile == 0) {
                            // User does hold the card.
                            // Make sure it's the user's turn:
                            if(gameUser.current_player) {
                                // It is the user's turn.
                                console.log(gameUser,"is playing a card on their turn!");
                                // Can the card be played? (i.e. cant play Red 1 on Blue 2)
                                return Promise.all([
                                    users, gameCard, gameUser, 
                                    Games.getActiveDiscard(gameId)
                                ]);
                            }
                            else {
                                console.log("It is not this player's turn!");
                            }
                    }
                }
            }
        }
        else {
            console.log("There isn't 4 players in the game!");
        }
        // If Validation checks fail, send gameState back to front-end.
        Games.getGameState(gameId)
        .then((results) => {
            const response = JSON.stringify(results);
            res.end(response);
        })
        .catch(console.log);
    })
    .then(([users, gameCard, gameUser, discard]) => {
        // discard is an object
        // (user_id, game_id, card_id, order, discarded, active_discard, draw_pile)
        return Promise.all([
            gameCard, discard, gameUser,
            Cards.getTwoCardsByIds(gameCard.card_id, discard.card_id)
        ]);
    })
    .then(([gameCard, discard, gameUser, cards]) => {
        // Returns array of cards objects (id, color->string, displayName->string)
        let userCard, discardCard;
        if(cards[0].id == gameCard.card_id) {
            // Card[0] is user played card.
            userCard = cards[0];
            discardCard = cards[1];
        }
        else {
            // Card[1] is user played card.
            userCard = cards[1];
            discardCard = cards[0];
        }

        console.log("userCard=",userCard);
        console.log("discardCard=",discardCard);

        if(userCard.id % 2 == 0) {
            // Played a Plus FOUR card!
            Games.playWildPlusFourCard(userCard.id, gameId, gameUser.order, cardColor);
        }

        else {
            // Played a WILD card!
            Games.playWildCard(userCard.id, gameId, gameUser.order, cardColor);
        }

        // After playing a valid card, send gateState data to front-end.
        Games.getGameState(gameId)
        .then((results) => {
            const response = JSON.stringify(results);
            res.end(response);
        })
        .catch(console.log);
    })
    .catch(console.log);
});

/* DRAWS A CARD IN GAME #(:id) */
router.post("/:id/draw", (req, res, next) => {
    // User in game? Is it their turn?
    // If so, Assign card from draw_pile, broadcast gameState
    const { id } = req.params;
    let gameId = parseInt(id);
    let userId = req.user.id;
    Promise.all([Games.userListByGame(gameId), Games.getUserFromGame(gameId, userId)])
    .then(([users, gameUser]) => {
        // Make sure there are 4 players who joined the game before doing any interactions.
        if(users.length == 4) {
            for(let i = 0; i < users.length; i++) {
                // Make sure user is in the game
                if(users[i].user_id == userId) {
                    // User is in the game.
                    // Is it the user's turn?
                    if(gameUser.current_player) {
                        // It is the user's turn.
                        Games.drawCard(gameId, userId, gameUser.order)
                        // .then((result) => console.log("Result is=", result))
                        .catch(console.log);
                    }
                    else {
                        console.log("It is not this player's turn!");
                    }
                }
            }
        }
        else {
            console.log("There isn't 4 players in the game!");
        }

        Games.getGameState(gameId)
        .then((results) => {
            const response = JSON.stringify(results);
            res.end(response);
        })
        .catch(console.log);
    })
    .catch(console.log);
});

module.exports = router;
