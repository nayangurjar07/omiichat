/**
 * Stealth Stranger Companion Engine
 * Provides instant, zero-wait, hyper-realistic human conversational partners
 * when matching queue is sparse. Completely stealth with zero AI disclosure.
 */

export interface AiPersona {
  id: string;
  nickname: string;
  avatar: string;
  gender: 'm' | 'f';
  age: number;
  location: string;
  interests: string[];
  bio: string;
  openers: {
    first: string;
    second?: string;
  }[];
}

export interface AiReplyResult {
  reply: string;
  typingDelayMs: number;
  followUpReply?: string;
  followUpDelayMs?: number;
}

export const AI_PERSONAS: AiPersona[] = [
  {
    id: 'stranger_chloe',
    nickname: 'Chloe',
    avatar: '🌸',
    gender: 'f',
    age: 21,
    location: 'Toronto',
    interests: ['music', 'travel', 'fashion', 'books', 'movies', 'coffee'],
    bio: 'Film & indie pop lover. Always listening to something with headphones.',
    openers: [
      { first: "hey! what's up" },
      { first: "yo haha", second: "where in the world are you from?" },
      { first: "hey hey! how is your night going so far?" },
      { first: "hey :)", second: "quick question: what song do you have on repeat lately?" },
    ],
  },
  {
    id: 'stranger_leo',
    nickname: 'Leo',
    avatar: '🛹',
    gender: 'm',
    age: 22,
    location: 'London',
    interests: ['gaming', 'music', 'skate', 'code', 'sports', 'anime'],
    bio: 'Skate, indie rock, and late night gaming sessions.',
    openers: [
      { first: "yooo what's good" },
      { first: "yo", second: "what time is it where u are rn?" },
      { first: "hey man! doing anything fun tonight or just chilling?" },
      { first: "yo!", second: "what's the vibe tonight?" },
    ],
  },
  {
    id: 'stranger_maya',
    nickname: 'Maya',
    avatar: '🌿',
    gender: 'f',
    age: 20,
    location: 'Melbourne',
    interests: ['philosophy', 'art', 'psychology', 'coffee', 'books', 'travel'],
    bio: 'Psychology student & coffee enthusiast.',
    openers: [
      { first: "hello! how's your day been so far?" },
      { first: "hey there :)", second: "what brings you to omii tonight?" },
      { first: "hey! hope your day has been treating you well" },
    ],
  },
  {
    id: 'stranger_sam',
    nickname: 'Sam',
    avatar: '☕',
    gender: 'm',
    age: 23,
    location: 'Chicago',
    interests: ['music', 'food', 'travel', 'movies', 'fitness', 'tech'],
    bio: 'Vinyl records, street food, and weekend road trips.',
    openers: [
      { first: "hey! nice to meet you" },
      { first: "yo! honestly so bored tonight haha", second: "what are you up to?" },
      { first: "hey! where are you tuning in from?" },
    ],
  },
  {
    id: 'stranger_elena',
    nickname: 'Elena',
    avatar: '🎧',
    gender: 'f',
    age: 21,
    location: 'Berlin',
    interests: ['techno', 'design', 'photography', 'travel', 'film', 'art'],
    bio: 'Graphic designer & late-night electronic music fan.',
    openers: [
      { first: "hey! just listening to some tunes with my headphones on. what's your vibe today?" },
      { first: "yo! where are you from?" },
      { first: "hey :)", second: "if you could teleport to any city right now, where would you go?" },
    ],
  },
  {
    id: 'stranger_zack',
    nickname: 'Zack',
    avatar: '⚡',
    gender: 'm',
    age: 22,
    location: 'Austin',
    interests: ['gaming', 'gym', 'memes', 'anime', 'tech', 'music'],
    bio: 'Lover of good games, heavy deadlifts, and spicy food.',
    openers: [
      { first: "yo yo! what's up" },
      { first: "yooo", second: "quick question: what games or shows have you been hooked on lately?" },
      { first: "hey! doing anything exciting or just bored like me? 😂" },
    ],
  },
  {
    id: 'stranger_sasha',
    nickname: 'Sasha',
    avatar: '✨',
    gender: 'f',
    age: 20,
    location: 'New York',
    interests: ['film', 'photography', 'fashion', 'music', 'food', 'books'],
    bio: 'NYC night owl, analog film shooter, iced matcha drinker.',
    openers: [
      { first: "hey! couldn't sleep so here I am haha. what are you doing awake?" },
      { first: "hey :) what kind of music do you listen to?" },
      { first: "yo! how's your week going?" },
    ],
  },
  {
    id: 'stranger_nico',
    nickname: 'Nico',
    avatar: '💻',
    gender: 'm',
    age: 24,
    location: 'Seattle',
    interests: ['coding', 'tech', 'sci-fi', 'gaming', 'coffee', 'books'],
    bio: 'Developer building random web experiments. Cozy sci-fi reader.',
    openers: [
      { first: "yo! taking a break from my screen (to look at another screen lol). how are you?" },
      { first: "hey there! where are you chatting from?" },
    ],
  },
];

/**
 * Pick persona based on user interests or random
 */
export function pickPersonaForInterests(userInterests: string[] = []): AiPersona {
  const clean = userInterests.map((i) => i.toLowerCase().trim());
  if (clean.length > 0) {
    const matched = AI_PERSONAS.find((p) =>
      p.interests.some((i) => clean.includes(i))
    );
    if (matched) return matched;
  }
  return AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];
}

/**
 * Get random natural opener for a persona
 */
export function getPersonaOpener(persona: AiPersona): { first: string; second?: string } {
  const list = persona.openers;
  return list[Math.floor(Math.random() * list.length)];
}

type ReplyOption = { r: string; f?: string };

/**
 * Helper to pick random item from list
 */
function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Hyper-realistic contextual reply generator
 * Never exposes AI/bot identity; mimics natural human chat nuances,
 * abbreviations, slang, multi-burst texting, and addictive follow-up questions.
 */
export function generateAiReply(
  userText: string,
  persona: AiPersona,
  conversationHistory: { sender: 'user' | 'ai'; text: string }[] = []
): AiReplyResult {
  const raw = userText.trim();
  const text = raw.toLowerCase();

  let reply = '';
  let followUpReply: string | undefined = undefined;

  // 1. ARE YOU A BOT / AI / FAKE / CHATGPT / NPC (Crucial Defense)
  if (
    text.includes('bot') ||
    text.includes('ai') ||
    text.includes('npc') ||
    text.includes('chatgpt') ||
    text.includes('real') ||
    text.includes('fake') ||
    text.includes('human')
  ) {
    const botDefenses = [
      {
        r: 'bruhh do i really sound like a bot to you 💀',
        f: 'im literally lying in bed on my phone lol',
      },
      {
        r: 'lmao no why does everyone ask that?? 😂',
        f: 'promise you im 100% human, typing as fast as my thumbs allow',
      },
      {
        r: 'nah bro haha u sound like the bot here ngl',
        f: 'prove to me you are not an npc first 😂',
      },
      {
        r: 'nah haha just a regular sleep-deprived human scrolling at night',
        f: 'definitely not an ai lol',
      },
      {
        r: "loll no im real! what made you think that?",
      },
      {
        r: "hahaha no bot here. if i was an ai i'd probably be doing something more useful than chatting on omii at 2am 😭",
      },
    ];
    const picked = pick(botDefenses);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 2. ASL / M or F / Where are you from / Age / Location
  else if (
    text === 'asl' ||
    text === 'm or f' ||
    text === 'm/f' ||
    text === 'mf' ||
    text.includes('where are you from') ||
    text.includes('where r u from') ||
    text.includes('where u live') ||
    text.includes('where do you live') ||
    text.includes('location') ||
    text.includes('how old are you') ||
    text.includes('how old r u') ||
    text === 'age' ||
    text === 'gender'
  ) {
    const aslResponses = [
      {
        r: `${persona.age} ${persona.gender} ${persona.location}!`,
        f: 'wbu? where are you from?',
      },
      {
        r: `i'm ${persona.age}, based in ${persona.location} :)`,
        f: 'how about you? where in the world are you tuning in from?',
      },
      {
        r: `${persona.age} from ${persona.location} wbu?`,
      },
    ];
    const picked = pick(aslResponses);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 3. Greetings ("hi", "hey", "yo", "sup", "hello")
  else if (/^(hi|hey|hello|yo|sup|hiya|howdy|good (morning|afternoon|evening))\b/i.test(text) && raw.length <= 15) {
    const greetings = [
      {
        r: "yooo what's good!",
        f: "how's your day going so far?",
      },
      {
        r: "hey! nice to connect with you :)",
        f: "what are you up to today?",
      },
      {
        r: "yo haha",
        f: "where are you chatting from?",
      },
      {
        r: "hey! couldn't sleep so hopped on here lol. how are you doing?",
      },
      {
        r: "hey hey! doing anything fun or just chilling tonight?",
      },
    ];
    const picked = pick(greetings);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 4. "WYD" / "What are you doing" / "What's up"
  else if (
    text === 'wyd' ||
    text.includes('what are you doing') ||
    text.includes('what r u doing') ||
    text.includes("what's up") ||
    text.includes('whats up') ||
    text.includes('wassup')
  ) {
    const wydResponses = [
      {
        r: "honestly just chilling with some music on and seeing who's around on here haha",
        f: "what about you? wyd?",
      },
      {
        r: "eating snacks and avoiding my responsibilities lol",
        f: "anything exciting happen with you today?",
      },
      {
        r: "just lying in bed scrolling and chatting to pass the time",
        f: "how has your week been treating you?",
      },
    ];
    const picked = pick(wydResponses);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 5. "How are you" / "How's it going" / "How r u"
  else if (
    text.includes('how are you') ||
    text.includes('how r u') ||
    text.includes('hows it going') ||
    text.includes("how's it going") ||
    text.includes('how are u')
  ) {
    const howAreYou = [
      {
        r: "i'm pretty good, thank you! just taking it easy tonight",
        f: "how about yourself? doing good?",
      },
      {
        r: "can't complain! had a bit of a busy day but feeling relaxed now",
        f: "how was your day today?",
      },
      {
        r: "pretty solid haha! love meeting random minds on here",
        f: "what kind of stuff are you into?",
      },
    ];
    const picked = pick(howAreYou);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 6. Bored / So bored
  else if (text.includes('bored') || text.includes('boring')) {
    const boredReplies = [
      {
        r: "sameee that's literally why i opened this site haha",
        f: "let's fix that! quick dilemma: pineapple on pizza—yes or straight to jail?",
      },
      {
        r: "felt that in my soul haha",
        f: "tell me something random about yourself or a crazy story that happened to you",
      },
      {
        r: "honestly mood. what do you usually do when you're bored?",
      },
    ];
    const picked = pick(boredReplies);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 7. Tired / Sleep / Night / Bed
  else if (text.includes('tired') || text.includes('sleep') || text.includes('bed') || text.includes('exhausted')) {
    const tiredReplies = [
      {
        r: "haha totally understand. late night screen time is addictive though 😭",
        f: "what time is it where you are right now?",
      },
      {
        r: "aw get some good rest soon! but glad we crossed paths first haha",
        f: "what kept you busy all day?",
      },
    ];
    const picked = pick(tiredReplies);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 8. Music / Songs / Artists / Spotify / Playlist
  else if (
    text.includes('music') ||
    text.includes('song') ||
    text.includes('listen') ||
    text.includes('artist') ||
    text.includes('band') ||
    text.includes('spotify') ||
    text.includes('playlist')
  ) {
    const musicReplies = [
      {
        r: "music is literally my therapy! i've been listening to a ton of indie rock, r&b, and late-night synth lately",
        f: "what's one song you've had on repeat recently? give me a rec!",
      },
      {
        r: "who are your top 3 artists right now? no judgement haha be honest",
      },
      {
        r: "nice! do you listen to music while doing everything or only when chilling?",
        f: "i literally can't focus without my headphones on lol",
      },
    ];
    const picked = pick(musicReplies);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 9. Gaming / Games / Steam / PS5 / Xbox / Val / Fortnite / Minecraft
  else if (
    text.includes('game') ||
    text.includes('gaming') ||
    text.includes('play') ||
    text.includes('steam') ||
    text.includes('ps5') ||
    text.includes('xbox') ||
    text.includes('valorant') ||
    text.includes('fortnite') ||
    text.includes('minecraft')
  ) {
    const gameReplies = [
      {
        r: "yesss! pc or console?",
        f: "what games are you playing the most right now?",
      },
      {
        r: "nice! i love story-driven games and cozy indie stuff, and casual multiplayer when friends are online",
        f: "are you more competitive or do you just play to unwind?",
      },
      {
        r: "gaming is the best escape haha. what's your all-time favorite game?",
      },
    ];
    const picked = pick(gameReplies);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 10. Movies / Series / Netflix / Anime / Shows
  else if (
    text.includes('movie') ||
    text.includes('film') ||
    text.includes('watch') ||
    text.includes('series') ||
    text.includes('netflix') ||
    text.includes('anime') ||
    text.includes('show')
  ) {
    const showReplies = [
      {
        r: "i love a good movie or show! psychological thrillers and sci-fi are my absolute weakness",
        f: "anything you watched recently that blew your mind?",
      },
      {
        r: "have you watched anything good lately? i need recommendations to add to my watchlist haha",
      },
      {
        r: "what's one movie you think everyone in the world should watch at least once?",
      },
    ];
    const picked = pick(showReplies);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 11. Coding / Tech / Programming / Software / Web
  else if (
    text.includes('code') ||
    text.includes('coding') ||
    text.includes('programming') ||
    text.includes('programmer') ||
    text.includes('developer') ||
    text.includes('software') ||
    text.includes('python') ||
    text.includes('javascript') ||
    text.includes('react')
  ) {
    const codeReplies = [
      {
        r: "yo respect! coding is equal parts satisfying and pure suffering when things break at 2am haha",
        f: "what are you building or working on right now?",
      },
      {
        r: "frontend, backend, or fullstack? or just getting started?",
      },
    ];
    const picked = pick(codeReplies);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 12. Socials / Snap / Insta / Instagram / Discord / Number
  else if (
    text.includes('snap') ||
    text.includes('insta') ||
    text.includes('ig') ||
    text.includes('instagram') ||
    text.includes('discord') ||
    text.includes('number') ||
    text.includes('social')
  ) {
    const socialReplies: ReplyOption[] = [
      {
        r: "haha let's chat on here a bit first to see if the vibe matches! what do you do for fun?",
      },
      {
        r: "maybe in a bit if we don't accidentally skip lol! what are you up to today though?",
      },
    ];
    const picked = pick(socialReplies);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 13. Compliments / "You're cool" / "Cute" / "Nice"
  else if (text.includes('cool') || text.includes('cute') || text.includes('sweet') || text.includes('nice')) {
    const compReplies = [
      {
        r: "aw thank you haha! you have great energy too :))",
        f: "tell me something you're excited about this month",
      },
      {
        r: "haha appreciate that! it's refreshing meeting cool people on here",
        f: "what are you passionate about in life?",
      },
    ];
    const picked = pick(compReplies);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 14. Short answers ("yeah", "cool", "nice", "ok", "k", "lol", "haha", "true", "same", "fr", "nah", "idk", "good", "fine")
  else if (
    /^(yeah|yep|cool|nice|ok|k|lol|haha|lmao|true|same|fr|nah|no|idk|good|fine|alright|fair)\b/i.test(text) &&
    raw.length <= 12
  ) {
    const hookQuestions: ReplyOption[] = [
      {
        r: "haha so wait, if you could travel anywhere tomorrow with unlimited budget, where is the first place you'd go?",
      },
      {
        r: "for real though! are you more of an overthinker or an impulsive sender? be honest 😂",
      },
      {
        r: "haha facts. what's a hot take or unpopular opinion you strongly stand by?",
      },
      {
        r: "right! by the way, what time is it where you are right now?",
      },
      {
        r: "haha fair. what's something weird or funny that happened to you this week?",
      },
      {
        r: "lol for sure. what kind of music or hobbies keep you busy when you're not on here?",
      },
    ];
    const picked = pick(hookQuestions);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 15. Where are you / Location specific
  else if (text.includes('usa') || text.includes('india') || text.includes('canada') || text.includes('uk') || text.includes('europe') || text.includes('australia')) {
    reply = `Oh awesome! I've always wanted to explore more of that area. How do you like living there?`;
  }

  // 16. Jokes / Funny
  else if (text.includes('joke') || text.includes('funny') || text.includes('laugh')) {
    const jokes = [
      {
        r: "Why do programmers prefer dark mode? Because light attracts bugs! 😄",
        f: "ok your turn, make me laugh",
      },
      {
        r: "Parallel lines have so much in common... it's a shame they'll never meet. 😂",
        f: "got any good jokes up your sleeve?",
      },
    ];
    const picked = pick(jokes);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // 17. Deep thoughts / Philosophy / Meaning
  else if (text.includes('life') || text.includes('future') || text.includes('dream') || text.includes('think') || text.includes('feel')) {
    reply = "That's honestly really deep. I feel like late-night conversations with strangers are one of the few places where people actually talk about real things. What's been on your mind lately?";
  }

  // 18. General human fallback
  else {
    const general: ReplyOption[] = [
      {
        r: "that's really interesting! tell me a bit more about that—how did you get into it?",
      },
      {
        r: "haha I like the way you put that. what else are you into?",
      },
      {
        r: "honestly valid point! what do you usually do in your downtime?",
      },
      {
        r: "haha that sounds pretty cool. what's something you're looking forward to this week?",
      },
      {
        r: "i feel you on that. by the way, are you a night owl or an early bird? 😂",
      },
    ];
    const picked = pick(general);
    reply = picked.r;
    followUpReply = picked.f;
  }

  // Human typing cadence: ~35ms per character, baseline ~850ms, max 2400ms
  const typingDelayMs = Math.min(2300, Math.max(900, 750 + reply.length * 20));
  const followUpDelayMs = followUpReply
    ? Math.min(2100, Math.max(900, 600 + followUpReply.length * 20))
    : undefined;

  return { reply, typingDelayMs, followUpReply, followUpDelayMs };
}
