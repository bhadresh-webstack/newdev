"use server"

import prisma from "./prisma/client"

export const getAllTeamMember = async()=>{
	return await prisma.user.findUnique({ where: { email:"pankaj@gmail.com" } })
}
