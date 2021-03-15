const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

const Dynamo = {
    async get(ID, TableName) {
        const params = {
            TableName,
            Key: {
                GameId: ID,
            },
        };

        const data = await documentClient.get(params).promise();

        if (!data || !data.Item) {
            throw Error(`There was an error fetching the data for ID of ${ID} from ${TableName}`);
        }

        return data.Item;
    },

    async write(data, TableName) {
        if (!data.GameId) {
            throw Error('no ID on the data');
        }

        const params = {
            TableName,
            Item: data,
        };

        const res = await documentClient.put(params).promise();

        if (!res) {
            throw Error(`There was an error inserting ID of ${data.GameId} in table ${TableName}`);
        }

        return data;
    },

    async delete(ID, TableName) {
        const params = {
            TableName,
            Key: {
                GameId: ID,
            },
        };

        return documentClient.delete(params).promise();
    },
};
module.exports = Dynamo;