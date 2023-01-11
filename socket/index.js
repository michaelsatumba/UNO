const socketIo = require( 'socket.io' );

// Events
const LOBBY = 'lobby';
const USER_JOINED = 'user-joined';
const MESSAGE_SEND = 'message-send';

const init = ( app, server ) => {
  const io = socketIo( server );

  app.set( 'io', io );

  io.on( 'connection', socket => {
    console.log( 'client connected' );

    socket.on( 'disconnect', data => {
      console.log( 'client disconnected' );
    });

    socket.on( USER_JOINED, data => io.emit( USER_JOINED, data ));
    socket.on( MESSAGE_SEND, data => io.emit( MESSAGE_SEND, data ));

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
      io.emit('message', msg);
    });

    socket.on('updateGameState', (gameState) => {
      io.emit('updateGameState', gameState);
    });

    socket.on('wildCard', (color) => {
      io.emit('wildCard', color);
    });

  });
};

module.exports = { init };
