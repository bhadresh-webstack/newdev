import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ **GET: Fetch Single User by ID**
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// ✅ **PUT: Update a User by ID**
// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { full_name, role, profile_image } = await req.json();

//     const updatedUser = await prisma.user.update({
//       where: { id: params.id },
//       data: { full_name, role, profile_image },
//     });

//     return NextResponse.json(updatedUser);
//   } catch (error) {
//     console.error("Error updating user:", error);
//     return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
//   }
// }

// ✅ **DELETE: Remove a User by ID**
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
