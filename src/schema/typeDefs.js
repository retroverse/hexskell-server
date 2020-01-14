const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type Bot {
    id: ID!
    name: String!
    code: String!
    author: User!
    dateCreated: String!
  }

  type User {
    id: ID!
    displayName: String!
    dateJoined: String!
    createdBots: [Bot!]!
  }
  
  type Query {
    # Bots
    bots: [Bot!]!
    bot(id: ID, name: String): Bot

    # Users
    users: [User!]!
    user(id: ID, displayName: String): User
  }

  type Mutation {
    # Bots
    newBot(name: String!, code: String!): Bot!
    removeBot(id: ID!): Bot
    setBot(id: ID!, name: String, code: String): Bot
  
    # Users
    newUser(displayName: String!, email: String!): User!
    removeUser(id: ID!): User
    setUser(id: ID!, displayName: String): User
  }
`

module.exports = typeDefs
