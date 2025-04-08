import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'

export async function GET() {
  try {
    const teamMembers = await prisma.user.findMany({
      where: { role: 'team_member' },
      select: {
        id: true,
        user_name: true,
        email: true,
        profile_image: true,
        team_role: true,
        department: true,
      }
    })

    return NextResponse.json({ team_members: teamMembers }, { status: 200 })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}
