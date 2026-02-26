"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const btnClass = (active: boolean) =>
        `px-2 py-1 rounded text-xs font-bold transition-colors ${active
            ? "bg-indigo-600 text-white"
            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
        }`;

    const addImage = () => {
        const url = prompt("Image URL:");
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const addLink = () => {
        const url = prompt("Link URL:");
        if (url) editor.chain().focus().setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-slate-700 bg-slate-800/50">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))}>B</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))}>I</button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive("strike"))}>S̶</button>
            <div className="w-px bg-slate-700 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive("heading", { level: 1 }))}>H1</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))}>H2</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive("heading", { level: 3 }))}>H3</button>
            <div className="w-px bg-slate-700 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))}>• List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))}>1. List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))}>❝ Quote</button>
            <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive("codeBlock"))}>{"</>"} Code</button>
            <div className="w-px bg-slate-700 mx-1" />
            <button type="button" onClick={addLink} className={btnClass(editor.isActive("link"))}>🔗 Link</button>
            <button type="button" onClick={addImage} className={btnClass(false)}>🖼️ Image</button>
            <div className="w-px bg-slate-700 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}>↩ Undo</button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}>↪ Redo</button>
        </div>
    );
};

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
        ],
        content: content || "",
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm prose-invert max-w-none p-4 min-h-[200px] focus:outline-none text-slate-200",
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || "");
        }
    }, [content]);

    return (
        <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
