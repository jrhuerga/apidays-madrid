# GraphQL using AWS App Sync

This tutorial explains how to take advantage of the GraphQL features of AWS App Sync. 

## DynamoDB Setup

Create two tables in AWS DynamoDB:

* Movies - Primary key: 'id'  (number)
* Reviews - Primary key: 'id' (number)

## Lambda Functions

Import in Lambda the following [six functions](lambda) (Node.js 8.x):

* MovieList - Used to list all the entries in the table Movies
* MovieAdd - Used to add a new entry in the table Movies
* MovieGet - Used to retrieve a single element in the table Movies
* ReviewList - Used to list all the entries in the table Reviews
* ReviewAdd - Used to add a new entry in the table Reviews
* ReviewGet - Used to retrieve a single element in the table Reviews

During the creation of the first lambda, you will need to create a new custom role. Edit that role in the IAM console and attach to it the policy AmazonDynamoDBFullAccess.

## API Gateway

Create in AWS API Gateway the Movies API with the following resources and methods:

* /
  * /movies
    * GET - Associate it with MovieList lambda 
    * POST - Associate it with MovieAdd lambda
    * /{id}
      * GET - Associate it with MovieGet lambda

Be careful to always select "Use Lambda Proxy integration".
Create as well the Reviews API with this list of resources and methods:

* /
  * /reviews
    * GET - Associate it with ReviewList lambda. Add a URL query string parameter named 'idMovie'
    * POST - Associate it with ReviewAdd lambda
    * /{id}
      * GET - Associate it with ReviewGet lambda

Deploy both APIs in a new stage named 'beta'.

## Publishing in AWS Serverless Application Repository (optional step)

* Install Python
* Install AWSCLI (pip3 install awscli --upgrade --user)
* Install AWS SAM CLI (pip install --user aws-sam-cli)
* Create a S3 bucket
* Edit [this template](template.yaml)
* Package the software (sam package --template-file template.yaml --output-template-file package.yaml --s3-bucket bucketName --region us-west-2)
* Deploy (sam deploy --template-file package.yaml --stack-name movies-app --capabilities CAPABILITY_IAM --region us-west-2)
* Upload the package to AWS Serverless Application Repository

## Populate data

Use [this Postman collection](postman) to interact with the APIs and create an initial dataset. You will need to create a new Postman environment with these variables:

* movies - link to the Movies API in the beta stage created in previous step.
* reviews - link to the Reviews API

Use the different requests in the collection to verify that all the endpoints are working properly.

## App Sync

Create a new AWS App Sync API named Movies. Use the file [schema.graphql](appsync/schema.graphql) to create the Schema.

Create two datasources of type HTTP:

* movies - Linking to the URL in API Gateway of the Movies API
* reviews - Linking to the URL in API Gateway of the Reviews API

Define resolvers for the following types, queries and mutations:

* Movie.reviews - Data Source: reviews. Configure the request mapping template using [this file](appsync/templates/movie.reviews.txt)
* Mutation.newMovie - Data Source: movies.Configure the request mapping template using [this file](appsync/templates/mutation.newmovie.txt) 
* Query.getMovie - Data Source: movies. Configure the request mapping template using [this file](appsync/templates/query.getmovie.txt) 
* Query.getMovies - Data Source: movies. Configure the request mapping template using [this file](appsync/templates/query.getmovies.txt)
* Query.getReviews - Data Source: reviews. Configure the request mapping template using [this file](appsync/templates/query.getreviews.txt)


## Test GraphQL API

Use the file [queries.graphql](appsync/queries.graphql) to verify the GraphQL API using the Queries tab provided by AWS App Sync

Alternatively you can use the GraphQL Playground of Prisma ( <https://github.com/prisma/graphql-playground> ) to test the GraphQL API. You will need to get the API Key from the Settings tab and pass it as a x-api-key header.









