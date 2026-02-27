export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RequestUser {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
}
