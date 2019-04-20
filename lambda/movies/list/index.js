var AWS = require('aws-sdk'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 

exports.handler = function(event, context, callback){
	var params = {
		TableName : "Movies"
	};
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
