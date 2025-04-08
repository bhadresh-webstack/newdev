import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import prisma from '@/lib/prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-here';

export async function POST(req: NextRequest) {
  try {
    // ✅ Get the auth_token from cookies
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // ✅ Decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // ✅ Extract user/customer ID from token
    const customer_id = (decoded as any)?.userId;

    if (!customer_id) {
      return NextResponse.json({ success: false, message: 'Invalid token payload' }, { status: 401 });
    }
    const customer = await prisma.user.findUnique({
      where: { id: customer_id },
      select: { user_name: true },
    });
    // ✅ Parse request body
    const body = await req.json();

    // ✅ Zod validation schema (accept just date string in yyyy-MM-dd)
    const createProjectSchema = z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      status: z.string(),
      pricing_tier: z.string(),
      technical_requirements: z.string().optional(),
      required_skills: z.string().optional(),
      deliverables: z.string().optional(),
      budget: z.number().optional(),
      payment_type: z.string().optional(),
      start_date: z.string().datetime().optional(),
      duration_days: z.number().optional(),
      priority: z.string().optional(),
      visibility: z.string().optional(),
    });

    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // ✅ Convert start_date string to Date object using moment
    const startDate = data.start_date
      ? moment(data.start_date, 'YYYY-MM-DD').toDate()
      : undefined;

    // ✅ Create project in DB
    const newProject = await prisma.project.create({
      data: {
        customer_id,
        customer_name:customer?.user_name,
        ...data,
      },
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}
