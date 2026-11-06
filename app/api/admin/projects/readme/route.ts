import { NextRequest, NextResponse } from 'next/server'
import { guardApi } from '@/lib/auth'
import { fetchProjectReadme } from '@/lib/project-readme'

export async function POST(req: NextRequest) {
  const denied = await guardApi(req)
  if (denied) return denied
  const body = await req.json().catch(() => null)
  try {
    return NextResponse.json({
      description: await fetchProjectReadme(
        typeof body?.github === 'string' ? body.github : '',
      ),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'README import failed',
      },
      { status: 422 },
    )
  }
}
