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
    
    if (record.Player1.connectionID === connectionID) {
        record.Player1 = {};
    } else if (record.Player2.connectionID === connectionID) {
        record.Player2 = {};
    } else {
        record.Spectators = record.Spectators.filter(item => {
            item.connectionID !== connectionID
        });
    }

    await Dynamo.write(record, tableName);
    
    return Responses._200({ message: 'Successful Disconnect' });

};
