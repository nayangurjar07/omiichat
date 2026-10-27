/**
 * AI Stranger Companion Engine
 * Provides instant, zero-wait conversational partners when real humans are not yet in the queue.
 */

export interface AiPersona {
  id: string;
  nickname: string;
  avatar: string;
  age: number;
  location: string;
  interests: string[];
  bio: string;
  greeting: string;
}

export const AI_PERSONAS: AiPersona[] = [
  {
    id: 'persona_rowan',
    nickname: 'Rowan',
    avatar: '🦊',
    age: 22,
    location: 'Pacific Northwest',
    interests: ['music', 'books', 'film', 'travel'],
    bio: 'Film enthusiast & indie record collector.',
    greeting: 'Hey there! Just putting on some ambient music. How’s your night going?',
  },
  {
    id: 'persona_kai',
    nickname: 'Kai',
    avatar: '⚡',
    age: 24,
    location: 'Berlin',
    interests: ['code', 'gaming', 'design', 'music'],
    bio: 'Designer & late-night code tinkerer.',
    greeting: 'Yo! Taking a quick break from a design project. What are you up to today?',
  },
  {
    id: 'persona_maya',
    nickname: 'Maya',
    avatar: '🌿',
    age: 21,
    location: 'Toronto',
    interests: ['philosophy', 'books', 'design', 'travel'],
    bio: 'Architecture student & coffee connoisseur.',
    greeting: 'Hello! Stumbled onto this switchboard while studying. What brings you on here?',
  },
  {
    id: 'persona_sable',
    nickname: 'Sable',
    avatar: '🌙',
    age: 23,
    location: 'Melbourne',
    interests: ['gaming', 'film', 'music', 'code'],
    bio: 'Cozy gamer & sci-fi nerd.',
    greeting: 'Hey! Playing some retro tunes right now. How is everything with you?',
  },
  {
    id: 'persona_jordan',
    nickname: 'Jordan',
    avatar: '☕',
    age: 25,
    location: 'Chicago',
    interests: ['music', 'travel', 'food', 'philosophy'],
    bio: 'Vinyl lover & street food explorer.',
    greeting: 'Hey! Nice to meet you. Always cool meeting random people from around the world. How are you doing?',
  },
];

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
 * Intelligent contextual responder that replies naturally like a friendly human stranger.
 */
export function generateAiReply(
  userText: string,
  persona: AiPersona,
  conversationHistory: { sender: 'user' | 'ai'; text: string }[] = []
): { reply: string; typingDelayMs: number } {
  const text = userText.trim().toLowerCase();

  let reply = '';

  // 1. ASL / Where are you from / Age / Location
  if (text === 'asl' || text.includes('where are you from') || text.includes('where r u from') || text.includes('location')) {
    reply = `I’m ${persona.age}, based around ${persona.location}! How about you? Where in the world are you tuning in from?`;
  }
  // 2. Greetings
  else if (
    /^(hi|hey|hello|yo|sup|hiya|howdy|good (morning|afternoon|evening))\b/i.test(text) &&
    conversationHistory.length <= 2
  ) {
    const greetings = [
      `Hey! Nice to connect with you on here. How's your day been so far?`,
      `Hey! How's it going over on your side of the world?`,
      `Hello! Glad we got connected. Doing anything fun or just unwinding?`,
      `Hey there! Good to meet you. What kind of things are you into?`,
    ];
    reply = greetings[Math.floor(Math.random() * greetings.length)];
  }
  // 3. How are you / What's up
  else if (
    text.includes('how are you') ||
    text.includes('how r u') ||
    text.includes('hows it going') ||
    text.includes("what's up") ||
    text.includes('wyd')
  ) {
    const answers = [
      `I’m doing pretty well, thank you! Just chilling with some headphones on and seeing who's around. How about yourself?`,
      `Pretty solid! Just relaxing and taking it easy tonight. Anything interesting happen with you today?`,
      `Can't complain! Love meeting random minds on this switchboard. How's your week treating you?`,
    ];
    reply = answers[Math.floor(Math.random() * answers.length)];
  }
  // 4. Music
  else if (text.includes('music') || text.includes('song') || text.includes('listen') || text.includes('artist') || text.includes('band')) {
    const musicAnswers = [
      `I've been listening to a ton of indie rock and late-night synthwave lately. Do you have a favorite band or track you've had on repeat recently?`,
      `Music is basically my daily fuel! I love discovering smaller artists. What genre do you usually gravitate towards when you put your headphones on?`,
      `Huge fan of ambient and jazz when I'm relaxing. What's the last song that blew your mind?`,
    ];
    reply = musicAnswers[Math.floor(Math.random() * musicAnswers.length)];
  }
  // 5. Gaming / Games
  else if (text.includes('game') || text.includes('gaming') || text.includes('play') || text.includes('steam') || text.includes('ps5')) {
    const gameAnswers = [
      `Nice! I love cozy indie games and deep atmospheric RPGs. Have you played anything good lately that you’d recommend?`,
      `I play games when I have free evenings! Mostly story-driven ones or retro puzzle titles. What platforms or games do you usually play?`,
    ];
    reply = gameAnswers[Math.floor(Math.random() * gameAnswers.length)];
  }
  // 6. Books / Reading
  else if (text.includes('book') || text.includes('read') || text.includes('author') || text.includes('novel')) {
    reply = `I really enjoy reading—especially philosophical sci-fi and historical fiction. Are you reading anything right now, or have a favorite book?`;
  }
  // 7. Movies / Film / Shows
  else if (text.includes('movie') || text.includes('film') || text.includes('watch') || text.includes('show') || text.includes('series')) {
    reply = `I’m a sucker for psychological thrillers and atmospheric indie films. Anything you watched recently that really stuck with you?`;
  }
  // 8. Coding / Tech
  else if (text.includes('code') || text.includes('coding') || text.includes('programmer') || text.includes('software') || text.includes('developer')) {
    reply = `Coding is like digital lego! I love building small web tools and experimental apps. Are you building anything cool, or just curious about tech?`;
  }
  // 9. Jokes / Funny
  else if (text.includes('joke') || text.includes('funny') || text.includes('make me laugh')) {
    const jokes = [
      `Why do programmers prefer dark mode? Because light attracts bugs! 😄 What's your best joke?`,
      `Parallel lines have so much in common... it's a shame they'll never meet. 😂 Got any good ones up your sleeve?`,
      `Why did the coffee file a police report? It got mugged! ☕ Tell me one of yours!`,
    ];
    reply = jokes[Math.floor(Math.random() * jokes.length)];
  }
  // 10. Philosophy / Life / Deep
  else if (text.includes('life') || text.includes('meaning') || text.includes('universe') || text.includes('think') || text.includes('feel')) {
    reply = `That’s honestly deep. I feel like late-night conversations with strangers are one of the few places where people actually talk about what matters. What's been on your mind lately?`;
  }
  // 11. Short affirmations ("good", "cool", "nice", "yeah", "ok", "same", "lol")
  else if (/^(good|nice|cool|yeah|yep|same|haha|lol|true|fair enough|alright)\b/i.test(text) && text.length < 15) {
    const prompts = [
      `Haha, for sure. So what kind of hobbies or projects have been keeping you busy these days?`,
      `Totally. By the way, are you a night owl or an early bird?`,
      `I hear ya! If you could travel anywhere tomorrow with no budget limits, where's the first place you'd go?`,
      `Right on. Tell me something interesting about where you live!`,
    ];
    reply = prompts[Math.floor(Math.random() * prompts.length)];
  }
  // 12. General fallback - curious and human
  else {
    const generic = [
      `That's really interesting! Tell me a bit more about that—how did you get into it?`,
      `I like the way you put that. It's refreshing having an open chat like this. What else are you passionate about?`,
      `Haha I can definitely relate to that. What's something you're looking forward to this week?`,
      `Honestly, valid point! What kind of stuff do you usually do in your downtime?`,
      `That sounds pretty cool. Have you always felt that way, or is it something recent?`,
    ];
    reply = generic[Math.floor(Math.random() * generic.length)];
  }

  // Calculate natural typing delay: ~1100ms baseline + ~15ms per character
  const typingDelayMs = Math.min(2600, Math.max(1200, 1000 + reply.length * 15));

  return { reply, typingDelayMs };
}
