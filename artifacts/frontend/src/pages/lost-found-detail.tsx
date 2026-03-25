import { useParams, Link } from "wouter";
import { useGetLostFoundReport } from "@workspace/api-client-react";
import { ArrowLeft, Loader2, MapPin, Phone, User, Calendar } from "lucide-react";

export default function LostFoundDetail() {
  const { id } = useParams();
  const reportId = Number(id);
  const { data: report, isLoading, isError } = useGetLostFoundReport(reportId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 px-4">
        <h2 className="text-2xl font-display font-bold mb-2 text-red-500">Failed to load report</h2>
        <p className="text-gray-400 mb-6">Please try again later.</p>
        <Link href="/lost-found" className="text-primary hover:underline font-medium">
          ← Back to Lost & Found
        </Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 px-4">
        <h2 className="text-3xl font-display font-bold mb-4 text-[#1E2A3A]">Report Not Found</h2>
        <Link href="/lost-found" className="text-primary hover:underline font-medium">
          ← Back to Lost & Found
        </Link>
      </div>
    );
  }

  const isLost = report.reportType === "lost";
  const mainImage = report.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=60";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/lost-found"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1E2A3A] font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lost & Found
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {/* Hero Image */}
          <div className="relative h-72 sm:h-96 overflow-hidden">
            <img
              src={mainImage}
              alt={report.name}
              className="w-full h-full object-cover"
            />
            <span className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-white text-sm font-bold tracking-wide ${
              isLost ? "bg-red-500" : "bg-[#00B8A0]"
            }`}>
              {isLost ? "LOST" : "FOUND"}
            </span>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="font-display font-bold text-3xl text-[#1E2A3A] mb-1">{report.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {report.type && (
                    <span className="px-3 py-1 bg-[#00B8A0]/10 text-[#00B8A0] rounded-full text-sm font-semibold capitalize">
                      {report.type}
                    </span>
                  )}
                  {report.breed && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                      {report.breed}
                    </span>
                  )}
                  {report.gender && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                      report.gender === "male" ? "bg-blue-50 text-blue-500" : "bg-pink-50 text-pink-500"
                    }`}>
                      {report.gender}
                    </span>
                  )}
                  {report.color && (
                    <span className="px-3 py-1 bg-orange-50 text-orange-500 rounded-full text-sm font-semibold capitalize">
                      {report.color}
                    </span>
                  )}
                  {report.size && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-semibold capitalize">
                      {report.size}
                    </span>
                  )}
                </div>
              </div>

              <button className={`shrink-0 px-6 py-3 rounded-xl font-bold text-white text-sm transition-colors ${
                isLost ? "bg-primary hover:bg-primary/90" : "bg-[#00B8A0] hover:bg-[#00B8A0]/90"
              }`}>
                {isLost ? "I've Seen This Pet!" : "This Is My Pet!"}
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {report.city && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Location</p>
                    <p className="text-sm font-bold text-[#1E2A3A]">{report.city}</p>
                  </div>
                </div>
              )}
              {report.createdAt && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Reported On</p>
                    <p className="text-sm font-bold text-[#1E2A3A]">
                      {new Date(report.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
              {report.reporterName && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Reported By</p>
                    <p className="text-sm font-bold text-[#1E2A3A]">{report.reporterName}</p>
                  </div>
                </div>
              )}
              {report.reporterPhone && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Contact</p>
                    <p className="text-sm font-bold text-[#1E2A3A]">{report.reporterPhone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {report.description && (
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg text-[#1E2A3A] mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{report.description}</p>
              </div>
            )}

            {/* Additional Images */}
            {report.imageUrls && report.imageUrls.length > 1 && (
              <div>
                <h3 className="font-display font-bold text-lg text-[#1E2A3A] mb-3">More Photos</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {report.imageUrls.slice(1).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${report.name} photo ${i + 2}`}
                      className="h-24 w-24 object-cover rounded-xl shrink-0 border border-gray-100"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
