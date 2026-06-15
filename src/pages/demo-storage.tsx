import { Link, useLocation } from 'react-router-dom';
import { Download, FileText, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDemoStoredFileFromUrl } from '@/client/demoSupabase';

const formatBytes = (size?: number) => {
  if (!size) return 'Unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DemoStoragePreview() {
  const location = useLocation();
  const file = getDemoStoredFileFromUrl(location.pathname);
  const isImage = file?.type?.startsWith('image/');

  if (!file) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <section className="max-w-lg w-full rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
          <FileText className="w-10 h-10 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold text-card-foreground">Demo File Unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This demo file link was not found in the current browser demo data.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Back to app</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              Demo preview
            </div>
            <h1 className="text-3xl font-semibold text-foreground">Demo File Preview</h1>
            <p className="mt-1 text-sm text-muted-foreground">{file.name}</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to app</Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground p-5 shadow-sm">
          {isImage && file.dataUrl ? (
            <img
              src={file.dataUrl}
              alt={file.name}
              className="max-h-[65vh] w-full rounded-md object-contain bg-muted"
            />
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-md border border-dashed bg-muted/40 text-center">
              {isImage ? (
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              ) : (
                <FileText className="w-12 h-12 text-muted-foreground" />
              )}
              <p className="mt-3 text-sm font-medium text-card-foreground">{file.name}</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Demo mode stores uploaded preview data in this browser. Seeded sample files show
                metadata only.
              </p>
            </div>
          )}

          <dl className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="font-medium text-card-foreground">Bucket</dt>
              <dd>{file.bucket}</dd>
            </div>
            <div>
              <dt className="font-medium text-card-foreground">Type</dt>
              <dd>{file.type || 'Unknown type'}</dd>
            </div>
            <div>
              <dt className="font-medium text-card-foreground">Size</dt>
              <dd>{formatBytes(file.size)}</dd>
            </div>
            <div>
              <dt className="font-medium text-card-foreground">Stored path</dt>
              <dd className="break-all">{file.path}</dd>
            </div>
          </dl>

          {file.dataUrl && (
            <Button asChild className="mt-5">
              <a href={file.dataUrl} download={file.name}>
                <Download className="w-4 h-4 mr-2" />
                Download demo file
              </a>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
