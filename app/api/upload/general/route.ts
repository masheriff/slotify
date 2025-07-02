// app/api/upload/general/route.ts
import { NextRequest, NextResponse } from "next/server"
import { uploadGeneralFile } from "@/actions/file-upload.actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const result = await uploadGeneralFile(formData)
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    )
  }
}