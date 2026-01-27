import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Send, User as UserIcon, Loader } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    isValid: boolean;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
    };
    receiver: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export const Messaging = () => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversations, setConversations] = useState<any[]>([]); // simplified for now
    const [selectedUser, setSelectedUser] = useState<string | null>(null); // userId
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch inbox to determine conversations
    // For a real app, we'd want a separate "get conversations" endpoint
    // For now, we'll just fetch all messages and group them or use the /inbox endpoint
    useEffect(() => {
        // This is a simplified approach. In a real app, you'd list users to chat with.
        // We will fetch "users" to chat with based on role (e.g. parent sees teachers)
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Re-using user management for now or we could add a specific "contacts" endpoint
            const users = await api.request('GET', '/users');
            // Filter out self
            setConversations(users.filter((u: any) => u.id !== user?.id));
        } catch (err) {
            console.error("Failed to load contacts", err);
        }
    };

    const fetchConversation = async (userId: string) => {
        setIsLoading(true);
        setSelectedUser(userId);
        try {
            const msgs = await api.request('GET', `/messages/conversation/${userId}`);
            setMessages(msgs);
            scrollToBottom();
        } catch (err) {
            console.error("Failed to load conversation", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const msg = await api.request('POST', '/messages/send', {
                receiverId: selectedUser,
                content: newMessage
            });
            setMessages([...messages, msg]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow overflow-hidden border border-gray-200">
            {/* Sidebar / Contacts */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-bold text-gray-800">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(u => (
                        <div
                            key={u.id}
                            onClick={() => fetchConversation(u.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors flex items-center space-x-3 ${selectedUser === u.id ? 'bg-white border-l-4 border-l-primary-600' : ''}`}
                        >
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                                {u.firstName[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                                <p className="text-xs text-gray-500 capitalize">{u.role.toLowerCase()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                                    <UserIcon size={16} />
                                </div>
                                <span className="font-bold text-gray-800">
                                    {conversations.find(u => u.id === selectedUser)?.firstName} {conversations.find(u => u.id === selectedUser)?.lastName}
                                </span>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader className="animate-spin text-primary-600" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-400 mt-10">
                                    <p>No messages yet. Say hello!</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.senderId === user?.id; // Assuming user.id is available from store
                                    // Hack: user object from store might use 'id' or 'userId'
                                    // Check how useAuthStore stores user data.
                                    // Usually it is user.id
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] p-3 rounded-2xl ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <Send size={32} className="text-gray-400 ml-1" />
                        </div>
                        <p className="text-lg font-medium">Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};
