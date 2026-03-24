import { useParams, Link } from "wouter";
import { useGetGalleryPost, useListGalleryPosts } from "@workspace/api-client-react";
import { ArrowLeft, Loader2, PawPrint } from "lucide-react";

export default function GalleryDetail() {
  const { id } = useParams();
  const postId = Number(id);
  const { data: post, isLoading } = useGetGalleryPost(postId);
  const { data: allPosts } = useListGalleryPosts({ limit: 10 });

  const related = (Array.isArray(allPosts) ? allPosts : []).filter((p) => p.id !== postId).slice(0, 3);

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

        {/* You Might Like */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-[#1E2A3A] mb-5">You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link key={item.id} href={`/gallery/${item.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-36 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <PawPrint className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500">
                          {item.authorName || "tabbanni"}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#1E2A3A] line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
