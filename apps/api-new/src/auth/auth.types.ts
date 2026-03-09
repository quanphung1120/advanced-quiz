export type JwtPayload = {
  sub: string;
  email: string;
  emailVerified: boolean;
  type: "access" | "refresh";
};
