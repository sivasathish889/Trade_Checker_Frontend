import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChecklistTemplate } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { FileText, Trash2, Download, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function Templates() {
  const { checklistItems, templates, addTemplate, deleteTemplate, loadTemplate } = useApp();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    const newTemplate: ChecklistTemplate = {
      id: Date.now().toString(),
      name: templateName,
      items: checklistItems,
    };

    addTemplate(newTemplate);
    toast.success('Template created successfully!');
    setTemplateName('');
    setIsCreateDialogOpen(false);
  };

  const handleLoadTemplate = (templateId: string) => {
    loadTemplate(templateId);
    toast.success('Template loaded! Go to Settings to see the changes.');
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteTemplate(id);
      toast.success('Template deleted');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Checklist Templates</h1>
        <p className="text-gray-400">Save and manage different checklist configurations</p>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Save Current Checklist as Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No templates yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first template to save your current checklist configuration
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <Card key={template.id} className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <p className="text-xs text-gray-500">{template.items.length} items</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id, template.name)}
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-xs text-gray-400 mb-2">Items preview:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {template.items.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="truncate">{item.text}</span>
                    </div>
                  ))}
                  {template.items.length > 5 && (
                    <div className="text-xs text-gray-600">
                      +{template.items.length - 5} more items...
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleLoadTemplate(template.id)}
                className="w-full bg-blue-500 hover:bg-blue-600"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Load Template
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="templateName" className="text-gray-300">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Scalping Strategy, Day Trading Setup"
                className="bg-gray-800 border-gray-700 mt-2"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTemplate()}
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">
                This template will save your current checklist with:
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• {checklistItems.length} checklist items</li>
                <li>• Current item order</li>
                <li>• Mandatory settings</li>
                <li>• Category assignments</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCreateTemplate}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                Create Template
              </Button>
              <Button
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setTemplateName('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="bg-gray-800 border-gray-700 p-6 mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">About Templates</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            Templates allow you to save different checklist configurations for various trading strategies or market conditions.
          </p>
          <p>
            Use templates to quickly switch between different trading approaches, such as:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Scalping setups (shorter timeframes, quick decisions)</li>
            <li>Day trading strategies (intraday analysis)</li>
            <li>Swing trading checklists (multi-day positions)</li>
            <li>High volatility vs. low volatility conditions</li>
          </ul>
          <p className="text-emerald-400 font-medium">
            Tip: Create templates for your best-performing trading setups and use them consistently!
          </p>
        </div>
      </Card>
    </div>
  );
}
