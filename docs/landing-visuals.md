# Landing visuals

The landing uses Tailwind utilities, local Outfit through `next/font/local`, and GSAP with scoped cleanup. Navigation is layer 40; the product showcase keeps one shared composition for its three chapters. Controls use full rounding, demo panels use 24px corners, and portrait composition uses an arch.

Design dials: variance 8, motion 9, density 4. The commercial brief uses asymmetric composition and continuous scroll storytelling. The user supplied [Lev](https://www.lev.com/) as a motion reference: spatial elements converging into a central interface, followed by a horizontal showcase. Gatree retains its own colors, typography, copy, photography, and real product components.

## Generated assets

Generated with the built-in image generation tool; originals remain in Codex's generated-images directory. The two selected PNGs are copied into the project:

- `public/marketing/creator-cutout.png`: portrait for the hero and example profiles.
- `public/marketing/studio-wide.png`: music-production scene for supporting visuals.

These people are illustrative example personas, not customers or endorsements.

### Creator prompt

Use case: photorealistic-natural. Asset type: creator portrait cutout for Gatree, a bold commercial link-in-bio landing for Brazilian creatives. Create a premium editorial photographic cutout of a young adult Brazilian woman creative with brown skin and dark natural curly shoulder-length hair, relaxed confident expression, candid looking slightly toward camera. Waist-up seated pose, wearing a soft warm muted yellow oversized t-shirt, studio over-ear headphones around her neck, holding an unbranded modern dark smartphone casually in one hand. Rich tactile skin and fabric texture, professional natural studio lighting with warm side light, soft credible shadow, authentic contemporary creator energy. Front three-quarter composition, full head/hair/hands and torso visible, generous transparent breathing room around edges. Sharp subject focus, real photographic detail, fashion campaign quality. Absolutely transparent background with clean alpha around hair. No room/environment, no text, no logos, no graphics, no badges, no second person, no readable UI on phone. The website adds all typography and product UI in code.

### Studio prompt

Use case: photorealistic-natural. Asset type: 3:2 wide editorial photo for a commercial creator platform website audience gallery. Photograph an adult Brazilian musician and independent producer in a contemporary home music studio, dark curly hair, warm medium skin, wearing a charcoal shirt, focusing on a compact synthesizer keyboard and music production desk. Natural candid perspective from slightly above and side, musician occupying left-to-center composition, textured dark acoustic panels and softly lit monitor blurred in background. Warm muted yellow afternoon light accent, off-black and olive neutral room palette, analog tactile grain restrained, premium magazine campaign photography, intimate and creative, not corporate. Keep any computer interface out of focus and unreadable, no logos/text/watermark, no neon purple/blue lighting, no collage or multiple panels. Single believable scene, horizontal wide framing.

## Product demonstrations

- `public/marketing/editor-demo-hd.jpg`: 1952×1280 editor capture, cropped to the seeded demonstration tree and controls; account navigation is excluded. Rendered at a maximum of 976 CSS pixels.
- `components/marketing/analytics-demo.tsx`: actual analytics components rendered directly with a standalone fictional fixture. The visible sample-data label distinguishes this from customer results. No authenticated analytics data is exported.
- `public/marketing/short-links-demo-hd.jpg`: 1120×1414 real blank create-link dialog, captured without submitting the form. Rendered at a maximum of 540 CSS pixels.
- `public/marketing/qr-demo.svg`: generated using the existing `qrcode` package, encoding `https://gatree.app/`.

The profile previews render the app's actual `PreviewContent` component with localized sample content. No invented customer testimonials or conversion metrics are used.

## Motion

- The desktop opening pins briefly while typography leaves the frame and the composition expands. Its stage is capped at 650px, desktop bottom padding is 24px, and the initial portrait uses up to 780px of height in the immersive mode to reduce visible blank space on tall screens. Static/reduced-motion and mobile versions retain their original portrait bounds. The scene ends on a charcoal surface with a localized value proposition and CTA on the left, plus a clear profile on the right. Intro and scroll animations use separate wrappers.
- The universe scene arranges eight content chips around a central Gatree brand hub. Desktop chips are 166×84 with larger labels; the central hub is 150×150. Mobile uses smaller chips and a 40–64px hub to preserve separation. Each group moves toward the hub's side ports and disappears before the profile enters. The hub reacts to arriving groups and then disappears. The heading becomes “Tudo em um único link.” Desktop pins this scene for about one viewport of travel; mobile uses an unpinned scrub sequence.
- CinematicField uses native SVG paths. In the universe scene, eight higher-contrast gold routes connect each chip's inner edge to the hub's ports, with scroll-driven pulses and small localized highlights. A ResizeObserver recomputes endpoints from static element dimensions, preserving alignment on smaller screens. Routes recede when the profile becomes the focus. The opening's quieter background remains unchanged. There are no raster textures or continuous idle animation.
- Each feature illustration responds to scroll: masked studio parallax, perspective entrances, content icons assembling, a scanner crossing the actual QR code, and a cursor connecting UTM nodes with traveling pulses. Copy is separated from the transformed art layers and remains readable. These scenes remain in ordinary document flow.
- The kinetic typography bridge moves three large words across the screen in alternating directions, entirely driven by scroll rather than an autoplay loop. Outlined words use text-shadow silhouettes to avoid internal contours in the variable font.
- One destination marquee shows the breadth of content; its native pause control preserves position.
- At desktop widths of at least 1024px and viewport heights of at least 760px, and on phones at least 360px wide and 800px tall, one immersive stage stays pinned while scroll progress crossfades between the editor, analytics, and short-link chapters. The composition is shared across all three chapters. Phone layouts stack the copy and demonstration; the compact analytics preview shows four metrics and its sample-data label.
- A progress line and tabs reflect the active chapter. Tabs can also move directly to a chapter within the scroll sequence.
- On smaller or shorter viewports, the same demonstrations remain in normal document flow as tabs. Switching demonstrations uses a subtle opacity and vertical-translation transition lasting 0.28 seconds when motion is enabled.
- Reduced-motion preferences disable pinning and chapter animation, preserving the static tab controls and demonstrations. GSAP media cleanup restores transforms, opacity, and pin spacing when preferences or viewport conditions change.
- The audience showcase pins a horizontal rail of four full compositions on desktop. Scrolling translates it by exactly three measured panel widths. Each chapter has photo parallax, a profile entrance, and progressive copy movement. Pointer and keyboard tabs can select chapters directly; mobile, tablet, and reduced-motion layouts use normal tabs. Sample profile content is also available without JavaScript.
- The final CTA expands a gold surface with a circular clipping mask and reveals its heading by lines. The text and button sit on a constant opaque gold area so contrast stays stable throughout the animation. It has no oversized wordmark; the single large Gatree wordmark lives in the footer. This scene uses ordinary scroll flow.
