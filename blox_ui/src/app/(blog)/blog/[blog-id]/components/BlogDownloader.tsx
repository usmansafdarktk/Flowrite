import { useCallback } from 'react'
import { useBlogStore } from '@/stores/blogStore';
import { Button } from '@/components/ui/Button';

/**
 * MarkdownBlogDownloader
 *
 * Props:
 *   markdown: string       — raw Markdown content
 *   metadata?: object      — optional front-matter or other data
 *   filenameBase?: string  — base name (without extension), default "blog-post"
 */
export default function BlogDownloader({
  metadata = {},
  filenameBase = 'blog-post'
}) {
  const markdown = useBlogStore((state) => state.markdown);
  
  // Utility to trigger a download of a given blob
  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // Escape HTML for embedding in a <pre>
  const escapeHtml = useCallback((str: string) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;')
  , [])

  // Handlers for each format
  const handleMd = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    downloadBlob(blob, `${filenameBase}.md`)
  }, [markdown, filenameBase, downloadBlob])

  const handleHtml = useCallback(() => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>${filenameBase}</title>
      </head>
      <body>
        <pre>${escapeHtml(markdown)}</pre>
      </body>
      </html>`
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    downloadBlob(blob, `${filenameBase}.html`)
  }, [markdown, filenameBase, escapeHtml, downloadBlob])

  const handleJson = useCallback(() => {
    const data = { metadata, content: markdown }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
    downloadBlob(blob, `${filenameBase}.json`)
  }, [metadata, markdown, filenameBase, downloadBlob])

  const handlePdf = useCallback(() => {
    // Opens the HTML in a new window; user prints to PDF manually
    const html = `
      <html><head><title>${filenameBase}</title></head>
      <body><pre>${escapeHtml(markdown)}</pre>
      <script>
        window.onload = function() { window.print(); };
      </script>
      </body></html>`
    const w = window.open()
    if (w) {
      w.document.write(html)
      w.document.close()
    }
  }, [markdown, filenameBase, escapeHtml])

  return (
    <div className='flex flex-col bg-neutral-50 p-3 gap-2'>
      <Button onClick={handleMd}>Download .md</Button>
      <Button onClick={handleHtml}>Download .html</Button>
      <Button onClick={handlePdf}>Save as .pdf</Button>
      <Button onClick={handleJson}>Download .json</Button>
    </div>
  )
}
