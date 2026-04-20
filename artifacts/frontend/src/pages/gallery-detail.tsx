import { useParams, Link } from "wouter";
import { useGetGalleryPost, useListGalleryPosts } from "@workspace/api-client-react";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function GalleryDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const postId = Number(id);
  const { data: post, isLoading, isError } = useGetGalleryPost(postId);
  const { data: allPosts } = useListGalleryPosts({ limit: 10 });

  const related = (Array.isArray(allPosts) ? allPosts : []).filter((p) => p.id !== postId).slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-2xl font-display font-bold mb-2 text-red-500">{t("galleryDetail.failedLoad")}</h2>
        <p className="text-gray-400 mb-6">{t("galleryDetail.failedLoadSub")}</p>
        <Link href="/gallery" className="text-primary hover:underline font-medium">
          ← {t("galleryDetail.backToGallery")}
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-3xl font-display font-bold mb-4 text-[#333E48]">{t("galleryDetail.notFound")}</h2>
        <Link href="/gallery" className="text-primary hover:underline font-medium">
          ← {t("galleryDetail.backToGallery")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#333E48] font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t("galleryDetail.backToGallery")}
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.headline || post.title}
              className="w-full object-cover"
              style={{ maxHeight: "420px" }}
            />
          )}
          <div className="p-8">
            <h1 className="font-display text-3xl font-bold text-[#333E48] mb-3 leading-tight">
              {post.headline || post.title}
            </h1>

            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm font-semibold text-[#333E48]">
                {post.ownerName || post.authorName || "tabbanni"}
              </span>
              {post.createdAt && (
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
              {post.content}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-[#333E48] mb-5">{t("galleryDetail.youMightLike")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link key={item.id} href={`/gallery/${item.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.headline || item.title}
                        className="w-full h-36 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-[#333E48] line-clamp-2 leading-snug mb-1.5">
                        {item.headline || item.title}
                      </h3>
                      {item.ownerName && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <User className="w-3 h-3" />
                          <span>{item.ownerName}</span>
                        </div>
                      )}
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
