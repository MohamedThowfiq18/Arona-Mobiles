import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireOwnerSession } from '@/lib/auth';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per image
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(request: NextRequest) {
  // Server-side session verification
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const supabaseReady = isSupabaseConfigured();
    const supabase = supabaseReady ? getSupabaseAdminClient() : null;

    for (const file of files) {
      // 1. Validate file size (max 5MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the maximum allowed size of 5MB.` },
          { status: 400 }
        );
      }

      // 2. Validate MIME type
      const mimeType = file.type.toLowerCase();
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return NextResponse.json(
          { error: `Unsupported image format. Allowed formats: JPG, PNG, WEBP, GIF, AVIF.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 3. Sanitize file extension
      let ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        ext = '.jpg';
      }

      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const safeFilename = `phone-${uniqueSuffix}${ext}`;
      const storagePath = `phones/${safeFilename}`;

      let publicUrl: string | null = null;

      // 4. Primary: Upload to Supabase Storage bucket 'product-images'
      if (supabase) {
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(storagePath, buffer, {
              contentType: mimeType,
              upsert: true,
              cacheControl: '31536000',
            });

          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(uploadData.path);
            if (urlData?.publicUrl) {
              publicUrl = urlData.publicUrl;
            }
          } else if (uploadError) {
            console.warn('Supabase storage upload error:', uploadError);
          }
        } catch (sbErr) {
          console.warn('Supabase storage upload exception:', sbErr);
        }
      }

      // 5. Local filesystem fallback (development / offline)
      if (!publicUrl) {
        try {
          if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
          }
          const filePath = path.join(UPLOADS_DIR, safeFilename);
          fs.writeFileSync(filePath, buffer);
          publicUrl = `/uploads/products/${safeFilename}`;
        } catch (fsErr) {
          console.warn('Local filesystem fallback skipped:', fsErr);
        }
      }

      if (publicUrl) {
        uploadedUrls.push(publicUrl);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'No valid image files could be processed.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0],
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}
