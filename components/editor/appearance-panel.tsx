"use client";

import { updateTree, updateTreeAppearance } from "@/actions/tree";
import type { EditorTranslations } from "@/app/[lang]/(dashboard)/editor/[slug]/client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUpdateTree } from "@/hooks/use-tree-detail";
import {
  CURATED_FONTS,
  DEFAULT_BACKGROUND,
  DEFAULT_LINK_STYLE,
  THEME_PRESETS,
} from "@/lib/constants";
import type { BackgroundConfig, LinkStyleConfig } from "@/types";
import type { Link, Tree } from "@prisma/client";
import {
  Globe,
  Image,
  Layers,
  Link2,
  Palette,
  Share2,
  Smartphone,
  Sparkles,
  Type,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AvatarUpload } from "./avatar-upload";
import { BackgroundPicker } from "./background-picker";
import { LinkAppearanceEditor } from "./link-appearance-editor";
import { SeoFields } from "./seo-fields";
import { SlugEditor } from "./slug-editor";
import { SocialIconsEditor } from "./social-icons-editor";
import { ThemeSelector } from "./theme-selector";
import { createLatestSaveQueue } from "./latest-save-queue";
import {
  notifyAppearanceSaved,
  subscribeAppearanceSaved,
} from "./appearance-save-events";

interface AppearancePanelProps {
  links: Link[];
  onLinkChange: (link: Link) => void;
  tree: Tree;
  slug: string;
  onTreeChange: (tree: Tree) => void;
  translations: EditorTranslations;
  children?: React.ReactNode;
}

type Section =
  "profile" | "themes" | "background" | "links" | "fonts" | "seo" | "social";

const SECTION_ICONS = {
  profile: Image,
  themes: Sparkles,
  background: Layers,
  links: Link2,
  fonts: Type,
  social: Share2,
  seo: Globe,
} as const;

type AppearancePatch = {
  background?: BackgroundConfig;
  linkStyle?: LinkStyleConfig;
  theme: string | null;
};
interface AppearanceSave {
  data: AppearancePatch;
  errorMessage: string;
  successMessage?: string;
}

// Mobile and desktop panels share ordering, including presets that change both fields.
const appearanceSaveQueues = new Map<
  string,
  ReturnType<typeof createLatestSaveQueue<AppearanceSave>>
>();
function enqueueAppearanceSave(treeId: string, selection: AppearanceSave) {
  let queue = appearanceSaveQueues.get(treeId);
  if (!queue) {
    queue = createLatestSaveQueue<AppearanceSave>({
      save: async ({ data }) => {
        const result = await updateTreeAppearance(treeId, data);
        if (result && "error" in result) throw new Error(result.error);
      },
      mergePending: (previous, next) => ({
        ...next,
        data: { ...previous.data, ...next.data },
      }),
      onError: (_error, value, isLatest) => {
        if (isLatest) toast.error(value.errorMessage);
      },
      onSuccess: (value, isLatest) => {
        if (isLatest) {
          notifyAppearanceSaved(treeId);
          if (value.successMessage) toast.success(value.successMessage);
        }
      },
    });
    appearanceSaveQueues.set(treeId, queue);
  }
  queue.enqueue(selection);
  const currentQueue = queue;
  void queue.whenIdle().then(() => {
    if (
      currentQueue.isIdle() &&
      appearanceSaveQueues.get(treeId) === currentQueue
    ) {
      appearanceSaveQueues.delete(treeId);
    }
  });
}

export function AppearancePanel({
  links,
  onLinkChange,
  tree,
  slug,
  onTreeChange,
  translations,
  children,
}: AppearancePanelProps) {
  const latestTreeRef = useRef(tree);
  useEffect(() => {
    latestTreeRef.current = tree;
  }, [tree]);
  function publishTreePatch(patch: Partial<Tree>) {
    const updated = { ...latestTreeRef.current, ...patch };
    latestTreeRef.current = updated;
    onTreeChange(updated);
  }

  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [description, setDescription] = useState(tree.description || "");
  const isXl = useMediaQuery("(min-width: 1024px)");

  const ap = translations.appearance.sections;
  const SECTIONS = [
    {
      id: "profile" as Section,
      label: ap.profile,
      icon: SECTION_ICONS.profile,
      description: ap.profileDesc,
      color: "text-brutal-pink",
    },
    {
      id: "themes" as Section,
      label: ap.themes,
      icon: SECTION_ICONS.themes,
      description: ap.themesDesc,
      color: "text-brutal-yellow",
    },
    {
      id: "background" as Section,
      label: ap.background,
      icon: SECTION_ICONS.background,
      description: ap.backgroundDesc,
      color: "text-brutal-blue",
    },
    {
      id: "links" as Section,
      label: ap.links,
      icon: SECTION_ICONS.links,
      description: ap.linksDesc,
      color: "text-brutal-green",
    },
    {
      id: "fonts" as Section,
      label: ap.fonts,
      icon: SECTION_ICONS.fonts,
      description: ap.fontsDesc,
      color: "text-brutal-orange",
    },
    {
      id: "social" as Section,
      label: ap.social,
      icon: SECTION_ICONS.social,
      description: ap.socialDesc,
      color: "text-brutal-pink",
    },
    {
      id: "seo" as Section,
      label: ap.seo,
      icon: SECTION_ICONS.seo,
      description: ap.seoDesc,
      color: "text-brutal-blue",
    },
  ];

  const effectiveSection =
    isXl && (activeSection as string) === "preview" ? "profile" : activeSection;

  const background =
    (tree.background as BackgroundConfig | null) || DEFAULT_BACKGROUND;
  const linkStyle =
    (tree.linkStyle as LinkStyleConfig | null) || DEFAULT_LINK_STYLE;

  const updateTreeMutation = useUpdateTree(slug);

  useAutoSave(description, async (desc) => {
    if (desc !== (tree.description || "")) {
      const result = await updateTree(tree.id, { description: desc || null });
      if (result && "error" in result) throw new Error(result.error);
      publishTreePatch({ description: desc || null });
    }
  });

  function handleBackgroundChange(bg: BackgroundConfig) {
    const treeId = latestTreeRef.current.id;
    publishTreePatch({
      background: bg as unknown as typeof tree.background,
      theme: null,
    });
    enqueueAppearanceSave(treeId, {
      data: { background: bg, theme: null },
      errorMessage: translations.errors.saveBackground,
    });
  }

  function handleLinkStyleChange(style: LinkStyleConfig) {
    const treeId = latestTreeRef.current.id;
    publishTreePatch({
      linkStyle: style as unknown as typeof tree.linkStyle,
      theme: null,
    });
    enqueueAppearanceSave(treeId, {
      data: { linkStyle: style, theme: null },
      errorMessage: translations.errors.saveLinkStyle,
    });
  }

  function handleThemeSelect(themeId: string) {
    const preset = THEME_PRESETS.find((theme) => theme.id === themeId);
    if (!preset) return;
    const treeId = latestTreeRef.current.id;
    publishTreePatch({
      background: preset.background as unknown as typeof tree.background,
      linkStyle: preset.linkStyle as unknown as typeof tree.linkStyle,
      theme: themeId,
    });
    enqueueAppearanceSave(treeId, {
      data: {
        background: preset.background,
        linkStyle: preset.linkStyle,
        theme: themeId,
      },
      errorMessage: translations.errors.applyTheme,
      successMessage: translations.toasts.themeApplied.replace(
        "{{name}}",
        preset.name,
      ),
    });
  }

  async function handleAvatarChange(url: string | null) {
    const result = await updateTreeAppearance(tree.id, { avatar: url });
    if (result && "error" in result) {
      toast.error(translations.errors.saveAvatar);
      return;
    }
    publishTreePatch({ avatar: url });
  }

  async function handleSlugSave(newSlug: string) {
    const result = await updateTree(tree.id, { slug: newSlug });
    if (result && "error" in result) {
      const errorKey = result.error.replace("errors.", "");
      toast.error(
        translations.errors[errorKey as keyof typeof translations.errors] ||
          translations.errors.updateSlug,
      );
      return;
    }
    window.location.href = `/editor/${newSlug}`;
  }

  async function handleSeoSave(seoTitle: string, seoDescription: string) {
    const result = await updateTreeAppearance(tree.id, {
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    });
    if (result && "error" in result) {
      toast.error(translations.errors.saveSeo);
      return;
    }
    publishTreePatch({
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    });
    toast.success(translations.toasts.seoUpdated);
  }

  async function handleSocialIconsSave(
    icons: Array<{ platform: string; url: string }>,
  ) {
    const result = await updateTreeAppearance(tree.id, { socialIcons: icons });
    if (result && "error" in result) {
      toast.error(translations.errors.saveSocial);
      return;
    }
    publishTreePatch({
      socialIcons: icons as unknown as typeof tree.socialIcons,
    });
  }

  async function handleFontChange(fontFamily: string | null) {
    const result = await updateTreeAppearance(tree.id, { fontFamily });
    if (result && "error" in result) {
      toast.error(translations.errors.saveFont);
      return;
    }
    publishTreePatch({ fontFamily });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button
            data-tour="editor-appearance"
            className="rounded-full inline-flex min-h-11 items-center gap-2 border border-hairline-strong px-3 py-2 text-[13px] font-medium text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink active:scale-[0.98]"
          >
            <Palette className="h-4 w-4" />
            {translations.editor.appearance}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="h-dvh max-w-none w-full overflow-visible rounded-none border-none bg-transparent p-0 shadow-none sm:w-[80%] sm:h-auto sm:rounded-none [&>button:last-child]:hidden product:max-w-none product:max-h-none product:overflow-visible product:bg-transparent product:border-0 product:shadow-none product:max-md:w-screen product:max-md:h-dvh product:max-md:rounded-none">
        <DialogTitle className="sr-only">
          {translations.editor.customize}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {translations.editor.customizeSubtitle}
        </DialogDescription>

        <div className="flex h-dvh w-dvw items-center justify-center gap-6 md:h-[85vh] md:max-h-187.5 md:w-auto">
          <div className="relative flex h-dvh w-full max-w-250 flex-col overflow-hidden border border-hairline md:rounded-3xl bg-surface-1 md:h-full md:border md:border-hairline-strong">
            <button
              aria-label={translations.common.close}
              onClick={() => setOpen(false)}
              className="rounded-full absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center text-ink-tertiary transition-colors hover:bg-surface-3 hover:text-ink sm:right-5 sm:top-5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <div className="flex h-full overflow-hidden">
              <div className="hidden w-55 shrink-0 flex-col border-r border-hairline-strong bg-canvas md:flex">
                <div className="border-b border-hairline-strong px-5 py-4">
                  <h2 className="text-balance break-words font-semibold text-ink">
                    {translations.editor.customize}
                  </h2>
                  <p className="break-words mt-0.5 text-ink-tertiary text-xs tracking-normal leading-[1.5]">
                    {translations.editor.customizeSubtitle}
                  </p>
                </div>
                <nav className="flex-1 space-y-0.5 p-2">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`rounded-xl flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 ${
                        activeSection === section.id
                          ? "border-l-3 border-transparent bg-product-accent/10"
                          : "border-l-3 border-transparent text-ink-subtle hover:bg-surface-2 hover:text-ink"
                      }`}
                    >
                      <section.icon
                        className={`h-4 w-4 shrink-0 ${activeSection === section.id ? section.color : "text-ink-tertiary"}`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`truncate text-[13px] font-medium ${activeSection === section.id ? "text-ink" : ""}`}
                        >
                          {section.label}
                        </p>
                        <p className="break-words truncate text-xs text-ink-tertiary">
                          {section.description}
                        </p>
                      </div>
                    </button>
                  ))}

                  {!isXl && (
                    <button
                      onClick={() => setActiveSection("preview" as Section)}
                      className={`rounded-xl flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 ${
                        (activeSection as string) === "preview"
                          ? "border-l-3 border-transparent bg-product-accent/10 text-primary"
                          : "border-l-3 border-transparent text-ink-subtle hover:bg-surface-2 hover:text-ink"
                      }`}
                    >
                      <Smartphone
                        className={`h-4 w-4 shrink-0 ${(activeSection as string) === "preview" ? "text-primary" : "text-ink-tertiary"}`}
                      />
                      <div className="min-w-0">
                        <p className="break-words truncate text-[13px] font-medium">
                          {translations.common.preview}
                        </p>
                        <p className="break-words truncate text-xs text-ink-tertiary">
                          {translations.appearance.sections.previewDesc}
                        </p>
                      </div>
                    </button>
                  )}
                </nav>
              </div>

              <div className="hidden h-full w-full flex-col max-md:flex">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {(effectiveSection as string) === "preview" ? (
                    <PreviewFullMobile
                      label={translations.common.preview}
                      tree={tree}
                      background={background}
                      linkStyle={linkStyle}
                    />
                  ) : (
                    <div className="p-5">
                      <SectionContent
                        links={links}
                        onLinkChange={onLinkChange}
                        section={effectiveSection as Section}
                        tree={tree}
                        slug={slug}
                        description={description}
                        setDescription={setDescription}
                        background={background}
                        linkStyle={linkStyle}
                        onAvatarChange={handleAvatarChange}
                        onBackgroundChange={handleBackgroundChange}
                        onLinkStyleChange={handleLinkStyleChange}
                        onThemeSelect={handleThemeSelect}
                        onSlugSave={handleSlugSave}
                        onSeoSave={handleSeoSave}
                        onSocialIconsSave={handleSocialIconsSave}
                        onFontChange={handleFontChange}
                        updateTreeMutation={updateTreeMutation}
                        translations={translations}
                      />
                    </div>
                  )}
                </div>

                <div className="shrink-0 border-t border-hairline-strong bg-surface-1 pb-[env(safe-area-inset-bottom)]">
                  <div className="flex gap-0.5 overflow-x-auto px-2 py-2">
                    {SECTIONS.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`rounded-xl flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 text-xs font-medium transition-colors ${
                          activeSection === section.id
                            ? "text-primary"
                            : "text-ink-tertiary"
                        }`}
                      >
                        <section.icon className="h-4 w-4" />
                        <span className="truncate">
                          {section.label.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => setActiveSection("preview" as Section)}
                      className={`rounded-xl flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 text-xs font-medium transition-colors ${
                        (activeSection as string) === "preview"
                          ? "text-primary"
                          : "text-ink-tertiary"
                      }`}
                    >
                      <Smartphone className="h-4 w-4" />
                      <span>{translations.common.preview}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden flex-1 flex-col overflow-hidden md:flex">
                <div
                  className={`flex-1 overflow-y-auto ${(effectiveSection as string) === "preview" ? "" : "p-8"}`}
                >
                  {(effectiveSection as string) === "preview" ? (
                    <PreviewFullMobile
                      label={translations.common.preview}
                      tree={tree}
                      background={background}
                      linkStyle={linkStyle}
                    />
                  ) : (
                    <SectionContent
                        links={links}
                        onLinkChange={onLinkChange}
                      section={effectiveSection as Section}
                      tree={tree}
                      slug={slug}
                      description={description}
                      setDescription={setDescription}
                      background={background}
                      linkStyle={linkStyle}
                      onAvatarChange={handleAvatarChange}
                      onBackgroundChange={handleBackgroundChange}
                      onLinkStyleChange={handleLinkStyleChange}
                      onThemeSelect={handleThemeSelect}
                      onSlugSave={handleSlugSave}
                      onSeoSave={handleSeoSave}
                      onSocialIconsSave={handleSocialIconsSave}
                      onFontChange={handleFontChange}
                      updateTreeMutation={updateTreeMutation}
                      translations={translations}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden shrink-0 xl:block">
            <MiniPhonePreview
              label={translations.common.preview}
              tree={tree}
              background={background}
              linkStyle={linkStyle}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionContent({
  links,
  onLinkChange,
  section,
  tree,
  slug,
  description,
  setDescription,
  background,
  linkStyle,
  onAvatarChange,
  onBackgroundChange,
  onLinkStyleChange,
  onThemeSelect,
  onSlugSave,
  onSeoSave,
  onSocialIconsSave,
  onFontChange,
  updateTreeMutation,
  translations,
}: {
  section: Section;
  links: Link[];
  onLinkChange: (link: Link) => void;
  tree: Tree;
  slug: string;
  description: string;
  setDescription: (v: string) => void;
  background: BackgroundConfig;
  linkStyle: LinkStyleConfig;
  onAvatarChange: (url: string | null) => void;
  onBackgroundChange: (bg: BackgroundConfig) => void;
  onLinkStyleChange: (style: LinkStyleConfig) => void;
  onThemeSelect: (themeId: string) => void;
  onSlugSave: (slug: string) => void;
  onSeoSave: (title: string, desc: string) => Promise<void>;
  onSocialIconsSave: (icons: Array<{ platform: string; url: string }>) => void;
  onFontChange: (fontFamily: string | null) => void;
  updateTreeMutation: { isPending: boolean };
  translations: EditorTranslations;
}) {
  const ap = translations.appearance;
  switch (section) {
    case "profile":
      return (
        <div className="space-y-8">
          <div>
            <h3 className="text-balance break-words text-lg font-semibold text-ink flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 bg-brutal-pink" />
              {ap.profile.title}
            </h3>
            <p className="break-words mt-1 text-ink-subtle text-sm leading-[1.5]">
              {ap.profile.subtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-hairline bg-surface-2 p-5">
            <Label className="text-[13px] font-medium text-ink">
              {ap.profile.avatar}
            </Label>
            <p className="break-words mt-0.5 text-[12px] text-ink-tertiary">
              {ap.profile.avatarHint}
            </p>
            <div className="mt-4">
              <AvatarUpload
                currentAvatar={tree.avatar}
                onUpload={onAvatarChange}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-hairline bg-surface-2 p-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[13px] font-medium text-ink">
                  {ap.profile.bio}
                </Label>
                <p className="break-words mt-0.5 text-[12px] text-ink-tertiary">
                  {ap.profile.bioHint}
                </p>
              </div>
              <span className="text-xs tabular-nums text-ink-tertiary">
                {description.length}/160
              </span>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={ap.profile.bioPlaceholder}
              maxLength={160}
              rows={3}
              className="mt-3"
            />
          </div>

          <div className="rounded-2xl border border-hairline bg-surface-2 p-5">
            <Label className="text-[13px] font-medium text-ink">
              {ap.profile.url}
            </Label>
            <p className="break-words mt-0.5 text-[12px] text-ink-tertiary">
              {ap.profile.urlHint}
            </p>
            <div className="mt-3">
              <SlugEditor
                currentSlug={slug}
                onSave={onSlugSave}
                isSaving={updateTreeMutation.isPending}
              />
            </div>
          </div>
        </div>
      );

    case "themes":
      return (
        <div className="space-y-8">
          <div>
            <h3 className="text-balance break-words text-lg font-semibold text-ink flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 bg-brutal-yellow" />
              {ap.themes.title}
            </h3>
            <p className="break-words mt-1 text-ink-subtle text-sm leading-[1.5]">
              {ap.themes.subtitle}
            </p>
          </div>
          <ThemeSelector currentTheme={tree.theme} onSelect={onThemeSelect} />
        </div>
      );

    case "background":
      return (
        <div className="space-y-8">
          <div>
            <h3 className="text-balance break-words text-lg font-semibold text-ink flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 bg-brutal-blue" />
              {ap.background.title}
            </h3>
            <p className="break-words mt-1 text-ink-subtle text-sm leading-[1.5]">
              {ap.background.subtitle}
            </p>
          </div>
          <BackgroundPicker value={background} onChange={onBackgroundChange} />
        </div>
      );

    case "links":
      return (
        <div className="space-y-8">
          <div>
            <h3 className="text-balance break-words text-lg font-semibold text-ink flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 bg-brutal-green" />
              {ap.linkStyle.title}
            </h3>
            <p className="break-words mt-1 text-ink-subtle text-sm leading-[1.5]">
              {ap.linkStyle.subtitle}
            </p>
          </div>
          <LinkAppearanceEditor treeId={tree.id} slug={slug} links={links} onLinkChange={onLinkChange} defaults={linkStyle} onDefaultChange={onLinkStyleChange} translations={translations} />
        </div>
      );

    case "fonts":
      return (
        <FontPicker
          currentFamily={tree.fontFamily}
          onFontChange={onFontChange}
          translations={translations}
        />
      );

    case "social":
      return (
        <SocialIconsEditor
          translations={translations.appearance.socialProfiles}
          socialIcons={
            (tree.socialIcons as Array<{ platform: string; url: string }>) || []
          }
          onSave={onSocialIconsSave}
        />
      );

    case "seo":
      return (
        <div className="space-y-8">
          <div>
            <h3 className="text-balance break-words text-lg font-semibold text-ink flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 bg-brutal-blue" />
              {ap.seo.title}
            </h3>
            <p className="break-words mt-1 text-ink-subtle text-sm leading-[1.5]">
              {ap.seo.subtitle}
            </p>
          </div>
          <SeoFields
            seoTitle={tree.seoTitle || ""}
            seoDescription={tree.seoDescription || ""}
            treeTitle={tree.title}
            treeDescription={tree.description || ""}
            onSave={onSeoSave}
          />
        </div>
      );
  }
}

const GOOGLE_FONTS_URL = `https://fonts.googleapis.com/css2?${CURATED_FONTS.map(
  (f) => `family=${f.family.replace(/ /g, "+")}:wght@400;600`,
).join("&")}&display=swap`;

function FontPicker({
  currentFamily,
  onFontChange,
  translations,
}: {
  currentFamily: string | null;
  onFontChange: (fontFamily: string | null) => void;
  translations: EditorTranslations;
}) {
  const ap = translations.appearance;
  return (
    <div className="space-y-8">
      {}
      <link rel="stylesheet" href={GOOGLE_FONTS_URL} />

      <div>
        <h3 className="text-balance break-words text-lg font-semibold text-ink flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 bg-brutal-orange" />
          {ap.fonts.title}
        </h3>
        <p className="break-words mt-1 text-ink-subtle text-sm leading-[1.5]">
          {ap.fonts.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onFontChange(null)}
          className={`rounded-2xl flex flex-col items-start border p-4 text-left transition-colors ${
            !currentFamily
              ? "border-brutal-orange bg-surface-2 "
              : "border-hairline-strong bg-surface-2 hover:border-ink-subtle"
          }`}
        >
          <span className="text-[15px] font-medium text-ink">
            {ap.fonts.default}
          </span>
          <span className="mt-1 text-xs text-ink-tertiary">sans-serif</span>
        </button>

        {CURATED_FONTS.map((font) => (
          <button
            key={font.id}
            type="button"
            onClick={() => onFontChange(font.family)}
            className={`rounded-2xl flex flex-col items-start border p-4 text-left transition-colors ${
              currentFamily === font.family
                ? "border-brutal-orange bg-surface-2 "
                : "border-hairline-strong bg-surface-2 hover:border-ink-subtle"
            }`}
          >
            <span
              className="text-[15px] font-medium text-ink"
              style={{ fontFamily: `'${font.family}', ${font.category}` }}
            >
              {font.name}
            </span>
            <span className="mt-1 text-xs text-ink-tertiary">
              {font.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniPhonePreview({
  tree,
  label,
}: {
  label: string;
  tree: Tree;
  background: BackgroundConfig;
  linkStyle: LinkStyleConfig;
}) {
  const slug = tree.slug || "";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevKeyRef = useRef("");

  // These fields update optimistically; their iframe refresh waits for persistence.
  const currentKey = JSON.stringify({
    ...tree,
    background: undefined,
    linkStyle: undefined,
    theme: undefined,
  });
  useEffect(
    () =>
      subscribeAppearanceSaved(tree.id, () => {
        iframeRef.current?.contentWindow?.location.reload();
      }),
    [tree.id],
  );
  useEffect(() => {
    if (prevKeyRef.current && prevKeyRef.current !== currentKey) {
      const timeout = setTimeout(() => {
        iframeRef.current?.contentWindow?.location.reload();
      }, 800);
      return () => clearTimeout(timeout);
    }
    prevKeyRef.current = currentKey;
  }, [currentKey]);

  const scale = 314 / 390;
  const containerHeight = Math.ceil(844 * scale);

  return (
    <div className="flex flex-col items-center [font-family:var(--font-product-display)]">
      <div className="mb-3 flex w-[320px] max-w-full items-center gap-2 px-1 text-[13px] font-medium tracking-normal text-ink-subtle">
        <Smartphone aria-hidden="true" className="size-4 text-ink-tertiary" />
        <p>{label}</p>
        <span
          aria-hidden="true"
          className="ml-auto size-1.5 rounded-full bg-primary"
        />
      </div>
      <div className="relative w-[320px]">
        <div className="overflow-hidden rounded-[28px] border border-hairline bg-canvas p-0.5 shadow-[0_12px_40px_#00000015]">
          <div
            className="relative overflow-hidden rounded-[24px]"
            style={{ height: `${containerHeight}px`, width: "314px" }}
          >
            <div
              ref={(el) => {
                if (!el) return;
                el.addEventListener(
                  "wheel",
                  (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    iframeRef.current?.contentWindow?.scrollBy(0, e.deltaY);
                  },
                  { passive: false },
                );
              }}
              className="absolute inset-0 z-10 cursor-default"
            />
            <iframe
              ref={iframeRef}
              src={`/${slug}`}
              className="absolute inset-0 border-0 origin-top-left"
              style={{
                width: "390px",
                height: "844px",
                transform: `scale(${scale})`,
              }}
              title={label}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewFullMobile({
  tree,
  label,
}: {
  label: string;
  tree: Tree;
  background: BackgroundConfig;
  linkStyle: LinkStyleConfig;
}) {
  const slug = tree.slug || "";
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevKeyRef = useRef("");

  // These fields update optimistically; their iframe refresh waits for persistence.
  const currentKey = JSON.stringify({
    ...tree,
    background: undefined,
    linkStyle: undefined,
    theme: undefined,
  });
  useEffect(
    () =>
      subscribeAppearanceSaved(tree.id, () => {
        iframeRef.current?.contentWindow?.location.reload();
      }),
    [tree.id],
  );
  useEffect(() => {
    if (prevKeyRef.current && prevKeyRef.current !== currentKey) {
      const timeout = setTimeout(() => {
        iframeRef.current?.contentWindow?.location.reload();
      }, 800);
      return () => clearTimeout(timeout);
    }
    prevKeyRef.current = currentKey;
  }, [currentKey]);

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas p-4 [font-family:var(--font-product-display)] sm:p-6">
      <div className="mb-4 flex min-h-11 min-w-0 items-center gap-3 rounded-xl border border-hairline bg-surface-1 pl-4 pr-12 py-2 tracking-normal">
        <Smartphone
          aria-hidden="true"
          className="size-4 shrink-0 text-ink-tertiary"
        />
        <p className="text-[13px] font-medium text-ink-subtle">{label}</p>
        <span className="ml-auto min-w-0 truncate text-xs text-ink-tertiary">
          /{slug}
        </span>
      </div>
      <div className="flex min-h-150 flex-1 overflow-hidden rounded-[28px] border border-hairline bg-canvas">
        <iframe
          ref={iframeRef}
          src={`/${slug}`}
          className="h-full min-h-150 w-full flex-1 border-0"
          title={label}
          loading="lazy"
        />
      </div>
    </div>
  );
}
