const Responses = require("response");
const Dynamo = require("Dynamo");
const WebSocket = require("WebsocketMessage");

const Ball = require("./objects/ball");
const Board = require("./objects/board");
const Paddle = require("./objects/paddle");

console.log(Board);

const tableName = "ball-bounce-backend";

function getPlayerID(connectionID,  record) {

    const { Player1, Player2, Spectators} = record;

    if (connectionID === Player1.connectionID) {
        return 1;
    } else if (connectionID === Player2.connectionID) {
        return 2;
    } else {
        spectator = Spectators.filter(spec => {
            return connectionID === spec.connectionID;
        });
        if (spectator.length === 1) {
            return 3;
        }
    }
    return 0;
}

function getPlayerConn(connectionID, record) {

    const { Player1, Player2, Spectators} = record;

    if (connectionID === Player1.connectionID) {
        return {
            conn: {
                domainName: Player1.domainName,
                stage: Player1.stage,
                connectionID: Player1.connectionID,
            },
            type: 1           // Player 1 type
        }   
    } else if (connectionID === Player2.connectionID) {
        return {
            conn: {
                domainName: Player2.domainName,
                stage: Player2.stage,
                connectionID: Player2.connectionID,
            },
            type: 2           // Player 2 type
        };
    } else {
        spectator = Spectators.filter(spec => {
            return connectionID === spec.connectionID;
        });
        if (spectator.length === 1) {
            return  {
                conn: {
                    domainName: spectator[0].domainName,
                    stage: spectator[0].stage,
                    connectionID: spectator[0].connectionID,
                }, 
                type: 3       // Spectator type
            };
        }
    }
}

async function sendToAll(messageStr, record) {

    const { Player1, Player2, Spectators} = record;

    if ('Player1' in record) {
        await WebSocket.send({
            domainName: Player1.domainName,
            stage: Player1.stage,
            connectionID: Player1.connectionID,
            message: messageStr
        });
    }

    if ('Player2' in record) {
        await WebSocket.send({
            domainName: Player2.domainName,
            stage: Player2.stage,
            connectionID: Player2.connectionID,
            message: messageStr
        });
    }

    console.log("Looping spectators");
    for (const spectator of Spectators) {
        console.log("Spectator looping");
        await WebSocket.send({
            domainName: spectator.domainName,
            stage: spectator.stage,
            connectionID: spectator.connectionID,
            message: messageStr
        });
    };
}


async function handleStart (connectionID, record) {

    console.log("get player connections");
    var { conn, type } = getPlayerConn(connectionID, record);

    var startMessage = {
        type: "start-reply",
        playerID: getPlayerID(connectionID, record)
    };

    console.log("send message back to player");
    console.log(conn);
    await WebSocket.send({
        ...conn,
        message: JSON.stringify(startMessage)
    });

    console.log("start game if needed");
    // Kick off game if both players are connected and one sends a "start" message
    var bothConnected = 'Player1' in record && 'Player2' in record;
    if (bothConnected && type < 3) {
        console.log("Both connected gonna go launch now");
        var launchMessage = {
            type: "launch"
        }

        await sendToAll(JSON.stringify(launchMessage), record)
    }

    console.log("start message processed");
    return Responses._200({ message: 'Reply to start message' });
}


async function handleMove(connectionID, record, body) {

    // If game missing a player ABORT
    var bothConnected = 'Player1' in record && 'Player2' in record;
    if (!bothConnected) {
        return Responses._400({ message: 'Invalid state encountered' });
    }
    
    const {Player1, Player2, Ball: dbBall} = record;

    // Extract who the move is from
    if  ('Player1' in record && connectionID === Player1.connectionID) {
        console.log("Action from player 1");
        var player = 1;
    } else if ('Player2' in record && connectionID === Player2.connectionID) {
        console.log("Action from player 2");
        var player = 2;
    } else {
        console.log("Action from spectator... aborting");
        return Responses._200({ message: 'Spectators can\'t make moves' });
    }

    // unpack message from client 
    const {move} = body;

    // test client time. only progress game if the correct client takes their "turn"
    if (player !== record.turn) {
        return Responses._200({ message: 'Its not your turn' })
    }

    // update game
    var board = new Board(Player1, Player2);
    var ball = new Ball(dbBall);

    var left = new Paddle(Player1.paddle);
    var right = new Paddle(Player2.paddle);

    if (record.turn === 1) {
        left.updateDirection(move);
    } else {
        right.updateDirection(move);
    }

    right.updatePosition();
    left.updatePosition();
    ball.updatePosition(left, right, board);

    // store update in db
    if (record.turn === 1) {
        record.turn = 2;
    } else {
        record.turn = 1;
    }
    record.Player1.score = board.lscore;
    record.Player1.paddle = { x: left.x, y: left.y };
    record.Player2.score = board.rscore;
    record.Player2.paddle = { x: right.x, y: right.y };
    record.Ball = {
        position : { x: ball.x, y: ball.y},
        direction : ball.direction,
        speed : ball.speed
    };
    await Dynamo.write(record, tableName);

    // send update to users
    const moveMsg = {
        ballPos: {
            x: ball.x,
            y: ball.y
        },
        p1: {
            paddlePos : record.Player1.paddle,
            score: board.lscore
        },
        p2: {
            paddlePos : record.Player2.paddle,
            score: board.rscore
        }
    }

    await sendToAll(JSON.stringify(moveMsg), record);

}


exports.handler = async (event) => {
    console.log(event);
    
    const { connectionId: connectionID } = event.requestContext;
    
    // Unpack the event that triggered this lambda
    const body_raw = event.body;
    const body = JSON.parse(event.body);
    const { action } = body;
    console.log("Recieved message type : " + action);

    // Unpack the current state of the game from the database
    const record = await Dynamo.get("Primary", tableName);

    console.log("processing message");
    // reply to start message
    switch (action) {
        case "start":
            return await handleStart (connectionID, record);

        case "move":
            return await handleMove (connectionID, record, body);
    
        default:
            console.log("Unknown state encountered : " + action);
            return Responses._200({ message: "Unknown state encountered : " + action });
    }
};
