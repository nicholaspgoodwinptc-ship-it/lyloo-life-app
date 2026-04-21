import React, { useState, useEffect } from 'react';
import { WaveHeader, Button, Card, WellnessCardImage, CommunityIcon } from '../components/ui/LayoutComponents';
import { useNavigate } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { CommunityPost, Challenge } from '../types';
import { MessageCircle, Send, Users, Calendar, CheckCircle, Share2, Flame, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Community: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'feed' | 'challenges'>('feed');
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [joiningChallengeId, setJoiningChallengeId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [postsData, challengesData] = await Promise.all([
            MockService.getPosts(),
            MockService.getChallenges()
        ]);
        setPosts(postsData);
        setChallenges(challengesData);
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !user) return;

        setIsPosting(true);
        await MockService.addPost({
            content: newPostContent,
            type: 'message'
        });
        setNewPostContent('');
        setIsPosting(false);
        loadData();
    };

    const handleReaction = async (postId: string, reaction: string) => {
        // 1. Find the current post BEFORE updating state
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        // 2. Calculate the new reaction counts
        const currentCount = post.reactions ? post.reactions[reaction] || 0 : 0;
        const isRemoving = post.userReaction === reaction;

        let newReactions = { ...(post.reactions || {}) };
        if (isRemoving) {
            newReactions[reaction] = Math.max(0, currentCount - 1);
        } else {
            if (post.userReaction) {
                newReactions[post.userReaction] = Math.max(0, (newReactions[post.userReaction] || 1) - 1);
            }
            newReactions[reaction] = currentCount + 1;
        }

        // 3. Instantly update the UI so it feels fast
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    userReaction: isRemoving ? null : reaction,
                    reactions: newReactions,
                    isLiked: reaction === '❤️' ? !isRemoving : p.isLiked
                };
            }
            return p;
        }));

        // 4. Save the calculated counts to the database!
        await MockService.reactToPost(postId, newReactions);
    };

    const handleJoinChallenge = async (id: string) => {
        setJoiningChallengeId(id);
        setTimeout(() => {
            setChallenges(prev => prev.map(c => c.id === id ? { ...c, isJoined: true, participants: c.participants + 1 } : c));
            setJoiningChallengeId(null);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-lyloo-beige dark:bg-lyloo-dark-bg pb-40 relative overflow-hidden">
            <WaveHeader
                title="Communauté"
                subtitle="Partage & Motivation"
                icon={CommunityIcon}
                showLogo={true}
                onMenuClick={() => navigate('/profil')}
                className="bg-lyloo-vertEau"
                subtitleClassName="text-4xl sm:text-5xl md:text-6xl italic ml-14"
            />

            <div className="px-4 pt-60 md:pt-72 max-w-5xl mx-auto w-full relative z-20 space-y-6">

                {/* Tabs */}
                <div className="flex bg-white dark:bg-stone-800 p-1.5 rounded-full shadow-sm w-fit mx-auto mb-4">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-lyloo-anthracite text-white shadow-md' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                    >
                        Fil d'actualité
                    </button>
                    <button
                        onClick={() => setActiveTab('challenges')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'challenges' ? 'bg-lyloo-anthracite text-white shadow-md' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                    >
                        Défis
                    </button>
                </div>

                {activeTab === 'feed' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* New Post Input */}
                        <Card className="p-4 rounded-[32px]">
                            <form onSubmit={handlePost} className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-lyloo-vertEau flex items-center justify-center font-bold text-lyloo-anthracite flex-shrink-0">
                                    {user?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder="Partagez votre humeur, une réussite..."
                                        className="w-full bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 text-sm border-none focus:ring-2 focus:ring-lyloo-vertEau outline-none resize-none min-h-[80px]"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button type="submit" disabled={!newPostContent.trim() || isPosting} size="sm" className="rounded-full">
                                            {isPosting ? 'Envoi...' : <><Send size={16} /> Publier</>}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Card>

                        {/* Posts List */}
                        <div className="space-y-4">
                            {posts.map(post => (
                                <Card key={post.id} className="p-5 rounded-[28px]">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${post.type === 'conseil' ? 'bg-lyloo-dore text-lyloo-anthracite' : post.type === 'challenge' ? 'bg-lyloo-terracotta text-white' : 'bg-stone-200 text-stone-600'}`}>
                                                {post.type === 'conseil' ? <Lightbulb size={20} /> : post.type === 'challenge' ? <Flame size={20} /> : post.author.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lyloo-anthracite dark:text-lyloo-beige">{post.author}</h4>
                                                <p className="text-xs text-stone-400">{new Date(post.date).toLocaleDateString()} • {post.type === 'conseil' ? 'Conseil' : post.type === 'challenge' ? 'Défi' : 'Message'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-stone-700 dark:text-stone-300 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                    <div className="flex items-center gap-4 pt-4 border-t border-stone-100 dark:border-stone-700">
                                        {/* Reactions */}
                                        <div className="flex gap-2">
                                            {['❤️', '👏', '🔥'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleReaction(post.id, emoji)}
                                                    className={`px-2 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${post.userReaction === emoji ? 'bg-lyloo-vertEau/20 border-lyloo-vertEau text-lyloo-anthracite' : 'bg-transparent border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                                                >
                                                    <span>{emoji}</span>
                                                    <span>{post.reactions ? post.reactions[emoji] || 0 : 0}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex-1"></div>

                                        <button className="flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-lyloo-anthracite transition-colors">
                                            <MessageCircle size={16} /> {post.comments?.length || 0}
                                        </button>
                                        <button className="flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-lyloo-anthracite transition-colors">
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'challenges' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        {challenges.length > 0 ? (
                            challenges.map(challenge => (
                                <div key={challenge.id} className="bg-gradient-to-br from-lyloo-vertEau/10 to-lyloo-vertPale/20 dark:from-stone-800 dark:to-stone-900 rounded-3xl overflow-hidden shadow-sm border border-lyloo-vertEau/30 dark:border-stone-700 flex flex-col md:flex-row hover:shadow-md transition-all hover:scale-[1.01]">
                                    <div className="h-40 md:h-auto md:w-1/3 relative">
                                        <WellnessCardImage src={challenge.image_url} alt={challenge.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:hidden">
                                            <h3 className="text-white font-bold text-xl">{challenge.title}</h3>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="hidden md:block text-xl font-bold text-lyloo-anthracite dark:text-lyloo-beige mb-2">{challenge.title}</h3>
                                            <p className="text-stone-600 dark:text-stone-300 text-sm mb-4">{challenge.description}</p>
                                            <div className="flex flex-wrap gap-4 text-xs font-bold text-stone-500 uppercase tracking-wide">
                                                <span className="flex items-center gap-1"><Users size={14} /> {challenge.participants} participants</span>
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {challenge.durationDays} Jours</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between">
                                            {challenge.isJoined ? (
                                                <div className="flex flex-col w-full gap-2">
                                                    <div className="flex justify-between text-xs font-bold text-lyloo-vertEau">
                                                        <span>En cours</span>
                                                        <span>30%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-lyloo-vertEau w-[30%]"></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleJoinChallenge(challenge.id)}
                                                    className={`w-full md:w-auto transition-all duration-300 rounded-full ${joiningChallengeId === challenge.id ? 'bg-green-500 scale-105' : 'bg-lyloo-anthracite'}`}
                                                >
                                                    {joiningChallengeId === challenge.id ? (
                                                        <><CheckCircle size={16} /> Inscrit !</>
                                                    ) : (
                                                        'Rejoindre le défi'
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-stone-400">Aucun défi disponible pour le moment.</div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Community;