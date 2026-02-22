import React from 'react';
import { ClientLayout } from '../components/ClientLayout';
import { EditorLayout } from '../components/EditorLayout';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Construction } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const isClient = user?.role === 'client';

  const Content = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/10 shadow-2xl shadow-primary-500/10">
        <MessageSquare className={`h-16 w-16 ${isClient ? 'text-primary-400' : 'text-purple-400'}`} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4 font-display">Chat System</h2>
      <p className="text-slate-400 max-w-md mb-8 text-lg">
        Real-time messaging is currently under development. Soon you'll be able to communicate directly with {isClient ? 'editors' : 'clients'} here.
      </p>
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm font-medium">
        <Construction className="h-4 w-4" />
        <span>Feature Coming Soon</span>
      </div>
    </div>
  );

  if (isClient) {
    return (
      <ClientLayout title="Messages" subtitle="Chat with your editors">
        <Content />
      </ClientLayout>
    );
  }

  return (
    <EditorLayout title="Messages" subtitle="Chat with your clients">
      <Content />
    </EditorLayout>
  );
};

export default ChatPage;
