import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided or not a valid file' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(fileName, file)

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Trigger PDF processing
    const { error: functionError } = await supabase.functions
      .invoke('pdf-ingest', {
        body: { fileName, bucketName: 'pdfs' }
      })

    if (functionError) {
      console.error('PDF processing failed:', functionError)
    }

    return NextResponse.json({ 
      success: true, 
      fileName,
      processingStarted: !functionError
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
