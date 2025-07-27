import { ConversationContext } from '@/types/conversation';
import { User, CreditCard, FileText, DollarSign, Activity, Calendar } from 'lucide-react';

interface ConversationSidebarProps {
  context: ConversationContext | null;
}

export function ConversationSidebar({ context }: ConversationSidebarProps) {
  if (!context) {
    return (
      <div className="w-80 border-l bg-gray-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Details</h3>
        <p className="text-gray-500">Start a conversation to see details here.</p>
      </div>
    );
  }

  const getTaskIcon = (task: string) => {
    switch (task) {
      case 'loan_application': return <DollarSign size={16} />;
      case 'card_blocking': return <CreditCard size={16} />;
      case 'account_statement': return <FileText size={16} />;
      case 'balance_inquiry': return <DollarSign size={16} />;
      case 'transaction_history': return <Activity size={16} />;
      case 'interest_rate_inquiry': return <DollarSign size={16} />;
      default: return <User size={16} />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'greeting': return 'bg-blue-100 text-blue-800';
      case 'intent_detection': return 'bg-yellow-100 text-yellow-800';
      case 'information_gathering': return 'bg-orange-100 text-orange-800';
      case 'confirmation': return 'bg-purple-100 text-purple-800';
      case 'execution': return 'bg-green-100 text-green-800';
      case 'completion': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversation Details</h3>
      
      {/* Current Phase */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Phase</h4>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPhaseColor(context.state.phase)}`}>
          {context.state.phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>

      {/* Current Task */}
      {context.state.currentTask && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Task</h4>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border text-gray-700">
            {getTaskIcon(context.state.currentTask)}
            <span className="text-sm font-medium">
              {context.state.currentTask.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>
      )}

      {/* Progress */}
      {context.taskProgress.totalSteps > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Step {context.taskProgress.step} of {context.taskProgress.totalSteps}</span>
              <span>{Math.round((context.taskProgress.step / context.taskProgress.totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(context.taskProgress.step / context.taskProgress.totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Collected Information */}
      {Object.keys(context.state.collectedFields).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Collected Information</h4>
          <div className="space-y-2">
            {Object.entries(context.state.collectedFields).map(([key, value]) => (
              <div key={key} className="p-2 bg-white rounded border text-sm">
                <span className="font-medium text-gray-600">{key.replace('_', ' ')}:</span>
                <span className="ml-2 text-gray-900">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Data */}
      {Object.keys(context.taskProgress.data).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Task Data</h4>
          <div className="space-y-2">
            {Object.entries(context.taskProgress.data).map(([key, value]) => (
              <div key={key} className="p-2 bg-white rounded border text-sm">
                <span className="font-medium text-gray-600">{key.replace('_', ' ')}:</span>
                <span className="ml-2 text-gray-900">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required Fields */}
      {context.state.requiredFields.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Required Fields</h4>
          <div className="space-y-1">
            {context.state.requiredFields.map((field) => {
              const isCollected = 
                context.state.collectedFields[field] !== undefined ||
                context.taskProgress.data[field] !== undefined ||
                context.entities[field] !== undefined;
              
              return (
                <div key={field} className={`text-xs px-2 py-1 rounded ${
                  isCollected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {field.replace('_', ' ')} {isCollected ? '✓' : '✗'}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation Info */}
      <div className="mt-auto pt-6 border-t">
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Started: {context.createdAt.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity size={12} />
            <span>Messages: {context.messages.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
