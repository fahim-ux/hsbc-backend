import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database';
import { User, JWTPayload } from '../types';

export class AuthService {
  constructor(private db: Database) {}

  async login(username: string, password: string): Promise<User | null> {
    const user = await this.db.getUserByUsername(username);
    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  generateJWTPayload(user: User): JWTPayload {
    return {
      userId: user.id,
      username: user.username,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    const user = await this.db.getUserById(userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }
}
