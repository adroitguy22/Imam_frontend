import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { MessageSquare, Search, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ChatSession {
    id: string;
    userId: string;
    updatedAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    messages: {
        content: string;
        timestamp: string;
    }[];
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    content: string;
    timestamp: string;
}

const ChatMonitoring: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [sessionDetails, setSessionDetails] = useState<ChatMessage[]>([]);
    const { accessToken } = useAuthStore();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        if (accessToken) {
            fetchSessions();
        }
    }, [accessToken]);

    useEffect(() => {
        if (selectedSessionId && accessToken) {
            fetchSessionDetails(selectedSessionId);
        }
    }, [selectedSessionId, accessToken]);

    const fetchSessions = async () => {
        try {
            const response = await axios.get(`${API_URL}/chat/admin/sessions`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to load chat sessions:', error);
        }
    };

    const fetchSessionDetails = async (sessionId: string) => {
        try {
            const response = await axios.get(`${API_URL}/chat/admin/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setSessionDetails(response.data.messages);
        } catch (error) {
            console.error('Failed to load session details:', error);
        }
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
            {/* Sidebar: Session List */}
            <div className="w-1/3 min-w-[300px] bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-emerald-600" />
                        Chat Sessions
                    </h2>
                    <div className="mt-4 relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.map(session => (
                        <div
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSessionId === session.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-gray-900">{session.user.firstName} {session.user.lastName}</span>
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {format(new Date(session.updatedAt), 'MMM d, p')}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-1 italic">
                                "{session.messages[0]?.content || 'No messages'}"
                            </p>
                        </div>
                    ))}
                    {sessions.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No chat sessions found.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content: Chat View */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedSessionId ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                                    {sessions.find(s => s.id === selectedSessionId)?.user.firstName[0]}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {sessions.find(s => s.id === selectedSessionId)?.user.firstName} {sessions.find(s => s.id === selectedSessionId)?.user.lastName}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        User ID: {sessions.find(s => s.id === selectedSessionId)?.userId}
                                    </p>
                                </div>
                            </div>
                            {/* Could add actions here later, e.g. "Flag Session" */}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {sessionDetails.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    {/* Note: In monitoring, we might want User on Left, Bot on Right, or vice versa. 
                                Usually User Left (Incoming) and Agent/Bot Right (Outgoing) is standard for support tools, 
                                but mimicking the user's view (User Right, Bot Left) shows exactly what they saw.
                                Let's stick to a distinct style. 
                             */}
                                    <div className={`flex flex-col max-w-[70%] ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}>
                                        <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                            ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                            : 'bg-emerald-600 text-white rounded-tr-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {msg.sender === 'user' ? 'User' : 'IMAN Bot'} • {format(new Date(msg.timestamp), 'p')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a session to view the conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMonitoring;
