const Responses = require("response.js");
const Dynamo = require("Dynamo.js");
const WebSocket = require("WebsocketMessage");

const tableName = "ball-bounce-backend";

function isEmpty(obj) {
    return obj
        && Object.keys(obj).length === 0
        && obj.constructor === Object;
}

exports.handler = async (event) => {
    const { connectionId: connectionID, domainName, stage } = event.requestContext;
    
    try {
        const record = await Dynamo.get("Primary", tableName);
        
        const playerRecord = {
            connectionID,
            domainName,
            stage
        };

        var message = {
            type: "Player",
        }

        if (isEmpty(record.Player1)) {
            console.log("Player 1 init");
            record.Player1 = {
                score: 0,
                connectionID,
                domainName,
                stage                
            };

            message.value = 1

        } else if (isEmpty(record.Player2)) {
            console.log("Player 2 init");
            record.Player2 = {
                score: 0,
                connectionID,
                domainName,
                stage
            };

            message.value = 2

        } else {
            console.log("Spectator init");
            record.Spectators.push({
                connectionID,
                domainName,
                stage
            });     

            message.value = 3

        }

        var startGame = !isEmpty(record.Player1) && !isEmpty(record.Player2);
        
        // Initialize the board state if last player joined
        if (startGame && message.value !== 3) {

            console.log("Starting game");
            record.Board = {
                ballPosition: [540, 960],       // Halfway along the width and height
                timeCount: 0,
            };
        }

        console.log("write player records to Db");
        await Dynamo.write(record, tableName);
        
        return Responses._200({ message: 'Successful Connnect' });
    } catch (error) {
        console.log("returning failed " + error.message);
        console.log("returning failed " + error.stack);
        return Responses._400({ message: 'Connection Failed' });    
    }
};
