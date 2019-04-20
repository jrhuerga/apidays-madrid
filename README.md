# GraphQL using AWS AppSync

This tutorial explains how to take advantage of the GraphQL features of AWS AppSync. 

## Prerequisites

To follow this tutorial you will need:
* An account in Amazon Web Services (AWS). 
* Postman

## Step 0 - Setup of REST APIs

Use AWS Serverless Application Repository to automatically deploy this application: <https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:807166229097:applications~APIDays-GraphQL> on any of the regions that support AWS AppSync. At the moment of this writing, these regions support AWS AppSync: 

* US East (N. Virginia)
* US East (Ohio)
* US West (Oregon)
* Asia Pacific (Mumbai)
* Asia Pacific (Seoul)
* Asia Pacific (Singapore)
* Asia Pacific (Sydney)
* Asia Pacific (Tokyo)
* EU (Frankfurt)
* EU (Ireland)
* EU (London)

The application is comprised of these resources:

* DynamoDB tables: Movies and Reviews
* Lambda functions to perform CRUD operations on those tables
* Two APIs: Movies and Reviews

If you experience any error during the import of the application from the AWS Serverless Aplication Repository, you can try to manually import the resources using [this guide](manualSetup.md).

Use [this Postman collection](postman) to interact with the APIs and create an initial dataset. You will need to create a new Postman environment with these variables:

* movies - link to the Movies API in the beta stage created in previous step.
* reviews - link to the Reviews API

Use the different requests in the collection to verify that all the endpoints are working properly and to populate data.

## Step 1 - Create a Movies GraphQL API

* Enter in AWS AppSync
* Create a new GraphQL API (build from scratch) named _Movies_
* Define this schema:

```
type Movie {
  id: ID!
  director: String
  name: String
  year: Int
}

type Query {
  getMovies: [Movie]
  getMovie(id: ID!): Movie
}

schema {
  query: Query
}
```
* Create a Data Source (type: HTTP endpoint) named _movies_ using the base URL of the Movies API published in the API Gateway.
* Back in the Schema section, define a resolver for the queries _getMovies()_ and _getMovie()_ . Click on _Attach_ in _getMovies_ select the data source created in previous step and use this piece of code in the request mapping template:

```
{
  "version": "2018-05-29",
  "method": "GET",
  "resourcePath": "/beta/movies",
}
```
* Attach to _getMovie()_ the following request mapping template:
```
{
  "version": "2018-05-29",
  "method": "GET",
  "resourcePath": "/beta/movies/${ctx.args.id}",
}
```
* Click on _Queries_ and copy these GraphQL queries:
```
query getMovies {
  getMovies {
    id
    name
    director
    year
  } 
}
query getMovie {
  getMovie(id: 111) {
    name
    id
  }
}

```
* Execute first _getMovies()_ and copy one of the IDs from the resulting data, to replace the argument in _getMovie()_. Then, execute _getMovie()_
* Click on _Setting_ and take note of the API URL and its API Key. Now, navigate to <https://github.com/prisma/graphql-playground> and click on the demo web version of GraphQL Playground at GraphQLBin.
* Once in GraphQL Playground, add a new tab and add a new HTTP Header named _x-api-key_ with the value of the API Key. Please, use the _double quotes_ symbol. Example: {"x-api-key":"da2-4br9mtjv2bahfpavmlp2ku59kq"}. Copy in the URL the API URL of the GraphQL API. Copy in the query field the same GraphQL query used before and repeat the tests.

## Step 2 - Improve Movies GraphQL API to search for Reviews

* Replace _Schema_ with this one, in which it is added support for Reviews, as a child entity inside Movies:
```
type Movie {
  director: String
  id: ID!
  name: String
  reviews: [Review]
  year: Int
}

type Query {
  getMovie(id: ID!): Movie
  getMovies: [Movie]
  getReviews: [Review]
}

type Review {
  comment: String
  id: ID!
  idMovie: Int
  rating: Int
  spoiler: String
}

schema {
  query: Query
}
```
* Create a Data Source (type: HTTP endpoint) named _reviews_ using the base URL of the Reviews API published in the API Gateway.
* In the Schema section, attach a resolver for the field _reviews_ in the type Movie, using the _reviews_ data source and this request mapping template:
```
{
  "version": "2018-05-29",
  "method": "GET",
  "resourcePath": "/beta/reviews",
  "params":{
      "query":{"idMovie":$context.source.id}
  }
}
```
* Attach a resolver for the query _getReviews()_ using the data source _reviews_ and this request mapping template:
```
{
  "version": "2018-05-29",
  "method": "GET",
  "resourcePath": "/beta/reviews",
}
```
* Click on _Queries_ and copy these GraphQL queries:
```
query getMovies {
  getMovies {
    id
    name
    director
    year
    reviews {
      id
      idMovie
      comment
      rating
      spoiler
    }
  } 
}
query getMovie {
  getMovie(id: 111) {
    name
    id
  }
}
query getReviews {
  getReviews {
    id
    comment
  }
}
```
* Execute the query _getMovies_ and check that it is now returning the associated reviews of each movie as a child entity.

## Step 3 - Add a Mutation

* Edit the schema to add a mutation:
```
type Mutation {
  newMovie(director: String, name: String, year: Int): Movie
}

schema {
  query: Query
  mutation: Mutation
}
```
* Attach a resolver for the mutation _newMovie_ using the data source _movies_ and this request mapping template:
```
{
    "version": "2018-05-29",
    "method": "POST",
    "resourcePath": "/beta/movies",
    "params":{
        "body":$util.toJson($ctx.args),
    }
}
```
* Click on _Queries_ and add this mutation at the end:
```
mutation newMovie {
  newMovie(director: "Christopher Nolan", name: "The Dark Knight",year: 2008) {
    id
  }
}
```
* Execute the mutation and check with _getMovies()_ that a new movie appears in the list.

## Step 4 - Add a Subscription

* Edit the schema to add a subscription:
```
type Subscription {
  addedMovie: Movie
    @aws_subscribe(mutations: ["newMovie"])
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
```
* Click on _Queries_ and add this subscription at the end:
```
subscription addedSubs {
  addedMovie {
    director
    name
  }
}
```
* Execute the subscription; it will wait until a new Movie is added. Using in a separate browser tab the Prisma GraphQL Playground, execute there a mutation; the subscription will be notified with the newly created movie.
