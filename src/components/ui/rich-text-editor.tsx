"use client";

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Code,
  Quote,
  Minus,
} from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { Input } from "./input";
import { Label } from "./label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./dialog";

type RichTextEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleLink = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setLinkUrl("");
      setShowLinkDialog(true);
    }
  }, []);

  const insertLink = useCallback(() => {
    if (linkUrl) {
      execCommand("createLink", linkUrl);
    }
    setShowLinkDialog(false);
    setLinkUrl("");
  }, [linkUrl, execCommand]);

  const handleImage = useCallback(() => {
    setImageUrl("");
    setShowImageDialog(true);
  }, []);

  const insertImage = useCallback(() => {
    if (imageUrl && editorRef.current) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
      } else {
        editorRef.current.appendChild(img);
      }
      
      onChange(editorRef.current.innerHTML);
    }
    setShowImageDialog(false);
    setImageUrl("");
  }, [imageUrl, onChange]);

  const setHeading = useCallback((level: 1 | 2 | 3) => {
    execCommand("formatBlock", `h${level}`);
  }, [execCommand]);

  const setAlignment = useCallback((align: "left" | "center" | "right" | "justify") => {
    execCommand("justify" + align.charAt(0).toUpperCase() + align.slice(1));
  }, [execCommand]);

  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      {/* Toolbar - Word-like Ribbon */}
      <div className="border-b border-slate-200 bg-slate-50">
        {/* Formatting Group */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 p-2">
          <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
            <button
              type="button"
              onClick={() => execCommand("bold")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Bold (Ctrl+B)"
            >
              <Bold className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand("italic")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Italic (Ctrl+I)"
            >
              <Italic className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand("underline")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Underline (Ctrl+U)"
            >
              <Underline className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand("strikeThrough")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Strikethrough"
            >
              <Strikethrough className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
            <button
              type="button"
              onClick={() => setHeading(1)}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Heading 1"
            >
              <Heading1 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setHeading(2)}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Heading 2"
            >
              <Heading2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setHeading(3)}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Heading 3"
            >
              <Heading3 className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
            <button
              type="button"
              onClick={() => setAlignment("left")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Align Left"
            >
              <AlignLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setAlignment("center")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Align Center"
            >
              <AlignCenter className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setAlignment("right")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Align Right"
            >
              <AlignRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setAlignment("justify")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Justify"
            >
              <AlignJustify className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
            <button
              type="button"
              onClick={() => execCommand("insertUnorderedList")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Bullet List"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand("insertOrderedList")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Numbered List"
            >
              <ListOrdered className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "blockquote")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Quote"
            >
              <Quote className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
            <button
              type="button"
              onClick={handleLink}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Insert Link"
            >
              <LinkIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleImage}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Insert Image"
            >
              <ImageIcon className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => execCommand("undo")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Undo"
            >
              <Undo className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand("redo")}
              className="rounded p-2 text-slate-700 transition hover:bg-slate-200"
              title="Redo"
            >
              <Redo className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[300px] px-4 py-3 text-slate-900 focus:outline-none prose prose-slate max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4"
        style={{ whiteSpace: "pre-wrap" }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL</Label>
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              </DialogClose>
              <button
                onClick={insertLink}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Insert
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              </DialogClose>
              <button
                onClick={insertImage}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Insert
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

