# English chat redesign

This preview uses the updated offer order: $50 (MOST CHOSEN), $25, $70, $100.
All four USD checkout URLs are configured and payment buttons are active.
They are configured in `src/components/LiveJesusStep.tsx`, in `OFFER_CHECKOUT_URLS`.
The email step, validation, disguise and identification have been removed from offer selection.
The browser Back redirect points to `https://lp.divinetemple.online/back-offer`, preserving tracking parameters without forwarding email.
The supplied updated VTurb embed uses player `6ad53ae248a15a578a6de50f`, its corresponding preloads, a responsive 3:4 placeholder, and an offer delay of 657 seconds (10:57).

## Visual direction
Header shows only Jesus and the live online/typing status. The private-messages notice is restored, decorative slogans removed, and reply choices use a dark gold background with high-contrast light text.
Ivory and gold atmosphere, deep blue header, soft light, refined message cards and accessible compact controls. Existing English conversation content and branching are retained.

## New avatar
Project asset: `public/images/jesus-avatar.webp` (512×512, optimized WebP).
Used in the conversation header, opening screen and Facebook-style live profile.
Generated with the built-in image generation tool; converted to WebP for site delivery.
Generation prompt:

Use case: photorealistic-natural. Asset type: square profile avatar for a refined Christian prayer conversation interface, must remain legible in tiny circular crops. Create a new exceptionally beautiful ultra-realistic photographic portrait of Jesus Christ, recognizable traditional portrayal, adult Middle Eastern man in his early thirties with olive skin, shoulder-length naturally wavy dark brown hair, full well-groomed beard, brown eyes, a kind serene compassionate expression, gentle direct eye contact. Frontal face with head and upper shoulders, centered with ample room around hair for circle cropping. Ivory linen robe visible at shoulders. Soft natural warm light illuminating the face, subtle radiant golden backlight around hair, deeply blurred warm ivory and muted gold background. Skin pores and individual hairs sharply resolved with natural texture; tasteful realistic cinematic photography, 85mm portrait lens. No illustration, no plastic skin, no letters, no typography, no watermark, no icon, no graphic border. Output one square portrait.

Offer timing follows actual VTurb playback at 657 seconds (10:57). There is no page-load timeout; pauses, loading and the muted SmartAutoPlay preview do not advance the reveal.
