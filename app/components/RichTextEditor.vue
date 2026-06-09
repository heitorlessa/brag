<script setup lang="ts">
import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";

// tiptap-markdown augments `editor.storage.markdown` at runtime but its v3
// types don't surface getMarkdown(); read it through the documented shape.
function readMarkdown(ed: Editor): string {
  return (ed.storage.markdown as unknown as MarkdownStorage).getMarkdown();
}

/**
 * WYSIWYG editor whose source of truth is Markdown. Paste Markdown and it is
 * parsed into rich content; `v-model` always holds the Markdown string so the
 * DB stores Markdown and brag-doc export is a verbatim concatenation.
 */
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
  }>(),
  { modelValue: "", placeholder: "Write in Markdown…" }
);

const emit = defineEmits<{ "update:modelValue": [string] }>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: props.placeholder }),
    CharacterCount,
    Markdown.configure({
      html: false,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ],
  editorProps: {
    attributes: { class: "brag-prose min-h-24 px-3 py-2 focus:outline-none" },
  },
  onUpdate: ({ editor: instance }) => {
    emit("update:modelValue", readMarkdown(instance));
  },
});

// Sync external resets (e.g. opening the form for a different record) without
// disturbing the caret during normal typing.
watch(
  () => props.modelValue,
  (value) => {
    const current = editor.value ? readMarkdown(editor.value) : undefined;
    if (editor.value && value !== current) {
      editor.value.commands.setContent(value ?? "", { emitUpdate: false });
    }
  }
);

const characters = computed(
  () => editor.value?.storage.characterCount.characters() ?? 0
);

interface ToolButton {
  icon: string;
  label: string;
  isActive: () => boolean;
  run: () => void;
}

const tools = computed<ToolButton[]>(() => {
  const e = editor.value;
  return [
    {
      icon: "i-lucide-bold",
      label: "Bold",
      isActive: () => e?.isActive("bold") ?? false,
      run: () => e?.chain().focus().toggleBold().run(),
    },
    {
      icon: "i-lucide-italic",
      label: "Italic",
      isActive: () => e?.isActive("italic") ?? false,
      run: () => e?.chain().focus().toggleItalic().run(),
    },
    {
      icon: "i-lucide-heading",
      label: "Heading",
      isActive: () => e?.isActive("heading", { level: 2 }) ?? false,
      run: () => e?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: "i-lucide-list",
      label: "Bullet list",
      isActive: () => e?.isActive("bulletList") ?? false,
      run: () => e?.chain().focus().toggleBulletList().run(),
    },
    {
      icon: "i-lucide-list-ordered",
      label: "Numbered list",
      isActive: () => e?.isActive("orderedList") ?? false,
      run: () => e?.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: "i-lucide-quote",
      label: "Quote",
      isActive: () => e?.isActive("blockquote") ?? false,
      run: () => e?.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: "i-lucide-code",
      label: "Code",
      isActive: () => e?.isActive("code") ?? false,
      run: () => e?.chain().focus().toggleCode().run(),
    },
  ];
});

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <div
    class="focus-within:ring-primary rounded-lg ring-1 ring-[var(--ui-border)] focus-within:ring-2"
  >
    <div
      class="flex flex-wrap items-center gap-0.5 border-b border-[var(--ui-border)] px-1.5 py-1"
    >
      <UButton
        v-for="tool in tools"
        :key="tool.label"
        :icon="tool.icon"
        :aria-label="tool.label"
        size="xs"
        color="neutral"
        :variant="tool.isActive() ? 'soft' : 'ghost'"
        @click="tool.run()"
      />
    </div>

    <EditorContent :editor="editor" />

    <div class="px-3 py-1 text-right text-xs text-[var(--ui-text-dimmed)]">
      {{ characters }} characters
    </div>
  </div>
</template>
