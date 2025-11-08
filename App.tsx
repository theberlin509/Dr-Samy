
import React, { useState, useRef, useEffect } from 'react';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Sidebar } from './components/Sidebar';
import type { Message, ImageFile, Conversation } from './types';
import { streamDrSamyResponse } from './services/geminiService';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Disclaimer } from './components/Disclaimer';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { LoginScreen } from './components/LoginScreen';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load conversations from localStorage on session change
  useEffect(() => {
    if (!session) {
      setConversations([]);
      setActiveConversationId(null);
      return;
    }
    try {
      const key = `dr-samy-conversations-${session.user.id}`;
      const storedConversations = localStorage.getItem(key);
      if (storedConversations) {
        const parsedConversations: Conversation[] = JSON.parse(storedConversations);
        setConversations(parsedConversations);
        if (parsedConversations.length > 0) {
          setActiveConversationId(parsedConversations[0].id);
        } else {
          setActiveConversationId(null);
        }
      } else {
        setConversations([]);
        setActiveConversationId(null);
      }
    } catch (e) {
      console.error("Failed to parse conversations from localStorage", e);
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [session]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (!session) return;
    const key = `dr-samy-conversations-${session.user.id}`;
    // We check for conversations length to avoid overwriting existing storage with an empty array on initial load
    if (conversations.length > 0 || localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(conversations));
    }
  }, [conversations, session]);


  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversationId, isLoading, conversations]);

  const handleSendMessage = async (prompt: string, images: File[]) => {
    if (!prompt.trim() && images.length === 0) return;

    setIsLoading(true);
    setError(null);

    const imageFiles: ImageFile[] = await Promise.all(
      images.map(async (file) => {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = (error) => reject(error);
        });
        return { name: file.name, base64, type: file.type };
      })
    );

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: prompt,
      images: imageFiles.length > 0 ? imageFiles : undefined,
    };
    
    const activeConv = conversations.find(c => c.id === activeConversationId);
    const isNewOrEmptyChat = !activeConv || activeConv.messages.length === 0;

    const conversationId = activeConv?.id || Date.now().toString();
    
    const baseHistory = isNewOrEmptyChat ? [] : activeConv.messages;
    const historyForApi = [...baseHistory, userMessage];

    if (isNewOrEmptyChat) {
      setConversations(prevConvs => {
        const existingConv = prevConvs.find(c => c.id === conversationId);
        if (existingConv) {
          return prevConvs.map(c => c.id === conversationId ? {
            ...c,
            title: prompt.substring(0, 50) || 'Nouvelle Consultation',
            messages: [userMessage],
          } : c);
        } else {
          const newConversation: Conversation = {
            id: conversationId,
            messages: [userMessage],
            title: prompt.substring(0, 50) || 'Nouvelle Consultation',
            created_at: new Date().toISOString(),
          };
          return [newConversation, ...prevConvs];
        }
      });
      if (!activeConversationId) {
        setActiveConversationId(conversationId);
      }
    } else {
      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === conversationId ? { ...conv, messages: historyForApi } : conv
        )
      );
    }
    
    const botMessageId = (Date.now() + 1).toString();
    const placeholderBotMessage: Message = {
      id: botMessageId,
      role: 'model',
      text: '',
    };
    
    setConversations(prevConvs => prevConvs.map(conv => {
        if (conv.id === conversationId) {
            return { ...conv, messages: [...conv.messages, placeholderBotMessage] };
        }
        return conv;
    }));
    
    try {
      await streamDrSamyResponse(
        historyForApi,
        (chunk) => { // onChunk
          setConversations(prevConvs => prevConvs.map(conv => {
            if (conv.id === conversationId) {
              const lastMessage = conv.messages[conv.messages.length - 1];
              if (lastMessage && lastMessage.id === botMessageId) {
                const updatedMessages = [...conv.messages];
                updatedMessages[updatedMessages.length - 1] = { ...lastMessage, text: lastMessage.text + chunk };
                return { ...conv, messages: updatedMessages };
              }
            }
            return conv;
          }));
        },
        () => { // onComplete
          setIsLoading(false);
        },
        (error) => { // onError
          throw error;
        }
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      
      let errorForBubble = `Désolé, une erreur est survenue. Veuillez réessayer. (${errorMessage})`;
      let errorForBanner = `Error: Could not get a response. ${errorMessage}`;

      if (errorMessage.includes('API key is not configured')) {
        errorForBubble = "**Erreur de configuration du serveur.**\nLa clé API pour le service Gemini n'a pas été trouvée. Si vous êtes le propriétaire de cette application, veuillez vous assurer que la variable d'environnement `API_KEY` est correctement définie dans les paramètres de votre projet Vercel et que vous avez redéployé l'application.";
        errorForBanner = "Erreur de configuration : La clé API est manquante sur le serveur. Veuillez vérifier les paramètres de déploiement.";
      }
      
      setError(errorForBanner);
      
      setConversations(prevConvs => prevConvs.map(conv => {
        if (conv.id === conversationId) {
          const lastMessage = conv.messages[conv.messages.length - 1];
          if (lastMessage && lastMessage.id === botMessageId) {
            const updatedMessages = [...conv.messages];
            updatedMessages[updatedMessages.length - 1] = { ...lastMessage, text: errorForBubble };
            return { ...conv, messages: updatedMessages };
          }
        }
        return conv;
      }));
      setIsLoading(false);
    }
  };
  
  const startNewChat = () => {
    setError(null);
    setIsSidebarOpen(false); 
    
    const newConversation: Conversation = {
        id: Date.now().toString(),
        messages: [],
        title: 'Nouvelle Consultation',
        created_at: new Date().toISOString(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsSidebarOpen(false);
  };

  const deleteConversation = (id: string) => {
    const remainingConversations = conversations.filter(c => c.id !== id);
    setConversations(remainingConversations);

    if (activeConversationId === id) {
        if (remainingConversations.length > 0) {
            setActiveConversationId(remainingConversations[0].id);
        } else {
            setActiveConversationId(null);
        }
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation ? activeConversation.messages : [];
  
  if (!session) {
    return <LoginScreen />;
  }
  
  return (
    <div className="app-container">
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <Sidebar 
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={startNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={session.user}
      />
      <div className="main-content">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="chat-window">
          <div className="chat-content">
            {messages.length === 0 && !isLoading ? (
              <WelcomeScreen />
            ) : (
              <div className="messages-list">
                {messages.map((msg, index) => {
                  // Replace the placeholder bot message with a loading indicator while waiting for the first chunk.
                  if (isLoading && msg.role === 'model' && msg.text === '' && index === messages.length - 1) {
                    return <LoadingIndicator key="loading-indicator" />;
                  }
                  return <ChatMessage key={msg.id} message={msg} />;
                })}
                <div ref={chatEndRef} />
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
          </div>
        </main>
        <footer className="footer">
          <div className="footer-content">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <Disclaimer />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;