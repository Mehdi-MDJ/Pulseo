import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: RecommendedAction[];
}

interface RecommendedAction {
  type: 'view_mission' | 'apply_mission' | 'update_profile' | 'schedule_interview' | 'negotiate_rate';
  label: string;
  url?: string;
  data?: any;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA personnel. Je peux vous aider avec vos missions, négocier des tarifs, planifier votre carrière ou optimiser votre profil. Comment puis-je vous accompagner aujourd\'hui ?',
      timestamp: new Date(),
      suggestions: [
        'Trouve-moi des missions adaptées',
        'Comment améliorer mon profil ?',
        'Planifie ma carrière',
        'Aide-moi à négocier un tarif'
      ]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Mutation pour envoyer un message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/assistant/chat', 'POST', { message });
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
        actions: response.actions
      }]);
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec l'assistant",
        variant: "destructive",
      });
    }
  });

  // Query pour les recommandations de missions
  const { data: recommendations } = useQuery({
    queryKey: ['/api/assistant/recommendations/missions'],
    retry: false,
  });

  // Query pour le plan de carrière
  const { data: careerPlan } = useQuery({
    queryKey: ['/api/assistant/career-plan'],
    retry: false,
  });

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    sendMessageMutation.mutate(currentMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const handleActionClick = (action: RecommendedAction) => {
    if (action.url) {
      window.location.href = action.url;
    } else {
      toast({
        title: "Action",
        description: `${action.label} - Fonctionnalité en cours d'implémentation`,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Assistant IA Personnel
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Votre compagnon intelligent pour optimiser votre carrière
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Panneau latéral avec informations */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recommandations rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Trouve-moi des missions adaptées')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Missions recommandées
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Aide-moi à négocier un tarif')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Négociation tarifs
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Planifie ma carrière')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Plan de carrière
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleSuggestionClick('Comment améliorer mon profil ?')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Optimiser profil
                </Button>
              </CardContent>
            </Card>

            {/* Missions recommandées */}
            {recommendations && recommendations.missions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Missions pour vous</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.missions.slice(0, 3).map((mission: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm">{mission.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {mission.hourlyRate}€/h • {mission.specialization}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plan de carrière */}
            {careerPlan && (
              <Card>
                <CardHeader>
                  <CardTitle>Votre évolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Niveau actuel:</span>
                      <Badge variant="secondary">{careerPlan.careerPlan.currentLevel}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Prochaines étapes recommandées
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Zone de conversation principale */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Conversation avec l'assistant
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4 pr-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.role === 'assistant' && (
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                          <div className={`p-3 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white ml-auto' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          
                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {message.suggestions.map((suggestion, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          {/* Actions recommandées */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.actions.map((action, idx) => (
                                <Button
                                  key={idx}
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleActionClick(action)}
                                  className="text-xs w-full justify-start"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        
                        {message.role === 'user' && (
                          <div className="p-2 bg-blue-600 rounded-full">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Indicateur de frappe */}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Zone de saisie */}
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}