import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  ExternalLink,
  Loader2,
  Sparkles,
  User as UserIcon,
  ChevronLeft
} from 'lucide-react';
import { chatsApi, claimsApi } from '../services/api';
import wsService from '../services/websocket';
import { useAuth } from '../context/AuthContext';

export const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(conversationId || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeClaim, setActiveClaim] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      setActiveConvId(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);

      // Subscribe to real-time STOMP topic
      const unsub = wsService.subscribeToConversation(activeConvId, (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });

      return () => {
        unsub();
      };
    }
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setLoadingConvs(true);
    try {
      const res = await chatsApi.getMyConversations();
      const list = res.data || [];
      setConversations(list);
      if (!activeConvId && list.length > 0) {
        setActiveConvId(list[0].id);
        navigate(`/chats/${list[0].id}`, { replace: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConvs(false);
    }
  };

  const fetchMessages = async (convId) => {
    setLoadingMessages(true);
    try {
      const res = await chatsApi.getMessages(convId);
      setMessages(res.data || []);

      // Also get claim state to show finder confirm button if applicable
      const conv = conversations.find((c) => c.id === convId);
      if (conv?.claimId) {
        const claimRes = await claimsApi.getClaimById(conv.claimId);
        setActiveClaim(claimRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      // Send via REST endpoint (which also broadcasts over STOMP)
      const res = await chatsApi.sendMessage(activeConvId, text);
      if (res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleConfirmOwner = async () => {
    if (!activeClaim) return;
    if (!window.confirm('Confirm this person as the genuine owner? This will generate a pickup reference code and lock other claims.')) return;

    setConfirming(true);
    try {
      const res = await claimsApi.confirmOwner(activeClaim.id);
      setActiveClaim(res.data);
      alert('Genuine owner confirmed! Pickup reference code: ' + res.data.pickupReferenceCode);
    } catch (err) {
      alert(err.message || 'Failed to confirm owner.');
    } finally {
      setConfirming(false);
    }
  };

  const handleRejectClaim = async () => {
    if (!activeClaim) return;
    const reason = window.prompt('Enter reason for rejecting this claim (optional):');
    if (reason === null) return;

    try {
      const res = await claimsApi.rejectClaim(activeClaim.id, reason);
      setActiveClaim(res.data);
      alert('Claim rejected.');
    } catch (err) {
      alert(err.message || 'Failed to reject claim.');
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const isFinder = activeClaim && user?.id === activeClaim.finderUserId;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex-1 flex flex-col md:flex-row overflow-hidden min-h-[680px]">

        {/* LEFT COLUMN: Conversations List (Screen #5 Mockup) */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Conversations
            </h2>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {loadingConvs && (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-1" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            )}

            {!loadingConvs && conversations.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active conversations yet. Take an ownership quiz on an approved found item to initiate a chat.
              </div>
            )}

            {!loadingConvs && conversations.map((conv) => {
              const isSelected = conv.id === activeConvId;
              const img = conv.itemImageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80';

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    navigate(`/chats/${conv.id}`);
                  }}
                  className={`w-full p-3.5 text-left flex items-center gap-3 transition-colors ${isSelected ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'hover:bg-slate-100/70 bg-white'
                    }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img src={img} alt={conv.itemTitle} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{conv.itemTitle}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.otherParticipantName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 italic">
                      {conv.lastMessage || 'Quiz passed. Chat opened.'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Panel (Screen #5 Mockup) */}
        <div className={`flex-1 flex flex-col bg-white ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Header with Item Summary and Finder Confirm Actions */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
                    <img
                      src={activeConversation.itemImageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80'}
                      alt={activeConversation.itemTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {activeConversation.itemTitle}
                      {activeClaim?.status === 'CONFIRMED_BY_FINDER' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          Ownership Confirmed
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Talking with: <span className="font-semibold text-slate-700">{activeConversation.otherParticipantName}</span>
                    </p>
                  </div>
                </div>

                {/* Finder Confirmation Buttons */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/items/${activeConversation.itemId}`}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Item
                  </Link>

                  {isFinder && activeClaim?.status !== 'CONFIRMED_BY_FINDER' && activeClaim?.status !== 'COMPLETED' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleConfirmOwner}
                        disabled={confirming}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirm Owner
                      </button>
                      <button
                        onClick={handleRejectClaim}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-[#FBFBFB]">
                {loadingMessages && (
                  <div className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                  </div>
                )}

                {!loadingMessages && messages.length === 0 && (
                  <div className="py-16 text-center space-y-2 max-w-sm mx-auto">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Ownership challenge verified!</p>
                    <p className="text-[11px] text-slate-400">
                      You are connected directly with the other party. Coordinate pickup timing and any remaining verification details safely.
                    </p>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-400 mb-1 px-1">
                        {isMe ? 'You' : msg.senderName} • {timeStr}
                      </span>
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${isMe
                            ? 'bg-amber-400 text-slate-950 font-medium rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                          }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center justify-center transition-all disabled:opacity-50 shrink-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
              <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
              Select a conversation to begin chatting.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatPage;
