// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-here';

export async function GET(req: NextRequest) {
  try {
    // 🔐 Get token from cookies
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // 🔐 Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const userId = (decoded as any)?.userId;   // or userId depending on your payload
    const role = (decoded as any)?.role;

    if (!userId || !role) {
      return NextResponse.json({ success: false, message: 'Invalid token payload' }, { status: 401 });
    }

    // 🔍 Fetch projects conditionally
    let projects;
    if (role === 'admin') {
      // Admin gets all
      projects = await prisma.project.findMany({
        orderBy: { created_at: 'desc' },
      });
    } else {
      // Customer gets only their own
      projects = await prisma.project.findMany({
        where: { customer_id: userId },
        orderBy: { created_at: 'desc' },
      });
    }

    return NextResponse.json({ success: true, projects }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}
