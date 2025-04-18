import { useState } from "react";
import { X, MessageSquare, Video, MessageCircleQuestion } from "lucide-react";

interface SupportBubbleProps {
  onVideoChat?: () => void;
  onASLRequest?: () => void;
  onTextChat?: () => void;
}

export default function SupportBubble({
  onVideoChat = () => {},
  onASLRequest = () => {},
  onTextChat = () => {},
}: SupportBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleBubble = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const minimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Main support options (visible when open) */}
      {isOpen && !isMinimized && (
        <div className="bg-white rounded-lg shadow-lg mb-4 w-72 overflow-hidden border border-purple-300 transition-all">
          <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Support Options</h3>
            <button 
              onClick={minimize} 
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Minimize support bubble"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-600 mb-2">
              Choose your preferred support method:
            </p>
            
            <button 
              onClick={onVideoChat}
              className="flex items-center w-full p-3 rounded-md hover:bg-gray-100 transition-colors text-left"
            >
              <Video className="h-5 w-5 mr-3 text-purple-600" />
              <div>
                <div className="font-medium">Video ASL</div>
                <div className="text-xs text-gray-500">Connect with ASL interpreter</div>
              </div>
            </button>
            
            <button 
              onClick={onASLRequest}
              className="flex items-center w-full p-3 rounded-md hover:bg-gray-100 transition-colors text-left"
            >
              <MessageCircleQuestion className="h-5 w-5 mr-3 text-purple-600" />
              <div>
                <div className="font-medium">ASL Support Request</div>
                <div className="text-xs text-gray-500">Submit question for ASL response</div>
              </div>
            </button>
            
            <button 
              onClick={onTextChat}
              className="flex items-center w-full p-3 rounded-md hover:bg-gray-100 transition-colors text-left"
            >
              <MessageSquare className="h-5 w-5 mr-3 text-purple-600" />
              <div>
                <div className="font-medium">Text Chat</div>
                <div className="text-xs text-gray-500">Chat with support team</div>
              </div>
            </button>
          </div>
        </div>
      )}
      
      {/* Minimized notification (when minimized) */}
      {isMinimized && (
        <div 
          onClick={() => setIsMinimized(false)}
          className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full mb-3 text-sm font-medium cursor-pointer shadow-md animate-bounce"
        >
          Support available
        </div>
      )}
      
      {/* Main bubble button */}
      <button
        onClick={toggleBubble}
        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
        aria-label="Open support options"
      >
        <MessageCircleQuestion size={24} />
      </button>
    </div>
  );
}