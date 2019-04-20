var AWS = require('aws-sdk'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 

exports.handler = function(event, context, callback) {
	var params = {
		TableName : "Reviews",
		Key: {
			 id: parseInt(event.pathParameters.id, 10) 
		}
	};
	
	documentClient.get(params, function(err, data){
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Item)
        };
        callback(err, response);
	});
};