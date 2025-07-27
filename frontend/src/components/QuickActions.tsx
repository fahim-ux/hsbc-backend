import { quickActions, examplePrompts } from '@/data/quickActions';

interface QuickActionsProps {
  onSelectAction: (prompt: string) => void;
  isVisible: boolean;
}

export function QuickActions({ onSelectAction, isVisible }: QuickActionsProps) {
  if (!isVisible) return null;

  return (
    <div className="p-6 bg-white border-b">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.prompt)}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 text-left"
            >
              <span className="text-2xl">{action.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{action.title}</div>
                <div className="text-sm text-gray-600">{action.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Example Questions</h4>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.slice(0, 6).map((prompt, index) => (
              <button
                key={index}
                onClick={() => onSelectAction(prompt)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
