"use client"

import { FileText, Plus } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/project-utils"

interface ProjectFilesTabProps {
  files: any[]
}

export function ProjectFilesTab({ files }: ProjectFilesTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Project Files</h2>
        <Button size="sm" className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Upload File
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.length > 0 ? (
              files.map((file, index) => (
                <motion.div
                  key={file.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.file_name}</p>
                          <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                            <span>{file.file_type}</span>
                            <span className="mx-1.5">•</span>
                            <span>{file.file_size}</span>
                            <span className="mx-1.5">•</span>
                            <span>{formatDate(file.uploaded_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-6">
                <p className="text-muted-foreground text-sm">No files uploaded yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
