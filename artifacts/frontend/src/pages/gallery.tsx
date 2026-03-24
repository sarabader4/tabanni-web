import { useListGalleryPosts } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Gallery() {
  const { data: posts, isLoading } = useListGalleryPosts({ limit: 50 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
          Happy Tails
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          There's nothing we love more than seeing our rescued pets thriving in their forever homes. Read the success stories from our community.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {posts?.map((post) => (
            <div key={post.id} className="break-inside-avoid bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300">
              {post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full object-cover border-b border-border/50"
                  loading="lazy"
                />
              )}
              <div className="p-6 md:p-8">
                <h3 className="font-display font-bold text-2xl mb-3 text-foreground leading-tight">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                  {post.content}
                </p>
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground pt-4 border-t border-border/50">
                  <span className="uppercase tracking-wider text-primary">{post.authorName || "Anonymous"}</span>
                  <span>{format(new Date(post.createdAt), "MMM yyyy")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
