import { ITokens } from './tokens.interface';

export interface ITokenResponse {
  data: ITokens | null;
  messages: string[];
}
