import React from 'react'

const projectTable = () => {
	return (
		<div>
			{filteredProjects?.map((project,i) => (
									<motion.div
										key={i}
										variants={fadeInUp}
										whileHover={{ y: -5, transition: { duration: 0.2 } }}
									>
										<Card
											className="h-full hover:shadow-md transition-all overflow-hidden cursor-pointer"
											onClick={() => router.push(`/app/projects/${project.id}`)}
										>
											<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600"></div>
											<CardHeader className="pb-2">
												<div className="flex items-start justify-between">
													<div>
														<CardTitle>{project.title}</CardTitle>
														{(userRole === "admin" || userRole === "team") && (
															<CardDescription>
																{project.total_tasks} tasks • {project.completed_tasks} completed
															</CardDescription>
														)}
														{/* {userRole === "customer" && <CardDescription>Project ID: {project.id}</CardDescription>} */}
													</div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem asChild>
																<Link href={`/app/projects/${project.id}`}>View Details</Link>
															</DropdownMenuItem>
															<DropdownMenuItem asChild>
																<Link href={`/app/projects/${project.id}/edit`}>
																	<Edit className="mr-2 h-4 w-4" />
																	Edit Project
																</Link>
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem className="text-red-600">
																<Trash2 className="mr-2 h-4 w-4" />
																Delete Project
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													<div className="space-y-2">
														<div className="flex items-center justify-between text-sm">
															<span>Progress</span>
															<span className="font-medium">{project.progress_percentage}%</span>
														</div>
														<Progress value={project.progress_percentage} className="h-2" />
													</div>

													<div className="flex items-center justify-between">
														<Badge className={getStatusColor(project.progress_percentage)}>
															{getStatusText(project.progress_percentage)}
														</Badge>
														<Button
															variant="ghost"
															size="sm"
															className="h-8 gap-1"
															onClick={(e) => {
																e.stopPropagation()
																router.push(`/app/projects/${project.id}`)
															}}
														>
															View
															<FolderKanban className="ml-1 h-4 w-4" />
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
		</div>
	)
}

export default projectTable
