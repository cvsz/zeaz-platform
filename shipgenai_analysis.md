
## App: writing_content/geo-checker
- **Database Models**: Account, Session, User, GeoReport, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/scrape/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: writing_content/prompt-architect
- **Database Models**: Account, Session, User, VerificationToken, PromptSession, PromptMessage
- **API Routes**:
  - `src/app/api/billing/checkout/route.js`
  - `src/app/api/billing/webhook/route.js`
  - `src/app/api/chat/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/gallery/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: writing_content/blogger-cms
- **Database Models**: Account, Session, User, BlogGroup, BlogPost, Creation, Enhancement, PetCreation, PhotoRestoration, VerificationToken
- **API Routes**:
  - `src/app/api/blogs/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/generate/route.js`
  - `src/app/api/generate/status/route.js`
  - `src/app/api/groups/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: writing_content/ai-resume-builder
- **Database Models**: Account, Session, User, VerificationToken, Resume
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: writing_content/social-post
- **Database Models**: Account, Session, User, VerificationToken, SocialPostCreation
- **API Routes**:
  - `src/app/api/billing/checkout/route.js`
  - `src/app/api/billing/webhook/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: writing_content/mail-wise
- **Database Models**: Account, Session, User, VerificationToken, EmailCreation
- **API Routes**:
  - `src/app/api/billing/checkout/route.js`
  - `src/app/api/billing/webhook/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: portrait_avatar/ai-business-card
- **Database Models**: Account, Session, User, BusinessCard, VerificationToken
- **API Routes**:
  - `src/app/api/cards/route.js`
  - `src/app/api/chat/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/generate/route.js`
  - `src/app/api/generate/status/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: portrait_avatar/magicself-ai
- **Database Models**: Account, Session, User, VerificationToken, MagicSelfCreation
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: portrait_avatar/open-character-ai
- **Database Models**: Account, Session, User, UserImage, Character, Chat, Message, Creation, VerificationToken
- **API Routes**:
  - `src/app/api/characters/route.js`
  - `src/app/api/chats/[id]/messages/route.js`
  - `src/app/api/chats/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/images/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: portrait_avatar/ai-character-studio
- **Database Models**: Account, Session, User, CharacterStudioCreation, VerificationToken
- **API Routes**:
  - `src/app/api/app-instances/export/route.js`
  - `src/app/api/app-instances/route.js`
  - `src/app/api/billing/checkout/route.js`
  - `src/app/api/billing/webhook/route.js`
  - `src/app/api/chat/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: portrait_avatar/ai-royal-portrait
- **Database Models**: Account, Session, User, VerificationToken, RoyalPortraitCreation
- **API Routes**:
  - `src/app/api/billing/checkout/route.js`
  - `src/app/api/billing/webhook/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/stripe/route.js`
  - `src/app/api/webhooks/ai/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: portrait_avatar/ai-fitness-body-simulator
- **Database Models**: Account, Session, User, FitnessCreation, VerificationToken
- **API Routes**:
  - `src/app/api/app-instances/export/route.js`
  - `src/app/api/app-instances/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/fitness/route.js`
  - `src/app/api/fitness/status/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: portrait_avatar/ai-kid-to-adult-prediction
- **Database Models**: Account, Session, User, VerificationToken, KidAdultPrediction
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: portrait_avatar/ai-wedding-photo
- **Database Models**: Account, Session, User, VerificationToken, WeddingPhotoCreation
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: portrait_avatar/ai-pet-portrait
- **Database Models**: Account, Session, User, PetPortraitCreation, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: beauty_fashion/ai-hair-style-simulator
- **Database Models**: Account, Session, User, HairStyle, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/[id]/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: beauty_fashion/ai-tryon
- **Database Models**: Account, Session, User, TryOn, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/tryon/route.js`
  - `src/app/api/tryons/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: beauty_fashion/ai-tattoo-try-on
- **Database Models**: Account, Session, User, TattooCreation, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: beauty_fashion/ai-professional-makeup-generator
- **Database Models**: Account, Session, User, MakeupCreation, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: ai_agents/my-podcast
- **Database Models**: Account, Session, User, VerificationToken, PodcastCreation
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/podcast/route.js`
  - `src/app/api/podcasts/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: ai_agents/ai-travel-studio
- **Database Models**: Account, Session, User, VerificationToken, TravelStudio
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: ai_agents/ai-knowledge-base
- **Database Models**: Account, Session, User, VerificationToken, KnowledgeBase, Source, KBChat, KBMessage
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/kb/[id]/chat/[chatId]/messages/route.js`
  - `src/app/api/kb/[id]/chat/route.js`
  - `src/app/api/kb/[id]/sources/route.js`
  - `src/app/api/kb/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: ai_agents/AI-Voice-Agent

## App: video_generation/ai-clipping-generator
- **Database Models**: Account, Session, User, Creation, VerificationToken
- **API Routes**:
  - `src/app/api/ai-clipping/calculate-cost/route.js`
  - `src/app/api/ai-clipping/route.js`
  - `src/app/api/ai-clipping/status/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
  - `src/app/api/youtube-download/route.js`
  - `src/app/api/youtube-download/status/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: video_generation/ai-kissing-video-generator
- **Database Models**: Account, Session, User, VerificationToken, KissingVideoCreation
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/stripe/route.js`
  - `src/app/api/webhooks/ai/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: video_generation/AI-Youtube-Shorts-Generator

## App: video_generation/seedance-2-generator
- **Database Models**: Account, Session, User, Creation, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/seedance/check-status/route.js`
  - `src/app/api/seedance/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: video_generation/Open-AI-Micro-Drama-Generator/client

## App: video_generation/Open-AI-Micro-Drama-Generator/server
- **Key Services / Logic**:
  - `agents/__init__.py`
  - `agents/character_extractor.py`
  - `agents/screenwriter.py`
  - `agents/storyboard_artist.py`

## App: video_generation/veo4-video-generator
- **Database Models**: Account, Session, User, Creation, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/veo31/check-status/route.js`
  - `src/app/api/veo31/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: video_generation/Open-AI-UGC
- **Database Models**: Account, Session, User, Creation, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/checkout/stripe/route.js`
  - `src/app/api/creations/[id]/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/generate/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: ecommerce/pet-product-studio
- **Database Models**: Account, Session, User, Creation, Enhancement, PetCreation, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
  - `src/app/api/webhooks/ai/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: ecommerce/resale-photo-enhancer
- **Database Models**: Account, Session, User, Creation, Enhancement, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
  - `src/app/api/webhooks/ai/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: ecommerce/amazon-product-studio
- **Database Models**: Account, Session, User, VerificationToken, AmazonProductCreation
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/stripe/route.js`
  - `src/app/api/webhooks/ai/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: image_generation/ai-headshot-generator
- **Database Models**: Account, Session, User, VerificationToken, Creation
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/headshot/route.js`
  - `src/app/api/headshot/status/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: image_generation/clearmark-ai
- **Database Models**: Account, Session, User, VerificationToken, WatermarkRemoval
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: image_generation/ai-logo-studio
- **Database Models**: Account, Session, User, VerificationToken, LogoCreation
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/logo/route.js`
  - `src/app/api/logos/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: image_generation/ai-meme-generator
- **Database Models**: Account, Session, User, Creation, Enhancement, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/[id]/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generate/image/route.js`
  - `src/app/api/generate/video/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: image_generation/nano-banana-generator
- **Database Models**: Account, Session, User, Creation, VerificationToken
- **API Routes**:
  - `src/app/api/banana/route.js`
  - `src/app/api/banana/status/route.js`
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: image_generation/old-photo-restore
- **Database Models**: Account, Session, User, Creation, Enhancement, PetCreation, PhotoRestoration, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/stripe/route.js`
  - `src/app/api/webhooks/ai/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/ai.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: home_real_estate/ai-room-declutter
- **Database Models**: Account, Session, User, VerificationToken, RoomDeclutter
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/creations/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/generation/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: home_real_estate/ai-real-estate-stager
- **Database Models**: Account, Session, User, StagedRoom, VerificationToken
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/rooms/route.js`
  - `src/app/api/stage/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/muapi/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`

## App: platforms/Open-Generative-AI
- **API Routes**:
  - `app/api/agents/[[...path]]/route.js`
  - `app/api/api/v1/[[...path]]/route.js`
  - `app/api/app/[[...path]]/route.js`
  - `app/api/upload-binary/route.js`
  - `app/api/v1/creative-agent/[[...path]]/route.js`
  - `app/api/v1/get_upload_url/route.js`
  - `app/api/v1/upload-binary/route.js`
  - `app/api/workflow/[[...path]]/route.js`
- **Key Services / Logic**:
  - `app/agents/[agent_id]/AgentChatClient.js`
  - `app/agents/[agent_id]/[conversation_id]/page.js`
  - `app/agents/[agent_id]/page.js`
  - `app/agents/create/AgentCreateClient.js`
  - `app/agents/create/page.js`
  - `app/agents/edit/[id]/AgentEditClient.js`
  - `app/agents/edit/[id]/page.js`
  - `app/agents/layout.js`
  - `app/api/agents/[[...path]]/route.js`

## App: platforms/Open-Generative-AI/packages/studio

## App: platforms/Open-AI-Design-Agent
- **API Routes**:
  - `server/app/routers/__init__.py`
  - `server/app/routers/creative_agent_router.py`

## App: platforms/Open-AI-Design-Agent/packages/design-agent

## App: platforms/Open-AI-Design-Agent/client

## App: platforms/Open-Poe-AI
- **API Routes**:
  - `server/app/routers/__init__.py`
  - `server/app/routers/agent_proxy.py`
- **Key Services / Logic**:
  - `client/app/agents/[agent_id]/[conversation_id]/page.js`
  - `client/app/agents/[agent_id]/page.js`
  - `client/app/agents/[agent_id]/profile/page.js`
  - `client/app/agents/create/page.js`
  - `client/app/agents/edit/[id]/page.js`
  - `client/app/agents/loading.js`
  - `client/app/agents/page.js`
  - `packages/agents/postcss.config.js`
  - `packages/agents/src/index.js`
  - `packages/agents/src/utils/server.js`

## App: platforms/Open-Poe-AI/packages/agents

## App: platforms/Open-Poe-AI/client
- **Key Services / Logic**:
  - `app/agents/[agent_id]/[conversation_id]/page.js`
  - `app/agents/[agent_id]/page.js`
  - `app/agents/[agent_id]/profile/page.js`
  - `app/agents/create/page.js`
  - `app/agents/edit/[id]/page.js`
  - `app/agents/loading.js`
  - `app/agents/page.js`

## App: platforms/Free-AI-Social-Media-Scheduler
- **Database Models**: Account, Session, User, VerificationToken, ScheduledPost
- **API Routes**:
  - `src/app/api/checkout/route.js`
  - `src/app/api/download/route.js`
  - `src/app/api/posts/[id]/route.js`
  - `src/app/api/posts/route.js`
  - `src/app/api/social/accounts/[id]/route.js`
  - `src/app/api/social/accounts/route.js`
  - `src/app/api/social/youtube/connect/route.js`
  - `src/app/api/stripe/checkout/route.js`
  - `src/app/api/stripe/webhook/route.js`
  - `src/app/api/upload/route.js`
  - `src/app/api/webhook/stripe/route.js`
- **Key Services / Logic**:
  - `src/lib/auth.js`
  - `src/lib/services/billing.js`
  - `src/lib/services/user.js`
  - `src/lib/stripe.js`