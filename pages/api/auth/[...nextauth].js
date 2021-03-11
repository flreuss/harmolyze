import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { connectToDatabase } from "../../../lib/mongodb";
import bcrypt from "bcrypt";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { db } = await connectToDatabase();

        const user = await db
          .collection("users")
          .findOne(
            { name: credentials.username }
          );

        if (user) {
          const match = await bcrypt.compare(
            credentials.password,
            user.password
          );

          return match ? user : null;
        } else {
          return null;
        }
      },
    }),
    // ...add more providers here
  ],

  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
});
