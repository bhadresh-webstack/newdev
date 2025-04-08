import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-here';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded?.userId;
    const role = decoded?.role; // 'admin' or 'customer'
    const projectId = params.id;

    if (!userId || !projectId) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    }

    // Only allow access if admin or project belongs to customer
    if (role !== 'admin' && project.customer_id !== userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, project }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Server Error', error: error.message }, { status: 500 });
  }
}
