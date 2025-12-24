import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Chatbot from '@/components/Chatbot';

interface StudentChatbotCardProps {
  selectedMaterialForChat: string | undefined;
  onSwitchToGeneralChat: () => void;
}

const StudentChatbotCard: React.FC<StudentChatbotCardProps> = ({
  selectedMaterialForChat,
  onSwitchToGeneralChat,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Chatbot</CardTitle>
        <CardDescription>
          {selectedMaterialForChat
            ? 'Ask questions about the selected material.'
            : 'Ask general questions to the AI.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Chatbot materialId={selectedMaterialForChat} />
        {selectedMaterialForChat && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={onSwitchToGeneralChat}>
              Switch to General AI Chat
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentChatbotCard;