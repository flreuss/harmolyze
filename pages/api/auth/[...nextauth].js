import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { connectToDatabase } from "../../../lib/mongodb";
import bcrypt from "bcryptjs";

export default NextAuth({
  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        const { db } = await connectToDatabase();

        const user = await db
          .collection("users")
          .findOne({ _id: credentials.name });

        if (user) {
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          return passwordMatch ? user : null;
        } else {
          return null;
        }
      },
    }),
  ],
  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session(session, token) {
      session.user.isAdmin = token.isAdmin;
      session.user._id = token._id;
      return session;
    },
    async jwt(token, user) {
      if (user?.isAdmin) token.isAdmin = user.isAdmin;
      if (user?._id) token._id = user._id;
      return token;
    },
  },
});
