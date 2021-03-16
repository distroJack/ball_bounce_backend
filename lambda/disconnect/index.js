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
    
    const { connectionId: connectionID } = event.requestContext;

    const record = await Dynamo.get("Primary", tableName);
    const { Player1, Player2, Spectators} = record;

    // Time to remove the disconnecting instance and all "dead" instances
    const msg = {
        "type": "heartbeat"
    };
    const msgStr = JSON.stringify(msg);

    if (Player1.connectionID === connectionID) {
        record.Player1 = {};
    } else {
        try {
            await WebSocket.send({
                domainName: Player1.domainName,
                stage: Player1.stage,
                connectionID: Player1.connectionID,
                message: msgStr
            });
        } catch (e) {
            record.Player1 = {};
        }
    }
    
    if (Player2.connectionID === connectionID) {
        record.Player2 = {};
    } else {
        try {
            await WebSocket.send({
                domainName: Player1.domainName,
                stage: Player1.stage,
                connectionID: Player1.connectionID,
                message: msgStr
            });
        } catch (e) {
            record.Player2 = {};
        }
    }

    // Disconnecting spectators is a bit more complex. TODO: in the future
    record.Spectators = Spectators.filter(item => {
        item.connectionID !== connectionID
    });

    await Dynamo.write(record, tableName);
    
    return Responses._200({ message: 'Successful Disconnect' });

};
