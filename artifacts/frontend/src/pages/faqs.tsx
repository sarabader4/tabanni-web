import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo-head";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_KEYS = [
  "faq1",
  "faq2",
  "faq3",
  "faq4",
  "faq5",
  "faq6",
  "faq7",
  "faq8",
  "faq9",
  "faq10",
  "faq11",
  "faq12",
  "faq13",
  "faq14",
];

export default function FAQs() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FFFAF7] min-h-screen">
      <SEOHead
        title="FAQs — Frequently Asked Questions about tabanni"
        description="Find answers to common questions about tabanni's mission, adoption process, donations, volunteering, and more."
        path="/faqs"
      />

      {/* Page Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#FA8D29]">
          {t("nav.aboutFaqs")}
        </h1>
        <div className="w-14 h-1 bg-[#FA8D29] rounded-full mt-3" />
      </div>

      {/* FAQ Accordion */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <Accordion type="single" collapsible className="w-full divide-y divide-gray-100">
            {FAQ_KEYS.map((key, index) => (
              <AccordionItem
                key={key}
                value={key}
                className="border-none py-1"
              >
                <AccordionTrigger className="text-[#333E48] font-semibold text-[15px] hover:text-[#FA8D29] hover:no-underline py-5 text-left">
                  {t(`faqs.${key}Q`)}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-[14px] leading-[1.85] pb-5 pr-6">
                  <p
                    dangerouslySetInnerHTML={{
                      __html: t(`faqs.${key}A`),
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
