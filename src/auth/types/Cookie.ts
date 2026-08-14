export interface AuthRequest extends Request {
  cookies: {
    refreshToken?: string;
  };
}
