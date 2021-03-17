const Responses = require("response.js");
const Dynamo = require("Dynamo.js");
const WebSocket = require("WebsocketMessage");

const tableName = "ball-bounce-backend";

exports.handler = async (event) => {
    const { connectionId: connectionID, domainName, stage } = event.requestContext;
    
    try {
        const record = await Dynamo.get("Primary", tableName);
        
        const playerRecord = {
            connectionID,
            domainName,
            stage
        };

        if (!('Player1' in record)) {
            console.log("Player 1 init");
            record.Player1 = {
                score: 0,
                paddle: {
                    x: 0,
                    y: 1080
                },
                connectionID,
                domainName,
                stage     
            };

            record.Ball = {
                position: {x: 960, y: 540},
                direction: Math.PI,
                speed: 4
            }
            record.turn = 2;

        } else if (!('Player2' in record)) {
            console.log("Player 2 init");
            record.Player2 = {
                score: 0,
                paddle: {
                    x: 1920,
                    y: 1080
                },
                connectionID,
                domainName,
                stage
            };

        } else {
            console.log("Spectator init");
            record.Spectators.push({
                connectionID,
                domainName,
                stage
            });
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
