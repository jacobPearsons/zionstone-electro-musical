'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { CheckCircle2, ImagePlus, Loader2, Tag, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FadeIn } from '@/components/ui/animated';
import { CATEGORIES } from '@/data/categories';
import { ApiError, submitProduct, type ApiQueuedProduct } from '@/lib/backend-api';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_TAGS,
  submissionSchema,
  type SubmissionValues,
} from '@/lib/submission';

const ACCEPTED_TYPES: readonly string[] = ALLOWED_IMAGE_TYPES;

const fieldLabel = 'text-sm font-medium';
const fieldError = 'mt-1 text-sm text-destructive';

export default function SellPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitted, setSubmitted] = useState<ApiQueuedProduct | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionValues>({
    resolver: zodResolver(submissionSchema) as Resolver<SubmissionValues>,
    defaultValues: {
      name: '',
      brand: '',
      category: '',
      tags: [],
      description: '',
      price: undefined,
      contact: '',
    },
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const chooseImage = (file: File | null | undefined) => {
    setImageError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError('Use a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be 10MB or smaller');
      return;
    }
    setImage(file);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const removeImage = () => {
    setImage(null);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTags = (raw: string) => {
    const additions = raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (additions.length === 0) return;
    setTags((current) => [...new Set([...current, ...additions])].slice(0, MAX_TAGS + 1));
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((current) => current.filter((value) => value !== tag));
  };

  const onSubmit = async (data: SubmissionValues) => {
    setSubmitError(null);
    if (tags.length > MAX_TAGS) {
      setSubmitError(`Add at most ${MAX_TAGS} tags`);
      return;
    }
    if (!image) {
      setImageError('A product photo is required');
      return;
    }

    try {
      const body = new FormData();
      body.set('name', data.name);
      if (data.brand) body.set('brand', data.brand);
      body.set('category', data.category);
      body.set('tags', JSON.stringify(tags));
      body.set('description', data.description);
      if (data.price != null) body.set('price', String(data.price));
      if (data.contact) body.set('contact', data.contact);
      body.set('image', image);

      const { product } = await submitProduct(body);

      toast.success('Submission received');
      setSubmitted(product);
      setIsSubmitted(true);
      reset();
      setTags([]);
      setTagInput('');
      removeImage();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
      toast.error(message);
    }
  };

  const tagsOverLimit = tags.length > MAX_TAGS;

  if (isSubmitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 md:py-16">
        <FadeIn>
          <div className="rounded-card border border-border bg-card p-8 shadow-card text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">We&apos;ve received your gear</h1>
            <p className="mt-2 text-muted-foreground">
              We&apos;ll review your submission and publish it. Every listing is checked by our team
              before it appears in the store, so it won&apos;t be live straight away.
            </p>
            {submitted && (
              <div className="mx-auto mt-6 max-w-xs overflow-hidden rounded-card border border-border">
                {/* The API returns an absolute image URL (its own uploads host),
                    so a plain <img> avoids needing that host in next.config. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={submitted.imagePath}
                  alt={submitted.name}
                  className="h-40 w-full object-cover"
                />
                <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  Reference: <span className="font-mono">{submitted.slug}</span>
                </p>
              </div>
            )}
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => setIsSubmitted(false)}>Submit another item</Button>
              <Button asChild variant="outline">
                <Link href="/products">Browse the store</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Sell Your Gear</h1>
        <p className="mt-2 text-muted-foreground">
          List an instrument you want to sell. Add a photo and a description, and it goes straight to
          our review queue.
        </p>
      </div>

      <div
        role="note"
        className="mb-6 rounded-card border border-border bg-muted p-4 text-sm text-muted-foreground"
      >
        Submissions are reviewed by our team before going live. Publishing happens in batches, so
        approval does not put your item in the store instantly.
      </div>

      <FadeIn>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-card border border-border bg-card p-6 shadow-card"
        >
          {submitError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {submitError}
            </div>
          )}

          <div>
            <label className={fieldLabel} htmlFor="name">
              Product name <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              placeholder="e.g. Fender Stratocaster American Pro II"
              className="mt-1.5"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name?.message && (
              <p className={fieldError} role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className={fieldLabel} htmlFor="brand">
              Brand
            </label>
            <Input
              id="brand"
              placeholder="e.g. Fender"
              className="mt-1.5"
              {...register('brand')}
            />
            {errors.brand?.message && (
              <p className={fieldError} role="alert">
                {errors.brand.message}
              </p>
            )}
          </div>

          <div>
            <label className={fieldLabel} htmlFor="category">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              id="category"
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-invalid={Boolean(errors.category)}
              defaultValue=""
              {...register('category')}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category?.message && (
              <p className={fieldError} role="alert">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className={fieldLabel} htmlFor="tags">
              Tags
            </label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-pill bg-muted px-3 py-1 text-xs font-medium"
                >
                  <Tag className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
              <input
                id="tags"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault();
                    addTags(tagInput);
                  }
                }}
                onBlur={() => addTags(tagInput)}
                placeholder={tags.length === 0 ? 'Type a tag and press Enter' : 'Add another tag'}
                className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Up to {MAX_TAGS} tags. Press Enter or comma to add (e.g. electric, vintage, six-string).
            </p>
            {tagsOverLimit && (
              <p className={fieldError} role="alert">
                Add at most {MAX_TAGS} tags
              </p>
            )}
          </div>

          <div>
            <label className={fieldLabel} htmlFor="description">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Describe the condition, history, and anything a buyer should know..."
              className="mt-1.5 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-invalid={Boolean(errors.description)}
              {...register('description')}
            />
            {errors.description?.message && (
              <p className={fieldError} role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className={fieldLabel} htmlFor="price">
              Asking price (NGN)
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₦
              </span>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Optional"
                className="pl-8"
                aria-invalid={Boolean(errors.price)}
                {...register('price')}
              />
            </div>
            {errors.price?.message && (
              <p className={fieldError} role="alert">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <label className={fieldLabel} htmlFor="contact">
              Contact (WhatsApp or phone)
            </label>
            <Input
              id="contact"
              placeholder="e.g. +234 801 234 5678"
              className="mt-1.5"
              {...register('contact')}
            />
            {errors.contact?.message && (
              <p className={fieldError} role="alert">
                {errors.contact.message}
              </p>
            )}
          </div>

          <div>
            <span className={fieldLabel}>
              Product photo <span className="text-destructive">*</span>
            </span>
            {preview ? (
              <div className="mt-1.5 overflow-hidden rounded-card border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Selected product preview" className="h-64 w-full object-cover" />
                <div className="flex items-center justify-between gap-3 border-t border-border p-3">
                  <span className="truncate text-sm text-muted-foreground">{image?.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={removeImage} aria-label="Remove photo">
                    <X className="mr-2 h-4 w-4" aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  chooseImage(event.dataTransfer.files?.[0]);
                }}
                className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium">Drag and drop a photo, or click to browse</p>
                <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP up to 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Product photo"
              className="hidden"
              onChange={(event) => chooseImage(event.target.files?.[0])}
            />
            {imageError && (
              <p className={fieldError} role="alert">
                {imageError}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                Submit for review
              </>
            )}
          </Button>
        </form>
      </FadeIn>
    </div>
  );
}
