"use client";

import { ExternalLink, FileText, Video } from "lucide-react";
import Link from "next/link";

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  videoUrl?: string;
  docUrl?: string;
}

interface HelpArticleCardProps {
  article: HelpArticle;
}

export function HelpArticleCard({ article }: HelpArticleCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
          {article.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">{article.description}</p>

          <div className="flex items-center gap-3">
            {article.videoUrl && (
              <a
                href={article.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <Video className="w-4 h-4" />
                Watch Video
              </a>
            )}
            {article.docUrl && (
              <Link
                href={article.docUrl}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <FileText className="w-4 h-4" />
                Read Guide
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
