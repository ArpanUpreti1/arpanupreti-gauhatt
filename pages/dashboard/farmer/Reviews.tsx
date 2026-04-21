import React from 'react';
import { Star, MessageSquare, ThumbsUp, MoreHorizontal } from 'lucide-react';

const Reviews: React.FC = () => {
    // Mock Data
    const reviews = [
        { id: 1, user: 'Priya Verma', rating: 5, date: '2 days ago', content: 'The organic tomatoes were incredibly fresh! Will definitely order again.', helpful: 12, reply: '' },
        { id: 2, user: 'Rahul Sharma', rating: 4, date: '1 week ago', content: 'Good quality milk, but delivery was a bit late.', helpful: 5, reply: 'Sorry for the delay, Rahul. We will ensure timely delivery next time!' },
        { id: 3, user: 'Anita Desai', rating: 5, date: '2 weeks ago', content: 'Loved the fresh veggies. Highly recommended!', helpful: 8, reply: '' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Customer Reviews</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rating Overview */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <h2 className="text-5xl font-bold text-gray-900 mb-2">4.8</h2>
                    <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={20} className="fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-gray-500 text-sm">Based on 128 reviews</p>
                </div>

                {/* Rating Breakdown */}
                <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-4">
                            <div className="flex items-center gap-1 w-12">
                                <span className="font-bold text-gray-700">{stars}</span>
                                <Star size={14} className="text-gray-400" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-400 rounded-full"
                                    style={{ width: stars === 5 ? '80%' : stars === 4 ? '15%' : '5%' }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-400 w-10 text-right">{stars === 5 ? '80%' : stars === 4 ? '15%' : '5%'}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {review.user.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{review.user}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400">• {review.date}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4 leading-relaxed">
                            {review.content}
                        </p>

                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                <ThumbsUp size={16} /> Helpful ({review.helpful})
                            </button>
                            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors">
                                <MessageSquare size={16} /> Reply
                            </button>
                        </div>

                        {review.reply && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 ml-8 relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-400 rounded-l-xl"></div>
                                <p className="text-sm font-bold text-gray-800 mb-1">Your Reply</p>
                                <p className="text-sm text-gray-600">{review.reply}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews;
