const { gql } = require('apollo-server-express')

const typeDefs = gql`
  enum Player {
    RED
    BLUE
  }

  enum SortOrder {
    INCREASING
    DECREASING
  }

  enum BotSorting {
    ALPHABETICALLY
    DATE_CREATED
    NUMBER_WINS
  }

  enum BotFilter {
    PUBLISHED
    MINE
  }

  enum PublishingStatus {
    PUBLISHED
    PUBLISHING
    NOT_PUBLISHED
  }

  input BotsInput {
    offset: Int
    amount: Int
    search: String
    filters: [BotFilter!]
    sortBy: BotSorting
    sortOrder: SortOrder
  }

  type BotsResult {
    bots: [Bot!]!
    totalPages: Int!
    currentPage: Int!
  }

  type BotStatistics {
    wins: Int!
    ties: Int!
    losses: Int!
    numMatches: Int!
    ranking: Int!
    winRate: Float!
    winRateBlue: Float!
    winRateRed: Float!
    redWinPercentage: Float!
    averageGameLength: Float! # Average across all matches
  }

  type UserStatistics {
    totalWins: Int!
    totalTies: Int!
    totalLosses: Int!
    bestRanking: Int
    bestIndividualWins: Int
    botCount: Int!
  }
  
  type Bot {
    id: ID!
    name: String!
    code: String!
    author: User!
    dateCreated: String!
    published: Boolean!
    publishingStatus: PublishingStatus!
    tournamentMatches: [Match!]!
    wins: Int!
    ties: Int!
    ranking: Int
  }

  type Piece {
    x: Int
    y: Int
  }

  type GameState {
    red: [Piece]
    blue: [Piece]
  }

  type Round {
    redPlayer: Bot!
    bluePlayer: Bot!
    winner: Player!
    winningCompetitor: Bot!
    terminalState: GameState!
    terminalStateStr: String!
  }

  type BotError {
    bot: Bot!
    player: Player
    round: Int
    message: String!
  }

  type Match {
    id: ID!
    rounds: [Round!]!
    round(number: Int!): Round
    competitors: [Bot!]!
    winningCompetitor: Bot
    botErrors: [BotError!]!
  }

  type User {
    id: ID!
    displayName: String!
    dateJoined: String!
    createdBots: [Bot!]!
    avatarURL: String
  }
  
  type Query {
    # Bots
    bots(input: BotsInput): BotsResult
    bot(id: ID, name: String): Bot
    botStatistics(id: ID!): BotStatistics

    # Users
    me: User  # uses session to return info on currently logged-in user
    myStatistics: UserStatistics
    users: [User!]!
    user(id: ID, displayName: String): User
    userStatistics(id: ID): UserStatistics

    # Matches
    match(id: ID!): Match
    matches: [Match!]!
  }

  type Mutation {
    # Bots
    newBot(name: String!, code: String!): Bot!
    removeBot(id: ID!): Bot
    setBot(id: ID!, name: String, code: String): Bot
    publishBot(id: ID!): Bot
    unpublishBot(id: ID!): Bot
  
    # Users
    removeUser(id: ID!): User
    setUser(displayName: String!): User

    # Matches
    competeBots(competitors: [ID!]!): Match
    removeMatches: [Match]
  }
`

module.exports = typeDefs
