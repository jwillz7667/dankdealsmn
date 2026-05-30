'use client';

import { useRef, useState, useTransition } from 'react';
import { ImagePlus, Star, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import type { ProductImage } from '@/lib/api/types';
import {
  attachProductImageAction,
  deleteProductImageAction,
  presignImageAction,
  reorderProductImagesAction,
} from './actions';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 8 * 1024 * 1024;

type PresignContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

interface ProductImageManagerProps {
  productId: string;
  initialImages: ProductImage[];
}

export function ProductImageManager({ productId, initialImages }: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const primaryId = images.find((i) => i.isPrimary)?.id;
  const orderOf = (list: ProductImage[]) => list.map((im, i) => ({ id: im.id, position: i }));

  async function uploadOne(file: File, makePrimary: boolean): Promise<string | null> {
    if (!ALLOWED.includes(file.type)) return `${file.name}: unsupported file type.`;
    if (file.size > MAX_BYTES) return `${file.name}: image must be 8 MB or smaller.`;

    const presign = await presignImageAction({
      contentType: file.type as PresignContentType,
      contentLength: file.size,
      prefix: 'products',
    });
    if (!presign.ok) return presign.error;

    const put = await fetch(presign.data.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!put.ok) return `${file.name}: upload failed (${put.status}).`;

    const dims = await readDimensions(file);
    const attach = await attachProductImageAction(productId, {
      url: presign.data.publicUrl,
      alt: null,
      width: dims?.width ?? null,
      height: dims?.height ?? null,
      isPrimary: makePrimary,
    });
    if (!attach.ok) return attach.error;

    setImages(attach.data.images);
    return null;
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setError(null);
    startTransition(async () => {
      let hadImages = images.length > 0;
      for (const file of files) {
        const message = await uploadOne(file, !hadImages);
        if (message) {
          setError(message);
          break;
        }
        hadImages = true;
      }
      if (inputRef.current) inputRef.current.value = '';
    });
  }

  function setPrimary(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await reorderProductImagesAction(productId, orderOf(images), id);
      if (result.ok) setImages(result.data.images);
      else setError(result.error);
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    setError(null);
    startTransition(async () => {
      const result = await reorderProductImagesAction(productId, orderOf(next), primaryId);
      if (result.ok) setImages(result.data.images);
      else setError(result.error);
    });
  }

  function remove(id: string) {
    setConfirmId(null);
    setError(null);
    startTransition(async () => {
      const result = await deleteProductImageAction(productId, id);
      if (result.ok) setImages(result.data.images);
      else setError(result.error);
    });
  }

  return (
    <div className="imgmgr">
      {error && (
        <p className="formerror" role="alert">
          {error}
        </p>
      )}

      <div
        className={`dropzone${dragging ? ' is-drag' : ''}${pending ? ' is-busy' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {pending ? <Loader2 className="ic spin" aria-hidden /> : <ImagePlus className="ic" aria-hidden />}
        <b>{pending ? 'Uploading…' : 'Upload images'}</b>
        <span>Drag &amp; drop or click to browse · JPG, PNG, WebP, AVIF · up to 8 MB</span>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(',')}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="imgmgr__grid">
          {images.map((image, index) => (
            <div key={image.id} className={`imgtile${image.isPrimary ? ' is-primary' : ''}`}>
              {image.isPrimary && <span className="imgtile__flag">Primary</span>}
              <div className="imgtile__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.alt ?? ''} loading="lazy" />
              </div>
              <div className="imgtile__bar">
                <button
                  type="button"
                  className="iconbtn-sm"
                  title="Move left"
                  onClick={() => move(index, -1)}
                  disabled={pending || index === 0}
                >
                  <ArrowUp className="ic" aria-hidden />
                </button>
                <button
                  type="button"
                  className="iconbtn-sm"
                  title="Move right"
                  onClick={() => move(index, 1)}
                  disabled={pending || index === images.length - 1}
                >
                  <ArrowDown className="ic" aria-hidden />
                </button>
                <button
                  type="button"
                  className="iconbtn-sm"
                  title={image.isPrimary ? 'Primary image' : 'Set as primary'}
                  onClick={() => setPrimary(image.id)}
                  disabled={pending || image.isPrimary}
                  style={image.isPrimary ? { color: 'var(--green-700)', borderColor: 'var(--green)' } : undefined}
                >
                  <Star className="ic" aria-hidden />
                </button>
                <span className="grow" />
                {confirmId === image.id ? (
                  <>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => remove(image.id)}
                      disabled={pending}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="iconbtn-sm"
                      title="Cancel"
                      onClick={() => setConfirmId(null)}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="iconbtn-sm"
                    title="Delete image"
                    onClick={() => setConfirmId(image.id)}
                    disabled={pending}
                  >
                    <Trash2 className="ic" aria-hidden />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
