const Responses = require("response");
const Dynamo = require("Dynamo");
const WebSocket = require("WebsocketMessage");

const tableName = "ball-bounce-backend";

function isEmpty(obj) {
    return obj
        && Object.keys(obj).length === 0
        && obj.constructor === Object;
}

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
            domainName: Player1.domainName,
            stage: Player1.stage,
            connectionID: Player1.connectionID,
        };
    } else if (connectionID === Player2.connectionID) {
        return {
            domainName: Player2.domainName,
            stage: Player2.stage,
            connectionID: Player2.connectionID,
        };
    } else {
        spectator = Spectators.filter(spec => {
            return connectionID === spec.connectionID;
        });
        if (spectator.length === 1) {
            return  {
                domainName: spectator[0].domainName,
                stage: spectator[0].stage,
                connectionID: spectator[0].connectionID,
            };
        }
    }
}

async function sendToAll(messageStr, record) {

    const { Player1, Player2, Spectators} = record;

    if (!isEmpty(Player1)) {
        await WebSocket.send({
            domainName: Player1.domainName,
            stage: Player1.stage,
            connectionID: Player1.connectionID,
            message: messageStr
        });
    }

    if (!isEmpty(Player2)) {
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

exports.handler = async (event) => {
    console.log(event);
    
    const { connectionId: connectionID } = event.requestContext;
    
    // Unpack the event that triggered this lambda
    const body_raw = event.body;
    const body = JSON.parse(event.body);
    const { action, value } = body;
    console.log("Recieved message type : " + action);

    // Unpack the current state of the game from the database
    const record = await Dynamo.get("Primary", tableName);
    const { Board, Player1, Player2, Spectators} = record;

    
    // Kick off game if both players are connected and one sends a "start" message
    var bothConnected = !isEmpty(record.Player1) && !isEmpty(record.Player2);

    // reply to start message
    if (action === "start") {

        var conn = getPlayerConn(connectionID, record);

        var startMessage = {
            type: "start-reply",
            playerID: getPlayerID(connectionID, record)
        };

        await WebSocket.send({
            ...conn,
            message: JSON.stringify(startMessage)
        });

        if (bothConnected) {
            console.log("Both connected gonna go launch now");
            var launchMessage = {
                type: "launch"
            }

            await sendToAll(JSON.stringify(launchMessage), record)
        }

        return Responses._200({ message: 'Reply to start message' });
    }
    
    // Extract who the move is from
    if  (!isEmpty(Player1) && connectionID === Player1.connectionID) {
        console.log("Action from player 1");
        var player = 1;
    } else if (!isEmpty(Player2) && connectionID === Player2.connectionID) {
        console.log("Action from player 2");
        var player = 2;
    } else {
        return Responses._200({ message: 'Spectators can\'t play ball bounce' });
    }



    // Update the board state 
    
    
    
    
    
    
    
    
    
    const reply = {
        ball_pos: Board.ballPosition,
        time_count: Board.timeCount
    }

    if (!isEmpty(Player1) && !isEmpty(Player2)) {
        record.p1 = {
            score: Player1.score,
            paddle: Player1.paddle
        }
        record.p2 = {
            score: Player2.score,
            paddle: Player2.paddle
        }
        await WebSocket.send({
            domainName: Player1.domainName,
            stage: Player1.stage,
            connectionID:  Player1.connectionID,
            "message": JSON.stringify(reply),
        });
    
        await WebSocket.send({
            domainName: Player2.domainName,
            stage: Player2.stage,
            connectionID:  Player2.connectionID,
            "message": JSON.stringify(reply),
        });
    
        for (const spectator of Spectators) {
            await WebSocket.send({
                domainName: spectator.domainName,
                stage: spectator.stage,
                connectionID:  spectator.connectionID,
                "message": JSON.stringify(reply),
            });
        }
    }

    // console.log(domainName, stage, connectionID);
    // await WebSocket.send({
    //     domainName,
    //     stage,
    //     connectionID,
    //     "message": JSON.stringify(message),
    // });

    // console.log("should send messages now");
    // if (startGame && message.value !== 3) {
    //     var startMessage = {
    //         type: "start!"
    //     };

    //     await WebSocket.send({
    //         domainName,
    //         stage,
    //         connectionID,
    //         "message": JSON.stringify(startMessage),
    //     });
    // }
    


    return Responses._200({ message: 'echo message' });
        
};
