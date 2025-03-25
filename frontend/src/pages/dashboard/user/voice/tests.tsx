import { useState, useRef, useEffect } from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { Mic, MicOff, Play, Send, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import UserLayout from '@/components/layouts/UserLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  audioUrl?: string;
  isLoading?: boolean;
  isVoiceMessage?: boolean;
}

interface CompanyData {
  id?: string;
  name: string;
  description: string;
  industry?: string;
  voiceSettings?: {
    gender?: string;
    language?: string;
    tone?: string;
    tempo?: string;
  };
  knowledgeBase?: {
    enabled: boolean;
    documents?: string[];
  };
}

const TestsAudioPage: NextPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoadingCompanyData, setIsLoadingCompanyData] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les données de l'entreprise
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoadingCompanyData(true);
        // Construire l'URL API
        let apiUrl;
        
        if (process.env.NEXT_PUBLIC_API_URL) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL.endsWith('/') 
            ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1) 
            : process.env.NEXT_PUBLIC_API_URL;
          
          apiUrl = `${baseUrl}/companies/user`;
        } else {
          apiUrl = `/api/companies/user`;
        }
        
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.data) {
          setCompanyData(response.data.data);
          console.log('Données de l\'entreprise chargées:', response.data.data);
        } else {
          // Données par défaut si aucune entreprise n'est trouvée
          setCompanyData({
            name: user?.firstName ? `Entreprise de ${user.firstName}` : 'Votre entreprise',
            description: 'Assistant vocal intelligent',
            industry: 'Technologie',
            voiceSettings: {
              gender: 'female',
              language: 'fr-FR',
              tone: 'professional',
              tempo: 'medium'
            },
            knowledgeBase: {
              enabled: false
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de l\'entreprise:', error);
        // Données par défaut en cas d'erreur
        setCompanyData({
          name: user?.firstName ? `Entreprise de ${user.firstName}` : 'Votre entreprise',
          description: 'Assistant vocal intelligent',
          voiceSettings: {
            gender: 'female',
            language: 'fr-FR'
          },
          knowledgeBase: {
            enabled: false
          }
        });
      } finally {
        setIsLoadingCompanyData(false);
      }
    };
    
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  // Scroll automatique vers le dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Arrêter l'enregistrement et nettoyer les ressources lors du démontage
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  // Gérer l'envoi du message texte
  const sendMessage = async () => {
    if (message.trim() === '') return;
    
    // Ajouter le message de l'utilisateur
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage('');
    
    // Envoyer le message au backend
    await sendTextToBackend(message);
  };

  // Envoyer le texte au backend
  const sendTextToBackend = async (text: string) => {
    try {
      setIsLoading(true);
      
      // Ajouter un message temporaire de l'assistant
      const tempAssistantMessage: Message = {
        id: `temp-${Date.now()}`,
        text: '',
        sender: 'assistant',
        timestamp: new Date(),
        isLoading: true
      };
      
      setMessages(prevMessages => [...prevMessages, tempAssistantMessage]);
      
      // Construire l'URL API
      let apiUrl;
      
      if (process.env.NEXT_PUBLIC_API_URL) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL.endsWith('/') 
          ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1) 
          : process.env.NEXT_PUBLIC_API_URL;
        
        apiUrl = `${baseUrl}/voices/hf-conversation-with-history`;
      } else {
        apiUrl = `/api/voices/hf-conversation-with-history`;
      }
      
      const response = await axios.post(apiUrl, {
        text,
        history: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        company: companyData || {
          name: 'Votre entreprise',
          description: 'Assistant vocal intelligent'
        },
        userId: user?.id
      });
      
      if (response.data && response.data.data) {
        const { generatedText, audioUrl } = response.data.data;
        
        // Remplacer le message temporaire par la réponse réelle
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempAssistantMessage.id
              ? {
                  ...msg,
                  id: Date.now().toString(),
                  text: generatedText,
                  audioUrl,
                  isLoading: false
                }
              : msg
          )
        );
        
        // Jouer automatiquement l'audio de réponse
        if (audioUrl) {
          playAudio(audioUrl);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du texte:', error);
      
      // Supprimer le message temporaire en cas d'erreur
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== `temp-${Date.now()}`)
      );
      
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };

  // Démarrer l'enregistrement audio
  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
        setAudioChunks([]);
        setRecordingDuration(0);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setAudioChunks([]);
      
      // Démarrer le chronomètre
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      toast.error('Impossible d\'accéder au microphone');
    }
  };

  // Arrêter l'enregistrement audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      setStream(null);
      
      // Arrêter le chronomètre
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Envoyer un message audio
  const sendAudioMessage = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      
      // Créer un message temporaire pour l'utilisateur
      const userMessageId = Date.now().toString();
      const tempUserMessage: Message = {
        id: userMessageId,
        text: 'Message vocal en cours de traitement...',
        sender: 'user',
        timestamp: new Date(),
        isLoading: true,
        isVoiceMessage: true
      };
      
      setMessages(prevMessages => [...prevMessages, tempUserMessage]);
      
      // Créer un message temporaire pour l'assistant
      const assistantMessageId = `temp-${Date.now()}`;
      const tempAssistantMessage: Message = {
        id: assistantMessageId,
        text: '',
        sender: 'assistant',
        timestamp: new Date(),
        isLoading: true
      };
      
      setMessages(prevMessages => [...prevMessages, tempAssistantMessage]);
      
      // Construire l'URL API
      let apiUrl;
      
      if (process.env.NEXT_PUBLIC_API_URL) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL.endsWith('/') 
          ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1) 
          : process.env.NEXT_PUBLIC_API_URL;
        
        apiUrl = `${baseUrl}/speech/conversation`;
      } else {
        apiUrl = `/api/conversations/voice`;
      }
      
      // Vérifier le type MIME du blob audio
      console.log('Type MIME du blob audio:', audioBlob.type);
      console.log('Taille du blob audio:', audioBlob.size, 'bytes');
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Préparer l'historique pour le débogage
      const historyData = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      console.log('Historique de conversation envoyé:', historyData);
      
      // Ajouter l'historique de la conversation
      formData.append('history', JSON.stringify(historyData));
      
      // Ajouter les informations de l'entreprise et de l'utilisateur
      formData.append('company', JSON.stringify(companyData || {
        name: 'Votre entreprise',
        description: 'Assistant vocal intelligent'
      }));
      
      if (user?.id) {
        formData.append('userId', user.id);
      }
      
      // Afficher les clés du FormData pour débogage
      console.log('Clés dans FormData:');
      const entries: string[] = [];
      formData.forEach((value, key) => {
        entries.push(`${key}: ${typeof value}`);
        console.log(key, typeof value);
      });
      console.log('Entrées FormData:', entries);
      
      console.log('Envoi de la requête à:', apiUrl);
      
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000 // 60 secondes
      });
      
      if (response.data && response.data.data) {
        const { transcription, generatedText, audioUrl } = response.data.data;
        
        // Mettre à jour le message de l'utilisateur avec la transcription
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === userMessageId
              ? {
                  ...msg,
                  text: transcription || 'Message vocal',
                  isLoading: false
                }
              : msg
          )
        );
        
        // Mettre à jour le message de l'assistant avec la réponse
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  id: Date.now().toString(),
                  text: generatedText,
                  audioUrl,
                  isLoading: false
                }
              : msg
          )
        );
        
        // Jouer automatiquement l'audio de réponse
        if (audioUrl) {
          playAudio(audioUrl);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'audio:', error);
      console.error('Détails de l\'erreur:', error.response?.data || 'Pas de détails disponibles');
      
      // Supprimer les messages temporaires en cas d'erreur
      setMessages(prevMessages => 
        prevMessages.filter(msg => 
          !msg.isLoading
        )
      );
      
      toast.error(`Erreur lors de l'envoi du message audio: ${error.response?.status || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Jouer un fichier audio
  const playAudio = (url: string) => {
    if (audioElementRef.current) {
      audioElementRef.current.src = url;
      audioElementRef.current.play();
    }
  };

  // Formater le temps d'enregistrement
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <UserLayout>
      <div className="container mx-auto py-6">
        <Card className="bg-white shadow-sm">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Conversation Vocale avec votre Assistant</h1>
            <p className="text-gray-600 mb-3">
              Parlez directement avec votre assistant IA pour tester sa configuration vocale et ses capacités de conversation.
            </p>
            
            {/* Bannière d'info sur les données utilisées */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6 flex items-start gap-3">
              <div className="text-blue-600 mt-0.5 shrink-0">
                {isLoadingCompanyData ? <Loader2 size={18} className="animate-spin" /> : <AlertCircle size={18} />}
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Données utilisées pour les réponses</h3>
                {isLoadingCompanyData ? (
                  <p className="text-xs text-blue-600 mt-1">Chargement des données de votre entreprise...</p>
                ) : (
                  <>
                    <p className="text-xs text-blue-600 mt-1">
                      <strong>Entreprise :</strong> {companyData?.name || 'Non définie'} 
                      {companyData?.industry ? ` (${companyData.industry})` : ''}
                    </p>
                    {companyData?.voiceSettings && (
                      <p className="text-xs text-blue-600">
                        <strong>Voix :</strong> 
                        {companyData.voiceSettings.gender === 'male' ? ' Masculine' : ' Féminine'}
                        {companyData.voiceSettings.tone ? `, ton ${companyData.voiceSettings.tone}` : ''}
                      </p>
                    )}
                    {companyData?.knowledgeBase?.enabled && (
                      <p className="text-xs text-blue-600">
                        <strong>Base de connaissances :</strong> Activée 
                        {companyData.knowledgeBase.documents && 
                         ` (${companyData.knowledgeBase.documents.length} documents)`}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Zone de conversation */}
            <div className="bg-gray-50 rounded-lg p-4 h-[400px] overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Volume2 size={40} className="mb-3 text-indigo-500" />
                  <p className="text-center font-medium">Appuyez sur le bouton microphone ci-dessous pour commencer à parler avec votre assistant</p>
                  <p className="text-sm mt-2 text-center">Votre voix sera transcrite et traitée par l'IA configurée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.isLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Spinner size="sm" />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              {msg.isVoiceMessage && msg.sender === 'user' && (
                                <Mic className="h-3 w-3 flex-shrink-0 opacity-70" />
                              )}
                              <p>{msg.text}</p>
                            </div>
                            {msg.audioUrl && (
                              <button
                                onClick={() => playAudio(msg.audioUrl!)}
                                className="mt-2 text-xs flex items-center gap-1 opacity-70 hover:opacity-100"
                              >
                                <Play size={12} /> Écouter
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Lecteur audio caché */}
            <audio ref={audioElementRef} hidden />

            {/* Zone de contrôles */}
            <div className="mt-6">
              {/* Contrôle principal - bouton de microphone */}
              <div className="flex flex-col items-center justify-center">
                {isRecording ? (
                  <div className="text-center mb-4">
                    <div className="text-xl font-bold text-red-600">{formatTime(recordingDuration)}</div>
                    <div className="text-sm text-gray-600">Enregistrement en cours...</div>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <div className="text-sm font-medium text-indigo-600">Appuyez pour parler</div>
                  </div>
                )}
                
                <div className={`${isRecording ? 'bg-red-100' : 'bg-indigo-100'} p-2 rounded-full transition-all`}>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className={`
                      h-24 w-24 rounded-full p-0 shadow-lg
                      ${isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse border-2 border-red-300' 
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-transform border-2 border-indigo-300'}
                      flex items-center justify-center
                    `}
                    disabled={isLoading && !isRecording}
                    aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                  >
                    {isRecording ? (
                      <MicOff size={36} className="text-white" />
                    ) : (
                      <Mic size={36} className="text-white" />
                    )}
                  </Button>
                </div>
                
                {isRecording ? (
                  <div className="mt-4 text-sm text-red-500 flex items-center gap-1 font-medium">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    Cliquez à nouveau pour terminer l'enregistrement
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">
                    {isLoading ? 'Traitement en cours...' : 'Le contenu sera transcrit automatiquement'}
                  </div>
                )}
              </div>
              
              {/* Option pour basculer vers l'entrée texte */}
              <div className="text-center mt-8">
                <button 
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 rounded-full border border-indigo-200 hover:bg-indigo-50"
                  onClick={() => setShowTextInput(!showTextInput)}
                >
                  {showTextInput ? "Masquer" : "Afficher"} l'entrée de texte
                </button>
              </div>
              
              {/* Zone de saisie texte (optionnelle) */}
              {showTextInput && (
                <div className="mt-3 flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tapez votre message ici..."
                    className="flex-1"
                    disabled={isLoading || isRecording}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (message.trim() && !isLoading) {
                          sendMessage();
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading || isRecording}
                    className="h-10 w-10 p-0"
                    aria-label="Envoyer le message"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </UserLayout>
  );
};

export default TestsAudioPage;