// app/api/organizations/check-slug/route.ts
import { checkSlugAvailability } from "@/actions/organization.actions"
import { NextRequest, NextResponse } from "next/server"

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
    console.error("Error checking slug availability:", error);
    return NextResponse.json(
      { available: false, error: "Check failed" },
      { status: 500 }
    )
  }
}