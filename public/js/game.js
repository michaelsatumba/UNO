const socket = io();

// Listens for gameState object, then uses the data to update the page to all users.
socket.on('updateGameState', gameState => {
    console.log("Gamestate=", gameState);
    updateGamePage(gameState);
});

// Informs other players of chosen Wild card color by alert().
socket.on('wildCard', (color) => {
    alert('Color chosen was ' + color);
});

// ON PAGE LOAD:
window.addEventListener('DOMContentLoaded', (event) => {
    let URL = window.location.href;
    let gameId = URL.split('/')[4];
    getGameData(gameId);
});

// Fetches gameState data from back-end:
function getGameData(gameId) {
    fetch(`/games/${gameId}/gamestate`, { method:'get' })
    .then((response) => response.json())
    .then((gameData) => {
        createGameState(gameData);
    })
    .catch(console.log);
}

/* 
--- gameData info ---
gameData[0] = game_players array
gameData[1] = game_cards array
gameData[2] = direction (int)

--- game_players -> array of objects ---
fields: user_id, game_id, current_player, order

--- game_cards -> array of objects ---
fields: card_id, user_id, game_id, order, discarded, active_discard, draw_pile
*/

// Creates initial gameState object and passes to updateGamePage:
function createGameState(gameData) {
    let gameState = {
        // Current game's id
        game_id: 0,
        // gameState info for all 4 users
        users: [],
        active_discard: 0,
        discard: [], // Id of recent card in discard (TO change format if cards run out?)
        draw_pile: [], // Id of top of deck card_id (To change format?)
        direction: 0,
        winner: 0 // Order # of user that has won (if 0, game will continue running)
    };

    let game_players = gameData[0];
    let game_cards = gameData[1];
    let game_direction = gameData[2].direction;

    // fields: user_id, game_id, current_player, order
    let player1, player2, player3, player4;
    let player1active, player2active, player3active, player4active;
    player1active = player2active = player3active = player4active = false;

    // Setting other active players as determined by game_players
    for(let i = 0; i < game_players.length; i++) {
        switch(i) {
            case 0: player1 = game_players[i]; player1active = true; break;
            case 1: player2 = game_players[i]; player2active = true; break;
            case 2: player3 = game_players[i]; player3active = true; break;
            case 3: player4 = game_players[i]; player4active = true; break;
        }
    }

    // Declare variables whose values will be added to gameState object.
    let player1Cards = [];
    let player2Cards = [];
    let player3Cards = [];
    let player4Cards = [];
    let discardedCards = [];
    let drawpileCards = [];
    let activeDiscard = 0;
    let winner = 0;

    // Go through game_cards, add cards to respective arrays.
    // (i.e., which cards are in the draw pile, in discard, in P2's hand, etc.)
    for(let i = 0; i < game_cards.length; i++) {
        if(game_cards[i].draw_pile == 1) {
            drawpileCards.push(game_cards[i].card_id);
        }
        if(game_cards[i].discarded == 1) {
            discardedCards.push(game_cards[i].card_id);
            if(game_cards[i].active_discard == 1) {
                activeDiscard = game_cards[i].card_id;
            }
        }
        else {
            if(player1active) {
                if(game_cards[i].user_id == player1.user_id &&
                    game_cards[i].draw_pile == 0 && game_cards[i].discarded == 0) {
                        player1Cards.push(game_cards[i].card_id);
                }
            }
            if(player2active) {
                if(game_cards[i].user_id == player2.user_id &&
                    game_cards[i].draw_pile == 0 && game_cards[i].discarded == 0) {
                        player2Cards.push(game_cards[i].card_id);
                }
            }
            if(player3active) {
                if(game_cards[i].user_id == player3.user_id &&
                    game_cards[i].draw_pile == 0 && game_cards[i].discarded == 0) {
                        player3Cards.push(game_cards[i].card_id);
                    }
            }
            if(player4active) {
                if(game_cards[i].user_id == player4.user_id &&
                    game_cards[i].draw_pile == 0 && game_cards[i].discarded == 0) {
                        player4Cards.push(game_cards[i].card_id);
                    }
            }
        }
    }

    // CHECK WIN CONDITION:
    if(player1Cards.length < 1 && player1active) {
        console.log("Player", player1.order, "has won the game!");
        // winner = player1.order;
        winner = player1.user_id;
    } else if (player2Cards.length < 1 && player2active) {
        console.log("Player", player2.order, "has won the game!");
        // winner = player2.order;
        winner = player2.user_id;
    } else if (player3Cards.length < 1 && player3active) {
        console.log("Player", player3.order, "has won the game!");
        // winner = player3.order;
        winner = player3.user_id;
    } else if (player4Cards.length < 1 && player4active) {
        console.log("Player", player4.order, "has won the game!");
        // winner = player4.order;
        winner = player4.user_id;
    } 
    // SHOW WHEN DRAW PILE CARDS ARE EMPTY (TO REMOVE):
    else if(drawpileCards.length < 1) {
        console.log("Draw pile cards are empty!!!");
    } 

    // Update the gameState object value
    gameState.game_id = player1.game_id;

    if(player1active) {
        gameState.users.push({
            user_id: player1.user_id, // Id of player
            current_player: player1.current_player, // Is it their turn? (0 = No, 1 = Yes)
            order: player1.order, // What order do they play (1-4)
            cards: player1Cards
        });
    }
    if(player2active) {
        gameState.users.push({
            user_id: player2.user_id, // Id of player
            current_player: player2.current_player, // Is it their turn? (0 = No, 1 = Yes)
            order: player2.order, // What order do they play (1-4)
            cards: player2Cards
        });
    }
    if(player3active) {
        gameState.users.push({
            user_id: player3.user_id, // Id of player
            current_player: player3.current_player, // Is it their turn? (0 = No, 1 = Yes)
            order: player3.order, // What order do they play (1-4)
            cards: player3Cards
        });
    }
    if(player4active) {
        gameState.users.push({
            user_id: player4.user_id, // Id of player
            current_player: player4.current_player, // Is it their turn? (0 = No, 1 = Yes)
            order: player4.order, // What order do they play (1-4)
            cards: player4Cards
        });
    }
    gameState.active_discard = activeDiscard;
    gameState.discard = discardedCards;
    gameState.draw_pile = drawpileCards;
    gameState.direction = game_direction;
    gameState.winner = winner;

    // Update gameState object
    socket.emit('updateGameState', gameState);
}

// gameState = {
//     game_id,
//     users: [
//         {
//             user_id,
//             current_player,
//             order,
//             cards = []
//         },
//     ],
//     discard = [],
//     draw_pile = [],
//     direction,
//     winner
// }

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function updateGamePage(gameState) {
    if(gameState.winner != 0) {
        let userId = gameState.winner;
        // If there is a winner, stop updating the page.
        fetch(`/users/${userId}`, { method: 'get' })
        .then((response) => response.json())
        // Returns user object with fields user.id and user.username
        .then((user) => {
            /* REMOVE All player's cards from deck */
            const myDeck = document.getElementById('mydeck');
            const deck2 = document.getElementById('deck2');
            const deck3 = document.getElementById('deck3');
            const deck4 = document.getElementById('deck4');
            removeAllChildNodes(myDeck);
            removeAllChildNodes(deck2);
            removeAllChildNodes(deck3);
            removeAllChildNodes(deck4);

            // Updates discard pile before ending game
            let discardPile = document.getElementById('discarded');
            removeAllChildNodes(discardPile);
            let discardCardId = gameState.active_discard;
            let discardHTML = `<img class="middle-card-image" src="../assets/card_${discardCardId}.png" alt="Top of discard">`;
            discardPile.innerHTML = discardHTML;

            /* DISPLAY THE WINNER'S USERNAME */
            let winnerId = user.id;
            let winnerName = user.username;
            let winnerDiv = document.getElementById('winner');
            let winnerHTML = `<h1><b>${winnerName} has won the game!</b></h1>`;
            winnerDiv.innerHTML = winnerHTML;
        })
        .catch(console.log);

    } 

    else {
        /* UPDATE CURRENT USER'S CARDS */
        const myDeck = document.getElementById('mydeck');
        removeAllChildNodes(myDeck);

        fetch('/user', { method: 'get' })
        .then((response) => response.json())
        // Returns user object with fields user.id and user.username
        .then((user) => {
            let currentUser;
            for(let i = 0; i < gameState.users.length; i++) {
                if(gameState.users[i].user_id == user.id) {
                    currentUser = gameState.users[i];
                }
            }
            let currentUserOrder = currentUser.order;
            let orderArr = [1,2,3,4]; // 3,4,1,2
            while(orderArr[0] != currentUserOrder) {
                let value = orderArr.shift();
                orderArr.push(value);
            }

            for(let i = 0; i < currentUser.cards.length; i++) {
                let card = document.createElement('div');
                let cardId = currentUser.cards[i];
                card.setAttribute("id", `card-${cardId}`);
                card.innerHTML = `<img src="../assets/card_${cardId}.png" data-id="${cardId}">`
                myDeck.appendChild(card);
            }

            /* UPDATING OTHER PLAYER'S CARDS */
            const deck2 = document.getElementById('deck2');
            const deck3 = document.getElementById('deck3');
            const deck4 = document.getElementById('deck4');
            removeAllChildNodes(deck2);
            removeAllChildNodes(deck3);
            removeAllChildNodes(deck4);

            for (let i = 0; i < gameState.users.length; i++) {
                for(let j = 1; j < orderArr.length; j++) {
                    if(gameState.users[i].order == orderArr[j]) {
                        for(let k = 0; k < gameState.users[i].cards.length; k++) {
                            let card = document.createElement('div');
                            let cardId = gameState.users[i].cards[k];
                            card.setAttribute("id", `card-${cardId}`);
                            card.innerHTML = `<img src="../assets/card_deck.png" alt="player-${orderArr[j]}-card">`
                            // myDeck.appendChild(card);
                            switch(j) {
                                case 1:
                                    deck2.appendChild(card);
                                    break;
                                case 2:
                                    deck3.appendChild(card);
                                    break;
                                case 3:
                                    deck4.appendChild(card);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }

            // Update active_discard on discard deck
            let discardPile = document.getElementById('discarded');
            removeAllChildNodes(discardPile);
            let discardCardId = gameState.active_discard;
            let discardHTML = `<img class="middle-card-image" src="../assets/card_${discardCardId}.png" alt="Top of discard">`;
            discardPile.innerHTML = discardHTML;

            // Update Draw Pile visiblity
            // (If there's available draw cards, show back of card)
            let drawPile = document.getElementById('draw-pile-deck');
            removeAllChildNodes(drawPile);
            if(gameState.draw_pile.length > 0) {
                let drawPileHTML = `<img src="../assets/card_deck.png" alt="draw-pile-deck">`;
                drawPile.innerHTML = drawPileHTML;
            }
            else {
                let drawPileHTML = `<img src="../assets/card_empty.png" alt="draw-pile-deck">`
                drawPile.innerHTML = drawPileHTML;
            }

        })
        .catch(console.log);
    }

    
}

function uno() {
  alert("Winner winner chicken dinner!")
}

// GAME CHAT JAVASCRIPT:
socket.on('message', msgContent => {
    outputMessage(msgContent);
});

const chatForm = document.getElementById('game-chat-form');
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get message text by id
    const msg = event.target.elements.gamemsg.value;
    // Get's username from the DOM:
    let userDiv = document.getElementById('welcome-game-user');
    let username = userDiv.childNodes[1].textContent.split(' ')[1];
    let msgContent = [msg, username];

    // Emitting a message to the server
    socket.emit('chatMessage', msgContent);
});

// Output message to DOM
function outputMessage(msgContent) {
    let message = msgContent[0];
    let username = msgContent[1];
    // Creates div element for each message to add to chat-messages container.
    const div = document.createElement('div');
    div.classList.add('message');
    // TODO: Replace Date object with Moment.js?
    div.innerHTML = `<p class="chat-user">${username} <span>${new Date().toLocaleString()}</span> </p>
    <p class="chat-text">
        ${message}
    </p>`;
    let chatMsgs = document.querySelector('.chat-messages')
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

/* GAME INTERACTIONS JAVASCRIPT (FRONT-END) */

// PLAYING A CARD:
const myDeck = document.getElementById('mydeck');
myDeck.addEventListener('click', event => {
    event.preventDefault();
    // Getting card_id
    const { id } = event.target.dataset;
    // Get game_id by using URL of the page (not efficient?)
    let URL = window.location.href;
    let gameId = URL.split('/')[4];
    console.log("Clicked on card #", id);
    playCard(gameId, id);
});

// Sends played card info to server, receives gameState regardless.
async function playCard(gameId, cardId) {
    // let plusFourCardIds = [102, 104, 106, 108];
    // let wildCardIds = [101, 103, 105, 107];
    let wildExists = false;
    // Check for Wild cards played.
    // If Wild card is played, ask user for color?
    for(let i = 101; i < 109; i++) {
        if(cardId == i) {
            wildExists = true;
        }
    }

    if(wildExists) {
        // Post to a different fetch call: '/games/${gameId}/playwild/${cardId}'
        let color = chooseColor().toLowerCase();
        // Informs all players of chosen Wild card color.
        socket.emit('wildCard', color);
        if(cardId % 2 == 0) {
            console.log("Played a Plus FOUR card!");
            console.log("Chose color=", color);
        }
        else {
            console.log("Played a WILD card!");
            console.log("Chose color=", color);
        }
        await fetch(`/games/${gameId}/playwild/${cardId}/${color}`, { method: 'POST' })
        .then((response) => response.json())
        .then((gameData) => createGameState(gameData))
        .catch(console.log);
    }
    // A Non-Wild Card is played:
    else {
        await fetch(`/games/${gameId}/play/${cardId}`, { method: 'POST' })
        .then((response) => response.json())
        .then((gameData) => createGameState(gameData))
        .catch(console.log);
    }
}

// DRAW A CARD:
let drawCardDiv = document.getElementById('draw-card');
drawCardDiv.addEventListener('click', event => {
    event.preventDefault();
    let URL = window.location.href;
    let gameId = URL.split('/')[4];
    drawCard(gameId);
});

// Sends fetch to draw card, receives gameState regardless.
function drawCard(gameId) {
    console.log("Drawing a card in game#", gameId);
    fetch(`/games/${gameId}/draw`, {method: 'POST'})
    .then((response) => response.json())
    // .then((gameData) => console.log(gameData))
    .then((gameData) => createGameState(gameData))
    .catch(console.log);
}

// Prompts user to choose a VALID color using alert()
function chooseColor() {
    let red = "red";
    let blue = "blue";
    let green = "green";
    let yellow = "yellow";
    let validColor = false;
    let colorInput = prompt('Choose a color (Red, Blue, Green, Yellow)');

    switch(colorInput.toLowerCase()) {
        case red: validColor = true; break;
        case blue: validColor = true; break;
        case green: validColor = true; break;
        case yellow: validColor = true; break;
        default: validColor = false; break;
    }

    while(!validColor) {
        foo = prompt('Type here');
        switch(foo.toLowerCase()) {
            case red: validColor = true; break;
            case blue: validColor = true; break;
            case green: validColor = true; break;
            case yellow: validColor = true; break;
            default: validColor = false; break;
        }
    }

    return colorInput;
}
