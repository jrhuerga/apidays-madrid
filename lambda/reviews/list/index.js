var AWS = require('aws-sdk'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 

exports.handler = function(event, context, callback){
	var params = {
		TableName : "Reviews"
	};
	if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
		params.FilterExpression = 'idMovie = :this_idMovie';
		params.ExpressionAttributeValues = {':this_idMovie' : parseInt(event.queryStringParameters.idMovie,10)};
	}
	documentClient.scan(params, function(err, data){
		var response = {
			"statusCode": 200,
            "headers": {
            },
            "body": JSON.stringify(data.Items),
            "isBase64Encoded": false
		};
		callback(err, response);
	});
};