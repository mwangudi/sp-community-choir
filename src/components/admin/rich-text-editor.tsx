"use client";

import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Box, Divider, Stack, ToggleButton, Tooltip } from "@mui/material";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

/** Wraps legacy plain-text bodies so they still render as paragraphs. */
function toHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return trimmed
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function RichTextEditor({ name, defaultValue = "", placeholder }: Props) {
  const [html, setHtml] = useState(() => toHtml(defaultValue));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit ships its own link extension; ours is configured below.
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write the post here…",
      }),
    ],
    content: toHtml(defaultValue),
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "choir-prose focus:outline-none",
      },
    },
  });

  useEffect(() => () => editor?.destroy(), [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return <Box sx={{ height: 320, borderRadius: 2, bgcolor: "action.hover" }} />;
  }

  return (
    <Box>
      <input type="hidden" name={name} value={html} />
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          "&:focus-within": { borderColor: "primary.main" },
        }}
      >
        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            gap: 0.5,
            p: 0.75,
            bgcolor: "action.hover",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tool editor={editor} tip="Bold" active="bold" onClick={(e) => e.chain().focus().toggleBold().run()}>
            <Bold size={16} />
          </Tool>
          <Tool editor={editor} tip="Italic" active="italic" onClick={(e) => e.chain().focus().toggleItalic().run()}>
            <Italic size={16} />
          </Tool>
          <Tool editor={editor} tip="Strikethrough" active="strike" onClick={(e) => e.chain().focus().toggleStrike().run()}>
            <Strikethrough size={16} />
          </Tool>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tool
            editor={editor}
            tip="Heading"
            active="heading"
            activeAttrs={{ level: 2 }}
            onClick={(e) => e.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 size={16} />
          </Tool>
          <Tool
            editor={editor}
            tip="Subheading"
            active="heading"
            activeAttrs={{ level: 3 }}
            onClick={(e) => e.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 size={16} />
          </Tool>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tool editor={editor} tip="Bulleted list" active="bulletList" onClick={(e) => e.chain().focus().toggleBulletList().run()}>
            <List size={16} />
          </Tool>
          <Tool editor={editor} tip="Numbered list" active="orderedList" onClick={(e) => e.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={16} />
          </Tool>
          <Tool editor={editor} tip="Quote" active="blockquote" onClick={(e) => e.chain().focus().toggleBlockquote().run()}>
            <Quote size={16} />
          </Tool>
          <Tool editor={editor} tip="Code" active="codeBlock" onClick={(e) => e.chain().focus().toggleCodeBlock().run()}>
            <Code size={16} />
          </Tool>
          <Tool editor={editor} tip="Divider" onClick={(e) => e.chain().focus().setHorizontalRule().run()}>
            <Minus size={16} />
          </Tool>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Add link">
            <ToggleButton
              value="link"
              size="small"
              selected={editor.isActive("link")}
              onClick={setLink}
              sx={{ border: 0, borderRadius: 1.5 }}
            >
              <Link2 size={16} />
            </ToggleButton>
          </Tooltip>
          <Tool
            editor={editor}
            tip="Remove link"
            disabled={!editor.isActive("link")}
            onClick={(e) => e.chain().focus().unsetLink().run()}
          >
            <Link2Off size={16} />
          </Tool>

          <Box sx={{ flex: 1 }} />

          <Tool editor={editor} tip="Undo" onClick={(e) => e.chain().focus().undo().run()}>
            <Undo2 size={16} />
          </Tool>
          <Tool editor={editor} tip="Redo" onClick={(e) => e.chain().focus().redo().run()}>
            <Redo2 size={16} />
          </Tool>
        </Stack>

        <Box
          sx={{
            p: 2,
            minHeight: 360,
            maxHeight: 620,
            overflowY: "auto",
            cursor: "text",
          }}
          onClick={() => editor.chain().focus().run()}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>
    </Box>
  );
}

function Tool({
  editor,
  tip,
  active,
  activeAttrs,
  disabled,
  onClick,
  children,
}: {
  editor: Editor;
  tip: string;
  active?: string;
  activeAttrs?: Record<string, unknown>;
  disabled?: boolean;
  onClick: (editor: Editor) => void;
  children: React.ReactNode;
}) {
  const selected = active
    ? activeAttrs
      ? editor.isActive(active, activeAttrs)
      : editor.isActive(active)
    : false;

  return (
    <Tooltip title={tip}>
      <span>
        <ToggleButton
          value={tip}
          size="small"
          selected={selected}
          disabled={disabled}
          onClick={() => onClick(editor)}
          sx={{ border: 0, borderRadius: 1.5 }}
        >
          {children}
        </ToggleButton>
      </span>
    </Tooltip>
  );
}
