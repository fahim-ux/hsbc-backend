import { NextRequest, NextResponse } from 'next/server';

// Mock user database (same as login)
const MOCK_USERS = [
  {
    id: 'user-1',
    username: 'john_doe',
    fullName: 'John Doe',
    email: 'john@example.com'
  },
  {
    id: 'user-2',
    username: 'jane_smith',
    fullName: 'Jane Smith',
    email: 'jane@example.com'
  }
];

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authorization.replace('Bearer ', '');
    
    // Mock token validation (extract user ID from token)
    const tokenMatch = token.match(/mock_jwt_token_(.+?)_/);
    if (!tokenMatch) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = tokenMatch[1];
    const user = MOCK_USERS.find(u => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
