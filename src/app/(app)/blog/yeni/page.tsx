import { PageHeader } from "@/components/ui/PageHeader";
import { BlogEditorForm } from "@/components/blog/BlogEditorForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <PageHeader eyebrow="Blog" title="Yeni yazı" description="Kitaplar, okuma rutinleri, denemeler — ne istersen." />
      <BlogEditorForm />
    </div>
  );
}
