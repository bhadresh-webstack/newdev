import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Directorio raíz del proyecto
const rootDir = path.resolve(__dirname, "..")
// Directorio de la API
const apiDir = path.join(rootDir, "app", "api")

// Patrón para buscar instancias directas de PrismaClient
const prismaClientPattern = /new\s+PrismaClient\s*\(/g
// Patrón para buscar importaciones de PrismaClient
const importPrismaClientPattern = /import\s+{\s*PrismaClient\s*}\s+from\s+["']@prisma\/client["']/g
// Patrón para buscar importaciones de prisma desde lib/prisma
const importPrismaPattern = /import\s+{\s*prisma\s*}\s+from\s+["']@\/lib\/prisma["']/g

// Función para verificar y corregir un archivo
function checkAndFixFile(filePath) {
  // Leer el contenido del archivo
  const content = fs.readFileSync(filePath, "utf8")

  // Verificar si el archivo contiene instancias directas de PrismaClient
  if (prismaClientPattern.test(content)) {
    console.log(`Archivo con instancia directa de PrismaClient: ${filePath}`)

    // Verificar si ya importa prisma desde lib/prisma
    if (!importPrismaPattern.test(content)) {
      console.log(`  - Necesita importar prisma desde lib/prisma`)

      // Corregir el archivo
      let newContent = content

      // Reemplazar la importación de PrismaClient
      if (importPrismaClientPattern.test(content)) {
        newContent = newContent.replace(importPrismaClientPattern, `import { prisma } from "@/lib/prisma"`)
      } else {
        // Agregar la importación de prisma al principio del archivo
        const lines = newContent.split("\n")
        const importIndex = lines.findIndex((line) => line.startsWith("import"))
        if (importIndex >= 0) {
          lines.splice(importIndex, 0, `import { prisma } from "@/lib/prisma"`)
        } else {
          lines.unshift(`import { prisma } from "@/lib/prisma"`)
        }
        newContent = lines.join("\n")
      }

      // Reemplazar instancias directas de PrismaClient
      newContent = newContent.replace(prismaClientPattern, `/* FIXED: Using singleton prisma instance */ (()=>prisma)(`)

      // Guardar el archivo corregido
      fs.writeFileSync(filePath, newContent, "utf8")
      console.log(`  - Archivo corregido`)
    }
  }
}

// Función recursiva para recorrer directorios
function traverseDirectory(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      traverseDirectory(filePath)
    } else if (stat.isFile() && (filePath.endsWith(".ts") || filePath.endsWith(".js"))) {
      checkAndFixFile(filePath)
    }
  }
}

// Iniciar la verificación desde el directorio de la API
console.log("Iniciando verificación de archivos...")
traverseDirectory(apiDir)
console.log("Verificación completada.")
