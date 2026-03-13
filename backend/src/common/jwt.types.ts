export interface JwtPayload {
  sub: string;
}

export interface JwtUser {
  id: string;
}

export interface JwtRefreshUser extends JwtUser {
  refreshToken: string;
}
