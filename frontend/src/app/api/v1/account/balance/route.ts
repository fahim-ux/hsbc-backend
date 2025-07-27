import { NextRequest, NextResponse } from 'next/server';

// Mock account data
const MOCK_ACCOUNTS = {
  'user-1': {
    balance: 10000,
    accountNumber: 'ACC001'
  },
  'user-2': {
    balance: 25000,
    accountNumber: 'ACC002'
  }
};

function getUserFromToken(token: string): string | null {
  const tokenMatch = token.match(/mock_jwt_token_(.+?)_/);
  return tokenMatch ? tokenMatch[1] : null;
}

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
    const userId = getUserFromToken(token);

    if (!userId || !MOCK_ACCOUNTS[userId as keyof typeof MOCK_ACCOUNTS]) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const account = MOCK_ACCOUNTS[userId as keyof typeof MOCK_ACCOUNTS];

    return NextResponse.json({
      success: true,
      data: {
        balance: account.balance,
        accountNumber: account.accountNumber
      },
      message: 'Account balance retrieved successfully'
    });

  } catch (error) {
    console.error('Account balance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
