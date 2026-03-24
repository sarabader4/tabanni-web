import { useParams, Link } from "wouter";
import { useGetGalleryPost } from "@workspace/api-client-react";
import { ArrowLeft, Loader2, PawPrint } from "lucide-react";

export default function GalleryDetail() {
  const { id } = useParams();
  const { data: post, isLoading } = useGetGalleryPost(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-3xl font-display font-bold mb-4 text-[#1E2A3A]">Story Not Found</h2>
        <Link href="/gallery" className="text-primary hover:underline font-medium">
          ← Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1E2A3A] font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full object-cover"
              style={{ maxHeight: "420px" }}
            />
          )}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-[#1E2A3A]">{post.authorName || "tabbanni"}</span>
              {post.createdAt && (
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(post.createdAt).toLocaleDateString("en", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-bold text-[#1E2A3A] mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
              {post.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
