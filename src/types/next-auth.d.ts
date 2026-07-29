import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "OWNER" | "DEALER" | "BUYER";
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "OWNER" | "DEALER" | "BUYER";
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "OWNER" | "DEALER" | "BUYER";
  }
}
