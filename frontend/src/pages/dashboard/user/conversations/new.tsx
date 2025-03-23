import React, { useState, useRef, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import UserLayout from '@/components/layouts/UserLayout';
import { Mic, Send, StopCircle } from 'lucide-react';

const NewConversationPage: NextPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'assistant', timestamp: Date}>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pour simuler une réponse automatique
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      respondToMessage(messages[messages.length - 1].text);
    }
  }, [messages]);

  // Pour scroller automatiquement vers le bas de la conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() === '') return;
    
    // Ajouter le message de l'utilisateur
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage('');
  };

  // Fonction pour simuler la réponse de l'assistant
  const respondToMessage = (userMessage: string) => {
    setIsLoading(true);
    
    // Simuler un délai de réponse
    setTimeout(() => {
      let response;
      
      if (userMessage.toLowerCase().includes('bonjour') || userMessage.toLowerCase().includes('salut')) {
        response = "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
      } else if (userMessage.toLowerCase().includes('aide') || userMessage.toLowerCase().includes('help')) {
        response = "Je suis Lydia, votre assistant IA. Je peux vous aider avec diverses tâches comme répondre à vos questions, vous fournir des informations, ou vous assister dans vos démarches. N'hésitez pas à me demander ce dont vous avez besoin !";
      } else if (userMessage.toLowerCase().includes('merci')) {
        response = "De rien ! C'est toujours un plaisir de vous aider. Y a-t-il autre chose que je puisse faire pour vous ?";
      } else {
        response = "J'ai bien reçu votre message. Comment puis-je vous aider davantage avec cette demande ?";
      }
      
      const assistantMessage = {
        id: Date.now().toString(),
        text: response,
        sender: 'assistant' as const,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Ici, on simulerait le démarrage de l'enregistrement
      console.log('Démarrage de l\'enregistrement vocal');
    } else {
      // Ici, on simulerait l'arrêt de l'enregistrement et le traitement de l'audio
      console.log('Arrêt de l\'enregistrement vocal');
      
      // Simuler un message reconnu
      setTimeout(() => {
        setMessage('Ceci est un message enregistré par reconnaissance vocale.');
      }, 1000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <UserLayout>
      <div className="h-full flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Nouvelle conversation</h1>
          <p className="text-sm text-gray-500 mt-1">Discutez avec Lydia, votre assistant intelligent</p>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <Mic className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="mt-4 text-center text-sm text-gray-500">
                Commencez à discuter avec Lydia en envoyant un message écrit ou vocal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-xs sm:max-w-md px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-200">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Barre de saisie du message */}
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleRecording}
              className={`inline-flex items-center justify-center p-2 rounded-full ${
                isRecording ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'
              } hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isRecording ? (
                <StopCircle className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              placeholder="Écrivez votre message..."
              className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={message.trim() === ''}
              className={`ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm ${
                message.trim() === ''
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default NewConversationPage; 