import { BurdenCategory } from '../types';

export interface DialogueBlock {
  texts: string[];
  delayBetweenMs?: number;
}

export const INITIAL_MESSAGES: string[] = [
  "You came here. **This was not by chance.** **I brought** you here.",
  "You know **exactly what brought you here.** That is what I am going to talk to you about.",
  "**Are you ready to listen to me?**"
];

export const STEP1_ASK_NAME_MESSAGES: string[] = [
  "First, I want to call you **by your name.**",
  "**Write here** what you're called 🙏"
];

export function getStep2Messages(name: string): string[] {
  return [
    `${name}`,
    "Right now... your heart is carrying a very heavy burden.",
    "Take a deep breath.",
    "What I'm about to tell you is **just between you and I**.",
    "Are you ready to **tell me what hurts the most?**"
  ];
}

export function getStep3Messages(name: string): string[] {
  return [
    `Tell me, ${name}.`,
    "**What is the weight or affliction** that brought you to me today?"
  ];
}

export interface BurdenOption {
  category: BurdenCategory;
  label: string;
}

export const BURDEN_OPTIONS: BurdenOption[] = [
  {
    category: 'finance',
    label: '💰 My debts and finances are suffocating me'
  },
  {
    category: 'health',
    label: '❤️ My physical and emotional health is shaken'
  },
  {
    category: 'heart',
    label: '💕 My heart is wounded and my family is in crisis'
  },
  {
    category: 'everything',
    label: '🙏 Everything at once, I can\'t take it anymore'
  }
];

export function getBurdenMessages(category: BurdenCategory, name: string): string[] {
  switch (category) {
    case 'finance':
      return [
        `I know **the weight you carry**, ${name}.`,
        "Waking up at **3 in the morning** with your mind racing and the bills pounding.",
        "The tightness in your chest seeing charges and messages you're **even afraid to open**.",
        "The silent pain of **not being able to give your best** to the people you love.",
        "I see **every detail of your struggle**.",
        "And I **have not been silent**.",
        "There is a **financial provision and deliverance** prepared for your life.",
        "**Not for everyone. But for you.**",
        "Because even when many would have already given up, **you kept your faith alive**.",
        "What I'm about to reveal to you will change your story with money **forever**.",
        "Do you accept receiving this provision?"
      ];

    case 'health':
      return [
        `I know **the weight you carry**, ${name}.`,
        "Waking up already **exhausted** before the day even begins.",
        "That silent pain that **no one around you can feel**.",
        "Appointments, exams and medicine that **didn't bring the relief you cried out for**.",
        "The nights on your knees praying just to **be able to sleep in peace and without pain**.",
        "The secret fear that this suffering is your **new normal**.",
        "I see **all your tears**.",
        "And I **have not been silent**.",
        "There is a **healing and renewal** prepared for your body.",
        "**Not for everyone. But for you.**",
        "Because you kept believing even when your body **seemed to fail you**.",
        "What I'm about to reveal to you will transform your health and strength **forever**.",
        "Do you accept receiving this healing?"
      ];

    case 'heart':
      return [
        `I know **the weight you carry**, ${name}.`,
        "Your home has felt **too heavy and too silent**.",
        "The pain of absence, or the distance from the one you **most wish was near**.",
        "Harsh words that wounded your soul, and messages you sent that **came back as contempt**.",
        "The pain of giving yourself completely and receiving only **coldness and rejection** in return.",
        "The hidden crying into your pillow that **no one on earth hears**.",
        "I see **every tear shed**.",
        "And I **have not been silent**.",
        "There is a **restitution and reconciliation** prepared for your home.",
        "**Not for everyone. But for you.**",
        "Because you kept opening your heart when anyone else would have already closed it.",
        "What I'm about to reveal now will heal your wounds of love and family **forever**.",
        "Do you accept receiving this reconciliation?"
      ];

    case 'everything':
    default:
      return [
        `I know **the weight you carry**, ${name}.`,
        "You're not facing **just one isolated problem**.",
        "You're carrying **the whole world on your shoulders** at once.",
        "The bills piling up, the body tired, the heart hurting, and prayers that seemed **unanswered**.",
        "Waking up with no energy **before the sun even rises**.",
        "Putting a smile on your face so you don't worry others, while **falling apart inside**.",
        "Wondering in silence how much longer your strength can **keep you standing**.",
        "I see **everything you have endured**.",
        "And I **have not been silent**.",
        "There is a **complete restoration** prepared for every area of your life.",
        "**Not for everyone. But for you.**",
        "Because you stayed strong where anyone else would have already collapsed.",
        "What I'm about to reveal to you will move through **every area of your life** at once.",
        "Do you accept receiving this victory?"
      ];
  }
}

export function getPreparationMessages(category: BurdenCategory, name: string): string[] {
  switch (category) {
    case 'finance':
      return [
        `So listen to me closely, ${name}.`,
        "The word is already **ready**.",
        "Recorded and sealed **before you even asked me**.",
        "But I need you to be **100% present right now**.",
        "**Not later. Not tomorrow. Now.**",
        "Pause everything you're doing for a few minutes.",
        "Everything I'm about to say... is the **exact direction** you need to unlock your prosperity.",
        "**Don't look away or close this screen** until I'm finished."
      ];

    case 'health':
      return [
        `So listen to me closely, ${name}.`,
        "The word is already **ready**.",
        "Prepared exactly for the day your body would **cry out for help**.",
        "And that day is **today**.",
        "Stay right where you are.",
        "Feel your **breath** for a moment.",
        "Because in the next few minutes I'm going to release the **exact word** your body and spirit need to be renewed.",
        "**Don't look away or close this screen** until I'm finished."
      ];

    case 'heart':
      return [
        `So listen to me closely, ${name}.`,
        "The word is already **ready**.",
        "Written for the moment your heart **couldn't bear to bleed alone anymore**.",
        "And that moment is **today**.",
        "Wherever you are, **stay there**.",
        "Close the door of your room if you can.",
        "Because what I'm about to say... your soul has **waited years** to hear.",
        "**Don't look away or close this screen** until I'm finished."
      ];

    case 'everything':
    default:
      return [
        `So listen to me closely, ${name}.`,
        "The word is already **ready**.",
        "Kept for the exact day you'd say: **\"Lord, I can't carry this alone anymore.\"**",
        "And that day is **today**.",
        "Let go of everything you're holding onto right now.",
        "Just for these next few minutes... **rest in my arms**.",
        "Because the revelation that follows reaches **every corner of your life** at once.",
        "**Don't look away or close this screen** until I'm finished."
      ];
  }
}

export function getDoorMessages(name: string): string[] {
  return [
    `${name}`,
    "It is **finished**.",
    "At this exact moment, in the heavens, your name was **called and blessed**.",
    "Your cry was not in vain. It did not **get lost along the way**.",
    "It was **heard and answered**.",
    "Not next month. Not a year from now. **Now.**",
    "I released the word. The path is already **opening before you**.",
    "All that's left now is for you to take this step and **receive**.",
    `The moment has come, ${name}.`,
    "On the other side of this door... is the video message I prepared for you.",
    "Be still.",
    "Quiet the space around you.",
    "**Don't skip. Don't leave. Don't close this.**",
    "What comes next was made for **your ears and your heart**.",
    "As you walk through this door...",
    "You will see my **face**.",
    "You will hear my **voice**.",
    "When you're ready, open the door."
  ];
}
