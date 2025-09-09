import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { gql } from "graphql-tag";
import { prisma } from "../db/client";
import type { Express } from "express";

const typeDefs = gql`
  type Profile { id: ID!, address: String!, qnsName: String, displayName: String, avatarUrl: String, bio: String }
  type Post { id: ID!, cid: String!, textPreview: String, zone: String, createdAt: String!, author: Profile! }
  type Query {
    feed(limit: Int = 20, cursor: ID, authorAddress: String): [Post!]!
  }
`;

const resolvers = {
  Query: {
    feed: async (_: unknown, args: { limit?: number; cursor?: string; authorAddress?: string }) => {
      const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
      const where = args.authorAddress ? { author: { address: args.authorAddress.toLowerCase() } } : undefined;
      const posts = await prisma.post.findMany({
        take: limit,
        ...(args.cursor ? { skip: 1, cursor: { id: args.cursor } } : {}),
        where,
        orderBy: { createdAt: "desc" },
        include: { author: true },
      });
      return posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));
    },
  },
};

export async function mountGraphQL(app: Express): Promise<void> {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  app.use("/graphql", bodyParser.json(), expressMiddleware(server));
}


