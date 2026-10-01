export type BurdenCategory =
  | 'finance'
  | 'health'
  | 'heart'
  | 'everything';

export interface ChatMessage {
  id: string;
  sender: 'jesus' | 'user';
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export type ConversationStep =
  | 'step0_ready'        // "Are you ready to hear me?" -> [🙏 Yes, speak to me]
  | 'step1_name'         // "Write down here what you're called" -> Text input
  | 'step2_deep_breath'  // "Take a deep breath... tell me what is hurting most?" -> [✅ YES, I'M READY]
  | 'step3_burden'       // "What is the burden?" -> 4 choices
  | 'step4_branch'       // Deep branch messages -> [🙏 YES, I ACCEPT]
  | 'step5_preparation'  // "The word is ready... drop everything" -> [🙏 SPEAK. I'M HERE.]
  | 'step6_door'         // "It is done... Right now in the heavens..." -> [🙏 OPEN THE DOOR]
  | 'step7_redirecting'; // Final redirect to VSL

export interface ChatState {
  step: ConversationStep;
  userName: string;
  selectedBurden?: BurdenCategory;
  burdenLabel?: string;
  isTyping: boolean;
  messages: ChatMessage[];
}
