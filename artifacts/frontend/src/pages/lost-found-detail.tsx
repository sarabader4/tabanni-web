import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetLostFoundReport } from "@workspace/api-client-react";
import {
  ArrowLeft, Loader2, MapPin, Phone, User, Calendar,
  ChevronLeft, ChevronRight, Share2, MessageCircle,
  AlertCircle, CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LostFoundDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const reportId = Number(id);
  const { data: report, isLoading, isError } = useGetLostFoundReport(reportId);
  const [photoIndex, setPhotoIndex] = useState(0);

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
        <h2 className="text-2xl font-display font-bold mb-2 text-red-500">{t("lostFoundDetail.failedLoad")}</h2>
        <p className="text-gray-400 mb-6">{t("lostFoundDetail.failedLoadSub")}</p>
        <Link href="/lost-found" className="text-primary hover:underline font-medium">
          ← {t("lostFoundDetail.backToLostFound")}
        </Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 px-4">
        <h2 className="text-3xl font-display font-bold mb-4 text-[#333E48]">{t("lostFoundDetail.notFound")}</h2>
        <Link href="/lost-found" className="text-primary hover:underline font-medium">
          ← {t("lostFoundDetail.backToLostFound")}
        </Link>
      </div>
    );
  }

  const isLost = report.reportType === "lost";
  const images: string[] = report.imageUrls?.length
    ? report.imageUrls
    : ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=60"];

  const currentPhoto = images[photoIndex];
  const reportDate = isLost ? report.lostDate : report.foundDate;
  const locale = i18n.language === "ar" ? "ar-SA" : "en-US";
  const formattedDate = reportDate
    ? new Date(reportDate).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })
    : report.createdAt
    ? new Date(report.createdAt).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })
    : null;

  const whatsappLink = report.whatsappUrl
    ? `${report.whatsappUrl}?text=Hi, I saw your ${isLost ? "lost" : "found"} pet report for ${report.name} on Tabanni.`
    : report.reporterPhone
    ? `https://wa.me/${report.reporterPhone.replace(/\D/g, "")}?text=Hi, I saw your ${isLost ? "lost" : "found"} pet report for ${report.name} on Tabanni.`
    : null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${isLost ? "Lost" : "Found"} Pet: ${report.name}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const lostTips = [
    t("lostFoundDetail.tipLost1"),
    t("lostFoundDetail.tipLost2"),
    t("lostFoundDetail.tipLost3"),
    t("lostFoundDetail.tipLost4"),
    t("lostFoundDetail.tipLost5"),
  ];

  const foundTips = [
    t("lostFoundDetail.tipFound1"),
    t("lostFoundDetail.tipFound2"),
    t("lostFoundDetail.tipFound3"),
    t("lostFoundDetail.tipFound4"),
    t("lostFoundDetail.tipFound5"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/lost-found"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#333E48] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("lostFoundDetail.backToLostFound")}
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" /> {t("lostFoundDetail.share")}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative" style={{ height: "360px" }}>
                <img
                  src={currentPhoto}
                  alt={report.name}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-4 start-4 px-4 py-1.5 rounded-full text-white text-sm font-bold tracking-wide ${
                  isLost ? "bg-red-500" : "bg-[#3D937F]"
                }`}>
                  {isLost ? t("lostFoundDetail.lost") : t("lostFoundDetail.found")}
                </span>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute start-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#333E48] rtl:rotate-180" />
                    </button>
                    <button
                      onClick={() => setPhotoIndex((i) => (i + 1) % images.length)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-[#333E48] rtl:rotate-180" />
                    </button>
                    <div className="absolute bottom-3 start-0 end-0 flex justify-center gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === photoIndex ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === photoIndex ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="font-display font-bold text-3xl text-[#333E48]">{report.name}</h1>
                <div className="flex flex-wrap gap-2 justify-end">
                  {report.gender && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                      report.gender === "male" ? "bg-blue-50 text-blue-500" : "bg-pink-50 text-pink-500"
                    }`}>
                      {report.gender}
                    </span>
                  )}
                  {report.size && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-semibold capitalize">
                      {report.size}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-display font-bold text-base text-[#333E48] mb-3">{t("lostFoundDetail.petInformation")}</h3>
              <div className="divide-y divide-gray-100">
                {[
                  { label: t("lostFoundDetail.type"), value: report.type },
                  { label: t("lostFoundDetail.breed"), value: report.breed },
                  { label: t("lostFoundDetail.color"), value: report.color },
                  { label: isLost ? t("lostFoundDetail.lostDate") : t("lostFoundDetail.foundDate"), value: formattedDate },
                  { label: t("lostFoundDetail.location"), value: report.city },
                  { label: "Area", value: report.area },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5">
                    <span className="text-sm text-gray-400 font-medium">{label}</span>
                    <span className="text-sm font-semibold text-[#333E48] capitalize">{value}</span>
                  </div>
                ))}
              </div>

              {report.description && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <h3 className="font-display font-bold text-base text-[#333E48] mb-2">{t("lostFoundDetail.description")}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{report.description}</p>
                </div>
              )}
            </div>

            <div className={`rounded-2xl border p-6 ${
              isLost ? "bg-orange-50 border-orange-100" : "bg-teal-50 border-teal-100"
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className={`w-5 h-5 ${isLost ? "text-primary" : "text-[#3D937F]"}`} />
                <h3 className="font-display font-bold text-base text-[#333E48]">
                  {isLost ? t("lostFoundDetail.tipsLost") : t("lostFoundDetail.tipsFound")}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {(isLost ? lostTips : foundTips).map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isLost ? "text-primary" : "text-[#3D937F]"}`} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-display font-bold text-base text-[#333E48] mb-4">{t("lostFoundDetail.ownerReporter")}</h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-[#333E48] text-sm">{report.reporterName || t("lostFoundDetail.anonymous")}</p>
                  {report.city && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {report.city}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {report.reporterPhone && (
                  <a
                    href={`tel:${report.reporterPhone}`}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-semibold text-[#333E48]"
                  >
                    <Phone className="w-4 h-4 text-gray-400" /> {report.reporterPhone}
                  </a>
                )}

                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-white font-bold text-sm transition-colors ${
                      isLost ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" /> {t("lostFoundDetail.chatWhatsApp")}
                  </a>
                )}
              </div>

              {formattedDate && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {isLost
                    ? t("lostFoundDetail.lostOn", { date: formattedDate })
                    : t("lostFoundDetail.foundOn", { date: formattedDate })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
