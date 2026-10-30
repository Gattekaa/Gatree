"use client";

import type { EditorTranslations } from "@/app/[lang]/(dashboard)/editor/[slug]/client";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { linkFormSchema, type LinkFormInput } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Link, LinkType } from "@prisma/client";
import {
  Globe,
  Link2,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ImageIcon,
  MapPinIcon,
  SoundCloudIcon,
  SpotifyIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from "./brand-icons";
import { IconPicker } from "./icon-picker";
import { ImageUploadField } from "./image-upload-field";
import { PhoneField } from "./phone-input";

const MapPicker = dynamic(
  () => import("./map-picker").then((m) => m.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-70 items-center justify-center rounded-xl border border-hairline bg-surface-2">
        <p className="break-words text-ink-tertiary text-xs tracking-normal leading-[1.5]">
          {}
        </p>
      </div>
    ),
  },
);

interface LinkFormProps {
  link: Link | null;
  onSubmit: (data: {
    label: string;
    url: string;
    icon?: string;
    type?: LinkType;
    thumbnail?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
  }) => Promise<void>;
  onClose: () => void;
  translations: EditorTranslations;
}

export function LinkForm({
  link,
  onSubmit,
  onClose,
  translations,
}: LinkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = translations.editor.linkForm;

  const LINK_TYPES_TRANSLATED = [
    {
      value: "LINK" as const,
      label: t.types.link,
      description: t.types.linkDesc,
      icon: Link2,
      color: "text-primary",
      bg: "bg-product-accent/10",
      category: "links",
    },
    {
      value: "EMAIL" as const,
      label: t.types.email,
      description: t.types.emailDesc,
      icon: Mail,
      color: "text-primary",
      bg: "bg-product-accent/10",
      category: "links",
    },
    {
      value: "PHONE" as const,
      label: t.types.phone,
      description: t.types.phoneDesc,
      icon: Phone,
      color: "text-primary",
      bg: "bg-product-accent/10",
      category: "links",
    },
    {
      value: "WHATSAPP" as const,
      label: t.types.whatsapp,
      description: t.types.whatsappDesc,
      icon: WhatsAppIcon,
      color: "text-[#25d366]",
      bg: "bg-[#25d366]/10",
      category: "links",
    },

    {
      value: "YOUTUBE" as const,
      label: t.types.youtube,
      description: t.types.youtubeDesc,
      icon: YouTubeIcon,
      color: "text-[#ff0000]",
      bg: "bg-[#ff0000]/10",
      category: "media",
    },
    {
      value: "SPOTIFY" as const,
      label: t.types.spotify,
      description: t.types.spotifyDesc,
      icon: SpotifyIcon,
      color: "text-[#1db954]",
      bg: "bg-[#1db954]/10",
      category: "media",
    },
    {
      value: "SOUNDCLOUD" as const,
      label: t.types.soundcloud,
      description: t.types.soundcloudDesc,
      icon: SoundCloudIcon,
      color: "text-[#ff5500]",
      bg: "bg-[#ff5500]/10",
      category: "media",
    },
    {
      value: "IMAGE" as const,
      label: t.types.image,
      description: t.types.imageDesc,
      icon: ImageIcon,
      color: "text-ink-subtle",
      bg: "bg-surface-3",
      category: "media",
    },

    {
      value: "HEADER" as const,
      label: t.types.header,
      description: t.types.headerDesc,
      icon: Type,
      color: "text-ink-subtle",
      bg: "bg-surface-3",
      category: "layout",
    },
    {
      value: "TEXT" as const,
      label: t.types.text,
      description: t.types.textDesc,
      icon: Type,
      color: "text-ink-subtle",
      bg: "bg-surface-3",
      category: "layout",
    },
    {
      value: "MAP" as const,
      label: t.types.map,
      description: t.types.mapDesc,
      icon: MapPinIcon,
      color: "text-primary",
      bg: "bg-product-accent/10",
      category: "media",
    },
  ];

  const form = useForm<LinkFormInput>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      type: (link?.type as "LINK" | "YOUTUBE" | "HEADER") || "LINK",
      label: link?.label || "",
      url: link?.url === "#" ? "" : link?.url || "",
      icon: link?.icon || null,
      thumbnail: link?.thumbnail || "",
      scheduledStart: link?.scheduledStart
        ? new Date(link.scheduledStart).toISOString().slice(0, 16)
        : "",
      scheduledEnd: link?.scheduledEnd
        ? new Date(link.scheduledEnd).toISOString().slice(0, 16)
        : "",
    },
    mode: "onSubmit",
  });

  const type = form.watch("type");
  const label = form.watch("label");
  const url = form.watch("url");

  async function handleSubmit(data: LinkFormInput) {
    setIsSubmitting(true);
    try {
      await onSubmit({
        label: data.label,
        url: data.type === "HEADER" ? "#" : data.url,
        icon: data.icon || undefined,
        type: data.type,
        thumbnail: data.thumbnail || undefined,
        scheduledStart: data.scheduledStart
          ? new Date(data.scheduledStart).toISOString()
          : undefined,
        scheduledEnd: data.scheduledEnd
          ? new Date(data.scheduledEnd).toISOString()
          : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEditing = !!link;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent
        closeLabel={translations.common.close}
        className="flex h-dvh w-full max-w-none flex-col rounded-none border border-hairline-strong bg-surface-1 p-0 sm:h-auto sm:max-h-[85vh] sm:max-w-145 sm:border product:sm:rounded-3xl product:max-sm:w-screen product:max-sm:max-w-none product:max-sm:h-dvh product:max-sm:max-h-none product:max-sm:rounded-none"
      >
        {}
        <div className="shrink-0 border-b border-hairline-strong px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-surface-2">
              {isEditing ? (
                <Sparkles className="h-5 w-5 text-primary" />
              ) : (
                <Link2 className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-[16px] font-semibold text-ink">
                {isEditing ? t.editLink : t.newLink}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-ink-subtle">
                {isEditing ? t.editLinkSubtitle : t.newLinkSubtitle}
              </DialogDescription>
            </div>
          </div>
        </div>

        {}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="px-5 pb-6 pt-5 sm:px-7"
            >
              <div className="space-y-5">
                {}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <p className="break-words mb-2 text-[13px] font-medium text-ink">
                        {t.type}
                      </p>

                      {}
                      <p className="break-words mb-1.5 text-xs font-medium normal-case tracking-wider text-ink-tertiary">
                        {t.categoryLinks}
                      </p>
                      <div className="mb-3 grid grid-cols-4 gap-1.5">
                        {LINK_TYPES_TRANSLATED.filter(
                          (lt) => lt.category === "links",
                        ).map((lt) => (
                          <button
                            key={lt.value}
                            aria-pressed={field.value === lt.value}
                            type="button"
                            onClick={() => {
                              field.onChange(lt.value);
                              if (["HEADER", "TEXT"].includes(lt.value)) {
                                form.setValue("url", "#");
                              } else if (form.getValues("url") === "#") {
                                form.setValue("url", "");
                              }
                            }}
                            className={`rounded-xl flex flex-col items-center gap-1 border py-2.5 transition-all active:scale-[0.98] ${
                              field.value === lt.value
                                ? "border-primary bg-surface-2"
                                : "border-hairline-strong hover:border-ink-subtle"
                            }`}
                          >
                            <div
                              className={`flex h-7 w-7 items-center justify-center ${lt.bg}`}
                            >
                              <lt.icon className={`h-3.5 w-3.5 ${lt.color}`} />
                            </div>
                            <span
                              className={`text-xs font-medium ${field.value === lt.value ? "text-ink" : "text-ink-subtle"}`}
                            >
                              {lt.label}
                            </span>
                          </button>
                        ))}
                      </div>

                      {}
                      <p className="break-words mb-1.5 text-xs font-medium normal-case tracking-wider text-ink-tertiary">
                        {t.categoryMedia}
                      </p>
                      <div className="mb-3 grid grid-cols-4 gap-1.5">
                        {LINK_TYPES_TRANSLATED.filter(
                          (lt) => lt.category === "media",
                        ).map((lt) => (
                          <button
                            key={lt.value}
                            aria-pressed={field.value === lt.value}
                            type="button"
                            onClick={() => {
                              field.onChange(lt.value);
                              if (["HEADER", "TEXT"].includes(lt.value)) {
                                form.setValue("url", "#");
                              } else if (form.getValues("url") === "#") {
                                form.setValue("url", "");
                              }
                            }}
                            className={`rounded-xl flex flex-col items-center gap-1 border py-2.5 transition-all active:scale-[0.98] ${
                              field.value === lt.value
                                ? "border-primary bg-surface-2"
                                : "border-hairline-strong hover:border-ink-subtle"
                            }`}
                          >
                            <div
                              className={`flex h-7 w-7 items-center justify-center ${lt.bg}`}
                            >
                              <lt.icon className={`h-3.5 w-3.5 ${lt.color}`} />
                            </div>
                            <span
                              className={`text-xs font-medium ${field.value === lt.value ? "text-ink" : "text-ink-subtle"}`}
                            >
                              {lt.label}
                            </span>
                          </button>
                        ))}
                      </div>

                      {}
                      <p className="break-words mb-1.5 text-xs font-medium normal-case tracking-wider text-ink-tertiary">
                        {t.categoryLayout}
                      </p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {LINK_TYPES_TRANSLATED.filter(
                          (lt) => lt.category === "layout",
                        ).map((lt) => (
                          <button
                            key={lt.value}
                            aria-pressed={field.value === lt.value}
                            type="button"
                            onClick={() => {
                              field.onChange(lt.value);
                              if (["HEADER", "TEXT"].includes(lt.value)) {
                                form.setValue("url", "#");
                              } else if (form.getValues("url") === "#") {
                                form.setValue("url", "");
                              }
                            }}
                            className={`rounded-xl flex flex-col items-center gap-1 border py-2.5 transition-all active:scale-[0.98] ${
                              field.value === lt.value
                                ? "border-primary bg-surface-2"
                                : "border-hairline-strong hover:border-ink-subtle"
                            }`}
                          >
                            <div
                              className={`flex h-7 w-7 items-center justify-center ${lt.bg}`}
                            >
                              <lt.icon className={`h-3.5 w-3.5 ${lt.color}`} />
                            </div>
                            <span
                              className={`text-xs font-medium ${field.value === lt.value ? "text-ink" : "text-ink-subtle"}`}
                            >
                              {lt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {}
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <p className="break-words mb-2 text-[13px] font-medium text-ink">
                        {type === "HEADER"
                          ? t.sectionTitle
                          : type === "TEXT"
                            ? t.textField
                            : t.labelField}
                        {[
                          "YOUTUBE",
                          "SPOTIFY",
                          "SOUNDCLOUD",
                          "IMAGE",
                          "MAP",
                        ].includes(type) && (
                          <span className="ml-1.5 text-xs font-normal text-ink-tertiary">
                            {t.optional}
                          </span>
                        )}
                      </p>
                      <FormControl>
                        <Input
                          aria-label={
                            type === "HEADER"
                              ? t.sectionTitle
                              : type === "TEXT"
                                ? t.textField
                                : t.labelField
                          }
                          placeholder={
                            type === "HEADER"
                              ? t.placeholders.header
                              : type === "TEXT"
                                ? t.placeholders.text
                                : type === "YOUTUBE"
                                  ? t.placeholders.youtube
                                  : type === "SPOTIFY"
                                    ? t.placeholders.spotify
                                    : t.placeholders.default
                          }
                          wrapperClassName="h-12"
                          className="text-[15px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {}
                {!["HEADER", "TEXT"].includes(type) && (
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <p className="break-words mb-2 text-[13px] font-medium text-ink">
                          {type === "MAP"
                            ? t.locationField
                            : type === "PHONE" || type === "WHATSAPP"
                              ? t.numberField
                              : type === "IMAGE"
                                ? t.imageField
                                : t.urlField}
                        </p>
                        <FormControl>
                          {type === "MAP" ? (
                            <MapPicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          ) : type === "IMAGE" ? (
                            <ImageUploadField
                              value={field.value}
                              onChange={field.onChange}
                            />
                          ) : type === "PHONE" || type === "WHATSAPP" ? (
                            <PhoneField
                              ariaLabel={t.numberField}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={
                                type === "WHATSAPP"
                                  ? "+55 11 99999-9999"
                                  : "+55 11 99999-9999"
                              }
                            />
                          ) : (
                            <Input
                              leftIcon={Globe}
                              aria-label={t.urlField}
                              placeholder={
                                type === "YOUTUBE"
                                  ? t.placeholders.urlYoutube
                                  : type === "SPOTIFY"
                                    ? t.placeholders.urlSpotify
                                    : type === "EMAIL"
                                      ? t.placeholders.urlEmail
                                      : t.placeholders.urlDefault
                              }
                              wrapperClassName="h-12"
                              className="text-[15px]"
                              {...field}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {}
                {type === "LINK" && (
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <p className="break-words mb-2 text-[13px] font-medium text-ink">
                          {t.iconField}
                        </p>
                        <FormControl>
                          <IconPicker
                            value={field.value || null}
                            onChange={(icon) => field.onChange(icon)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {}
                {["LINK", "EMAIL", "PHONE", "WHATSAPP"].includes(type) && (
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <p className="break-words mb-2 text-[13px] font-medium text-ink">
                          {t.thumbnailField}
                          <span className="ml-1.5 text-xs font-normal text-ink-tertiary">
                            {t.optional}
                          </span>
                        </p>
                        <FormControl>
                          <ThumbnailUpload
                            value={field.value || ""}
                            onChange={field.onChange}
                            translations={translations}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {}
                {!["HEADER", "TEXT"].includes(type) && (
                  <div className="rounded-2xl border border-hairline bg-surface-2 p-4">
                    <p className="break-words text-[13px] font-medium text-ink mb-3">
                      {t.schedule}{" "}
                      <span className="text-xs font-normal text-ink-tertiary">
                        {t.optional}
                      </span>
                    </p>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="scheduledStart"
                        render={({ field }) => (
                          <FormItem>
                            <p className="break-words mb-1.5 text-[12px] font-medium text-ink-subtle">
                              {t.scheduleStart}
                            </p>
                            <FormControl>
                              <DateTimePicker
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder={t.scheduleStart}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scheduledEnd"
                        render={({ field }) => (
                          <FormItem>
                            <p className="break-words mb-1.5 text-[12px] font-medium text-ink-subtle">
                              {t.scheduleEnd}
                            </p>
                            <FormControl>
                              <DateTimePicker
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder={t.scheduleEnd}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {}
              {["YOUTUBE", "SPOTIFY", "EMAIL", "PHONE", "WHATSAPP"].includes(
                type,
              ) &&
                (label || url) && (
                  <div className="mt-5 rounded-2xl border border-hairline bg-canvas p-4">
                    <p className="break-words mb-3 text-xs font-medium normal-case tracking-wider text-ink-tertiary">
                      Preview
                    </p>
                    <LinkPreview type={type} label={label} url={url} />
                  </div>
                )}

              {}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-hairline px-5 py-2.5 text-[14px] font-medium text-ink-subtle active:bg-surface-2"
                >
                  {translations.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className="rounded-full inline-flex min-h-11 items-center gap-2 border border-product-accent bg-product-accent px-6 py-2.5 text-[14px] font-medium text-on-primary active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? t.saveButton : t.addButton}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ThumbnailUpload({
  value,
  onChange,
  translations,
}: {
  value: string;
  onChange: (url: string) => void;
  translations: EditorTranslations;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations.editor.linkForm;

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error(t.imageError);
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error(t.imageSizeError);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "thumbnail");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || translations.errors.generic);
      }

      const { url } = await res.json();
      onChange(url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : translations.errors.generic,
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  return (
    <div className="flex items-center gap-3">
      {}
      {value && (
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-hairline bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Thumbnail"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="rounded-xl flex items-center gap-1.5 border border-hairline bg-surface-2 px-3 py-2 text-[12px] font-medium text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink active:scale-[0.98]"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {value ? "Trocar" : "Upload"}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-xl flex items-center gap-1.5 border border-error bg-surface-1 px-3 py-2 text-[12px] font-medium text-error transition-colors hover:bg-surface-2 active:scale-[0.98]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remover
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

function LinkPreview({
  type,
  label,
  url,
}: {
  type: string;
  label: string;
  url: string;
}) {
  switch (type) {
    case "YOUTUBE": {
      const videoId = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      )?.[1];
      if (videoId) {
        return (
          <div className="overflow-hidden">
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={label}
              />
            </div>
          </div>
        );
      }
      return null;
    }

    case "SPOTIFY": {
      const match = url.match(
        /open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/,
      );
      if (match) {
        const isTrack = match[1] === "track";
        return (
          <iframe
            src={`https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`}
            width="100%"
            height={isTrack ? "80" : "152"}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className=""
            title={label}
          />
        );
      }
      return null;
    }

    case "IMAGE":
      if (url && url !== "#") {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="w-full object-cover" />
        );
      }
      return (
        <div className="flex h-24 items-center justify-center bg-surface-2 text-[13px] text-ink-tertiary">
          Preview da imagem aparecerá aqui
        </div>
      );

    case "EMAIL":
      return (
        <div className="flex items-center gap-3 bg-surface-2 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-surface-3">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="break-words text-[13px] font-medium text-ink">
              {label || "Enviar email"}
            </p>
            {url && (
              <p className="break-words truncate text-[12px] text-ink-tertiary">
                {url}
              </p>
            )}
          </div>
        </div>
      );

    case "PHONE":
      return (
        <div className="flex items-center gap-3 bg-surface-2 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-surface-3">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="break-words text-[13px] font-medium text-ink">
              {label || "Ligar"}
            </p>
            {url && (
              <p className="break-words text-[12px] text-ink-tertiary">{url}</p>
            )}
          </div>
        </div>
      );

    case "WHATSAPP":
      return (
        <div className="flex items-center gap-3 border border-[#25d366] bg-surface-1 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-surface-3">
            <WhatsAppIcon className="h-4 w-4 text-[#25d366]" />
          </div>
          <div className="min-w-0">
            <p className="break-words text-[13px] font-medium text-ink">
              {label || "WhatsApp"}
            </p>
            {url && (
              <p className="break-words text-[12px] text-ink-tertiary">{url}</p>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
