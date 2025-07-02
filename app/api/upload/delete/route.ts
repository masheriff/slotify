// app/api/upload/delete/route.ts
import { NextRequest, NextResponse } from "next/server"
import { deleteFile } from "@/actions/file-upload.actions"

export async function DELETE(request: NextRequest) {
  try {
    const { fileUrl } = await request.json()
    
    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "File URL is required" },
        { status: 400 }
      )
    }
    
    const result = await deleteFile(fileUrl)
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    )
  }
}