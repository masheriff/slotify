// app/api/organizations/check-slug/route.ts
import { NextRequest, NextResponse } from "next/server"
import { checkSlugAvailability } from "@/actions/file-upload-actions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const excludeOrgId = searchParams.get('excludeOrgId')
    
    if (!slug) {
      return NextResponse.json(
        { available: false, error: "Slug is required" },
        { status: 400 }
      )
    }
    
    const result = await checkSlugAvailability(slug, excludeOrgId || undefined)
    
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { available: false, error: "Check failed" },
      { status: 500 }
    )
  }
}