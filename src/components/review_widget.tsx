'use client';

import { useEffect, useState } from 'react';

export default function ReviewsWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/reviews/7afe6127-38f7-42b5-9efd-160105ad86f1?limit=6?limit=6")
      .then(res => res.json())
      .then(({ data }) => {
        setData(data);
        setLoading(false);
      });
  }, []); // Empty deps array = fetch once on mount

  if (loading) return <div>Loading reviews...</div>;
  if (!data) return null;

  return (
   <section className="max-w-[100vw] mx-auto px-4 py-8 overflow-hidden relative">
      <div className="max-w-7xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold text-white pb-4 border-b border-white/10 tracking-tight">
          What Our Customers Say
        </h2>
      </div>
      
      {/* Left/Right Fade Overlays for smooth scrolling edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

      <div className="flex w-max overflow-hidden">
        {/* We duplicate the reviews array to create a seamless infinite scrolling effect */}
        <div 
          className="flex space-x-6 px-3"
          style={{
            animation: "scroll 40s linear infinite",
          }}
        >
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .pause-on-hover:hover {
              animation-play-state: paused !important;
            }
          `}</style>
          
          {[...data.reviews, ...data.reviews, ...data.reviews].map((review: any, index: number) => (
            <article 
              key={`${review.id}-${index}`} 
              className="bg-zinc-900/60 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 p-6 border border-white/10 w-[350px] shrink-0 pause-on-hover group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <strong className="text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  {review.customer_name}
                </strong>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  {review.stars}/5
                </span>
              </div>
              
              <p className="text-zinc-400 leading-relaxed text-sm font-medium">
                {review.review_text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}