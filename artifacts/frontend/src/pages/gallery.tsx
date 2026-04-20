import { useListGalleryPosts } from "@workspace/api-client-react";
import { Loader2, User } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function Gallery() {
  const { t } = useTranslation();
  const { data: posts, isLoading, isError } = useListGalleryPosts({ limit: 50 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-32 flex-col gap-4">
        <p className="text-red-500 font-bold text-lg">{t("gallery.failedLoad")}</p>
        <p className="text-gray-400 text-sm">{t("gallery.failedLoadSub")}</p>
      </div>
    );
  }

  const col1 = posts?.filter((_, i) => i % 3 === 0) ?? [];
  const col2 = posts?.filter((_, i) => i % 3 === 1) ?? [];
  const col3 = posts?.filter((_, i) => i % 3 === 2) ?? [];

  function GalleryCard({ post }: { post: NonNullable<typeof posts>[number] }) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 mb-4 break-inside-avoid">
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.headline || post.title}
            className="w-full object-cover"
            loading="lazy"
            decoding="async"
            style={{ maxHeight: "280px" }}
          />
        )}
        <div className="p-4">
          <h3 className="font-bold text-[#333E48] text-sm leading-snug mb-2 line-clamp-2">
            {post.headline || post.title}
          </h3>
          {post.ownerName && (
            <div className="flex items-center gap-1.5 mb-3">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{post.ownerName}</span>
            </div>
          )}
          <Link
            href={`/gallery/${post.id}`}
            className="inline-block px-4 py-1.5 border border-gray-200 rounded-full text-xs font-semibold text-[#333E48] hover:border-primary hover:text-primary transition-colors"
          >
            {t("gallery.readMore")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {(!posts || posts.length === 0) ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">{t("gallery.noStories")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              {col1.map((post) => (
                <GalleryCard key={post.id} post={post} />
              ))}
            </div>
            <div>
              {col2.map((post) => (
                <GalleryCard key={post.id} post={post} />
              ))}
            </div>
            <div className="hidden lg:block">
              {col3.map((post) => (
                <GalleryCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
