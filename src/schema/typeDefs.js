const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type Bot {
    id: ID!
    name: String!
    code: String!
  }
  
  type Query {
    bots: [Bot!]!
    bot(id: ID, name: String): Bot
  }

  type Mutation {
    newBot(name: String!, code: String!): Bot!
    removeBot(id: ID!): Bot
    setBot(id: ID!, name: String, code: String): Bot
  }
`

module.exports = typeDefs
