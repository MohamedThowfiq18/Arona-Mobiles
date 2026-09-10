import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { requireOwnerSession } from '@/lib/auth';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per image
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.heic'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic'];

export async function POST(request: NextRequest) {
  // Server-side session verification
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase credentials are not configured on the server. Please check your environment variables.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const productId = (formData.get('productId') as string) || '';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const supabase = getSupabaseAdminClient();

    // Ensure bucket product-images exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'product-images');
      if (!bucketExists) {
        await supabase.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        });
      }
    } catch (bErr) {
      console.warn('Storage bucket check warning:', bErr);
    }

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
          { error: `Unsupported image format (${mimeType}). Allowed formats: JPG, PNG, WEBP, GIF, AVIF, HEIC.` },
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
      const prefix = productId ? `products/${productId}` : 'products';
      const storagePath = `${prefix}/${uniqueSuffix}${ext}`;

      // 4. Upload directly to Supabase Storage bucket 'product-images'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
          cacheControl: '31536000',
        });

      if (uploadError || !uploadData) {
        console.error('Supabase storage upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload image to Supabase Storage: ${uploadError?.message || 'Upload failed'}` },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);

      if (!urlData?.publicUrl) {
        return NextResponse.json(
          { error: 'Failed to retrieve public URL for uploaded photograph from Supabase Storage.' },
          { status: 500 }
        );
      }

      uploadedUrls.push(urlData.publicUrl);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'No valid image files could be processed.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0],
    });
  } catch (error: any) {
    console.error('Error uploading product image:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}
