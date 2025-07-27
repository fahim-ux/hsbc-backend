import { NextRequest, NextResponse } from 'next/server';

// Mock user database
const MOCK_USERS = [
  {
    id: 'user-1',
    username: 'john_doe',
    password: 'password', // In production, this would be hashed
    fullName: 'John Doe',
    email: 'john@example.com',
    accountNumber: 'ACC001',
    balance: 10000
  },
  {
    id: 'user-2',
    username: 'jane_smith',
    password: 'password',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    accountNumber: 'ACC002',
    balance: 25000
  }
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate mock JWT token (in production, use proper JWT)
    const token = `mock_jwt_token_${user.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
