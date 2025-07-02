// app/api/upload/organization-logo/route.ts
import { NextRequest, NextResponse } from "next/server"
import { uploadOrganizationLogo } from "@/actions/file-upload.actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const result = await uploadOrganizationLogo(formData)
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Error uploading organization logo:", error)
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    )
  }
}