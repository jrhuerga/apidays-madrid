var AWS = require('aws-sdk'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 
exports.handler = function(event, context, callback){
    let body = JSON.parse(event.body)
	var params = {
		Item : {
			"id" : Math.floor(Math.random() * 900) + 100,
			"idMovie" : parseInt(body.idMovie),
			"rating" : body.rating,
			"comment" : body.comment,
			"spoiler" :body.spoiler
		},
		TableName : "Reviews"
	};
	documentClient.put(params, function(err, data){
		var response = {
			"statusCode" :  200,
			"headers" : {},
			"body" : JSON.stringify(params.Item),
			"isBase64Encoded" : false
		}
		callback(err, response);
	});
}