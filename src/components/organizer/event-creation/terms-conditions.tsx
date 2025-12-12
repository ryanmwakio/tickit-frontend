"use client";

import { useState } from "react";
import { FileText, Plus, Trash2, GripVertical } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type TermSection = {
  id: string;
  title: string;
  content: string;
  order: number;
};

type TermsConditionsProps = {
  initialData?: any;
  onDataChange?: (updates: any) => void;
};

export function TermsConditions({ initialData, onDataChange }: TermsConditionsProps = {}) {
  const [terms, setTerms] = useState<TermSection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newTerm: TermSection = {
      id: `term-${Date.now()}`,
      title: "",
      content: "",
      order: terms.length,
    };
    setTerms([...terms, newTerm]);
    setEditingId(newTerm.id);
  };

  const handleUpdate = (id: string, updates: Partial<TermSection>) => {
    setTerms(terms.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleDelete = (id: string) => {
    setTerms(terms.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const sortedTerms = [...terms].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Terms & Conditions</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add terms and conditions sections for your event. Define refund policies, age restrictions, and other important terms.
        </p>
      </div>

      <button
        onClick={handleAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <Plus className="size-4" />
        Add Section
      </button>

      {sortedTerms.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <FileText className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-600">No terms and conditions added yet</p>
          <p className="mt-2 text-xs text-slate-500">
            Add sections to define refund policies, age restrictions, and other important terms
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTerms.map((term, index) => (
            <TermSectionEditor
              key={term.id}
              term={term}
              index={index}
              isEditing={editingId === term.id}
              onEdit={() => setEditingId(term.id)}
              onUpdate={(updates) => {
                handleUpdate(term.id, updates);
                if (!updates.title && !updates.content) setEditingId(null);
              }}
              onDelete={() => handleDelete(term.id)}
              onCancel={() => setEditingId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TermSectionEditor({
  term,
  index,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onCancel,
}: {
  term: TermSection;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<TermSection>) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [localTitle, setLocalTitle] = useState(term.title);
  const [localContent, setLocalContent] = useState(term.content);

  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-slate-900 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="size-5 text-slate-400" />
            <span className="text-sm font-semibold text-slate-500">Section {index + 1}</span>
          </div>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Section Title *</Label>
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={() => onUpdate({ title: localTitle })}
              placeholder="e.g., Refund Policy, Age Restrictions"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <Label>Content *</Label>
            <RichTextEditor
              content={localContent}
              onChange={(content) => {
                setLocalContent(content);
                onUpdate({ content });
              }}
              placeholder="Enter terms and conditions content..."
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <GripVertical className="size-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900">
              {term.title || `Section ${index + 1}`}
            </h3>
          </div>
          {term.content && (
            <div
              className="prose prose-slate max-w-none text-sm text-slate-600"
              dangerouslySetInnerHTML={{ __html: term.content }}
            />
          )}
        </div>
        <button
          onClick={onEdit}
          className="ml-4 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

