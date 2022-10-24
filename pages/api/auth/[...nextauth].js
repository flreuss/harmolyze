import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "../../../lib/mongodb";
import bcrypt from "bcryptjs";

export default NextAuth({
  providers: [
    CredentialsProvider({
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
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({session, token}) {
      session.user.groups = token.groups;
      session.user.avatar = token.avatar;
      session.user._id = token._id;
      return session;
    },
    async jwt({token, user}) {
      if (user?.groups) token.groups = user.groups;
      if (user?.avatar) token.avatar = user.avatar;
      if (user?._id) token._id = user._id;
      return token;
    },
  },
});
