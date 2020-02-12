'use strict';


const questionPool = [{
  question: "How long would you like your next relationship to last",
  options: [
    { val: "A", text: "one night" },
    { val: "B", text: "A few months to a year" },
    { val: "C", text: "Several years" },
    { val: "D", text: "The rest of my life" }
  ]
}, {
  question: "Which word describes you best?",
  options: [
    { val: "A", text: "Carefree" },
    { val: "B", text: "Intense" },
    { val: "C", text: "Shy" },
    { val: "D", text: "Extrovert" }
  ]
}, {
  question: "How important is religion/god in your life?",
  options: [
    { val: "A", text: "Extremely important" },
    { val: "B", text: "Somewhat important" },
    { val: "C", text: "Not very important" },
    { val: "D", text: "Not important at all" }
  ]
}, {
  question: "Do you smoke?",
  options: [
    { val: "A", text: "Yes" },
    { val: "B", text: "No" },
    { val: "C", text: "Rarely" },
    { val: "D", text: "Just weed" }
  ]
}, {
  question: "Which best describes your political beliefs?",
  options: [
    { val: "A", text: "Liberal / Left" },
    { val: "B", text: "Centrist" },
    { val: "C", text: "Conservative / Right" },
    { val: "D", text: "Other" }
  ]
},
  {
    question: "What is more important to you in life",
    options: [
      { val: "A", text: "Money" },
      { val: "B", text: "Friends" },
      { val: "C", text: "Family" },
      { val: "D", text: "Health" }
    ]
  },
  {
    question: "Do you think you had a enojable chat with your opponent?",
    options: [
      { val: "A", text: "I did not really enjoy" },
      { val: "B", text: "Well, it was ok" },
      { val: "C", text: "Yes, it was quite nice actually!" },
      { val: "D", text: "Absolutely, we had some deep talk which really inspired me" }
    ]
  },
  {
    question: "Whats you favorite alcoholic drink",
    options: [
      { val: "A", text: "Vodka" },
      { val: "B", text: "Gin Tonic" },
      { val: "C", text: "Beer" },
      { val: "D", text: "Wine" }
    ]
  },
  {
    question: "Are you currently employed",
    options: [
      { val: "A", text: "Yes, full time!" },
      { val: "B", text: "I am a student!" },
      { val: "C", text: "No" },
      { val: "D", text: "I work and study!" }
    ]
  },
  {
    question: "Which describes your typical demeanour (Haltung) ",
    options: [
      { val: "A", text: "Cheerful! Always positive!" },
      { val: "B", text: "Meh. I have my ups and downs" },
      { val: "C", text: "Annoyed, the world sucks!" },
      { val: "D", text: "Bipolar" }
    ]
  },
  {
    question: "What of the following is rather part of you favorite music genre",
    options: [
      { val: "A", text: "HipHop" },
      { val: "B", text: "Electro" },
      { val: "C", text: "RnB" },
      { val: "D", text: "Pop" }
    ]
  },
  {
    question: "Rate your self confidence",
    options: [
      { val: "A", text: "Very, very high" },
      { val: "B", text: "Higher than the average" },
      { val: "C", text: "Average" },
      { val: "D", text: "Below average" }
    ]
  },
  {
    question: "Can you say that you really got to know your opponent today?",
    options: [
      { val: "A", text: "Hmm, not really" },
      { val: "B", text: "Somehow, at least superficially" },
      { val: "C", text: "Yes, i did not think to find out so much about him" },
      { val: "D", text: "He did not tell me anything I wanted" }
    ]
  },
  {
    question: "How many countries have you visited yet",
    options: [
      { val: "A", text: "1-2" },
      { val: "B", text: "3-5" },
      { val: "C", text: "6-8" },
      { val: "D", text: ">8" }
    ]
  },
  {
    question: "Which of the following could you most easily live without for one month?",
    options: [
      { val: "A", text: "Toothbrush" },
      { val: "B", text: "Phone" },
      { val: "C", text: "Internet" },
      { val: "D", text: "Porn" }
    ]
  },
  {
    question: "What opinion do you have about drug use",
    options: [
      { val: "A", text: "I would never try it" },
      { val: "B", text: "It's ok for recreational use" },
      { val: "C", text: "I tolerate just weak drugs" },
      { val: "D", text: "No" }
    ]
  },
  {
    question: "Would you tolerate personal drawbacks to help a friend?",
    options: [
      { val: "A", text: "Yes" },
      { val: "B", text: "Depends on the friend" },
      { val: "C", text: "Depends on which drawbacks" },
      { val: "D", text: "No" }
    ]
  },
  {
    question: "Do you believe in God",
    options: [
      { val: "A", text: "Yes" },
      { val: "B", text: "I am not sure" },
      { val: "C", text: "Yes, but not as religions present it" },
      { val: "D", text: "No" }
    ]
  },
  {
    question: "Name you greatest motivation in life, thus far!",
    options: [
      { val: "A", text: "Wealth" },
      { val: "B", text: "Love" },
      { val: "C", text: "Expression" },
      { val: "D", text: "Knowledge" }
    ]
  },
  {
    question: "Do you have a problem with racist jokes",
    options: [
      { val: "A", text: "Yes" },
      { val: "B", text: "No" },
      { val: "C", text: "Depends on which joke" },
      { val: "D", text: "Depends on the race" }
    ]
  },
  {
    question: "Which of the following types / attributes, describes you most?",
    options: [
      { val: "A", text: "Wholesome" },
      { val: "B", text: "A little on the slutty side" },
      { val: "C", text: "Crazy and colorful" },
      { val: "D", text: "Dark and mysterious" }
    ]
  },
  {
    question: "How would you classify yourself",
    options: [
      { val: "A", text: "Optimist" },
      { val: "B", text: "Pessimist" },
      { val: "C", text: "Realist" },
      { val: "D", text: "Idealist" }
    ]
  },
  {
    question: "Whats your favorite radio station in Austria",
    options: [
      { val: "A", text: "Ö3" },
      { val: "B", text: "FM4" },
      { val: "C", text: "Kronehit" },
      { val: "D", text: "Others" }
    ]
  },
  {
    question: "Would you like meeting your opponent another time in person?",
    options: [
      { val: "A", text: "Well absolutely!" },
      { val: "B", text: "Maybe after we get to know each other better via chat" },
      { val: "C", text: "I would prefer just chatting with him again" },
      { val: "D", text: "Not really!" }
    ]
  },
  {
    question: "What motivates you most to work hard",
    options: [
      { val: "A", text: "Money" },
      { val: "B", text: "The appreciation" },
      { val: "C", text: "The accumulated knowledge" },
      { val: "D", text: "I hate working hard" }
    ]
  },
  {
    question: "The Bible is",
    options: [
      { val: "A", text: "A book you should read" },
      { val: "B", text: "An interesting historical document" },
      { val: "C", text: "The basis of our living" },
      { val: "D", text: "Just a fairy tale" }
    ]
  },
  {
    question: "What is your thought about humor",
    options: [
      { val: "A", text: "oAnything goes if its funny" },
      { val: "B", text: "Some topics are just off limits" },
      { val: "C", text: "Nothing is funny that pokes fun at anyone" },
      { val: "D", text: "Humor should be clean and free of explicit conent" }
    ]
  },
  {
    question: "What do you think of polyamour relationships",
    options: [
      { val: "A", text: "I am polyamour" },
      { val: "B", text: "It is ok" },
      { val: "C", text: "No way!" },
      { val: "D", text: "I have no opinion on that" }
    ]
  },
  {
    question: "What describes you best regarding appointments",
    options: [
      { val: "A", text: "Always too late" },
      { val: "B", text: "Just the academic 5 minutes too late" },
      { val: "C", text: "Always in time" },
      { val: "D", text: "I even arrive earlier than agreed" }
    ]
  },
  {
    question: "How long was your longest relationship",
    options: [
      { val: "A", text: "Several weeks" },
      { val: "B", text: "Several months" },
      { val: "C", text: "Several years" },
      { val: "D", text: "I did not have a serious relationship" }
    ]
  },
  {
    question: "What opinion do you have about education (school / uni)",
    options: [
      { val: "A", text: "It is very important" },
      { val: "B", text: "Somewhat important, but not essential" },
      { val: "C", text: "Useless, you can educate yourself nowadays!" },
      { val: "D", text: "Just needed for getting a job" }
    ]
  },
  {
    question: "What opinion do you have regarding marriage!",
    options: [
      { val: "A", text: "Outdated but ok" },
      { val: "B", text: "I still think its important" },
      { val: "C", text: "I would just do it for my family" },
      { val: "D", text: "I would not do it" }
    ]
  },
  {
    question: "What do you think about climate change?",
    options: [
      { val: "A", text: "We should take it very serious" },
      { val: "B", text: "I think it happens, but its exaggerated how it is portrayed" },
      { val: "C", text: "Does not happen" },
      { val: "D", text: "It happening but not because of us" }
    ]
  },
  {
    question: "If money would not count, what would you do all day",
    options: [
      { val: "A", text: "Travel" },
      { val: "B", text: "Study what i am interested in" },
      { val: "C", text: "Live the same way" },
      { val: "D", text: "Just hang out n chill" }
    ]
  },  {
    question: "Where do you see yourself in 10 years",
    options: [
      { val: "A", text: "Being succesfull" },
      { val: "B", text: "Travelling the world" },
      { val: "C", text: "Traditional with family, house and a dog" },
      { val: "D", text: "Just like today with a little more money" }
    ]
  }, {
    question: "How many hours of sleep do you need to feel ok",
    options: [
      { val: "A", text: "6 hours" },
      { val: "B", text: "7 hours" },
      { val: "C", text: "8 hours" },
      { val: "D", text: "less than 6 hours" }
    ]
  },  {
    question: "Whats describes your dream best ? ",
    options: [
      { val: "A", text: "Work what you love and succeed with it" },
      { val: "B", text: "Win the lottery and live a careless life" },
      { val: "C", text: "Become a star and make world tournees" },
      { val: "D", text: "Found the love of my life and get old together" }
    ]
  }, {
    question: "Do you take risks in life? ",
    options: [
      { val: "A", text: "No risk, no fun!" },
      { val: "B", text: "Depends on what i can get in exchange!" },
      { val: "C", text: "No, i prefer the safe side!" },
      { val: "D", text: "Just if the risk is not too high!" }
    ]
  }, {
    question: "How many good friends do you have?",
    options: [
      { val: "A", text: "option A" },
      { val: "B", text: "option B" },
      { val: "C", text: "option C" },
      { val: "D", text: "option D" }
    ]
  }, {
    question: "Would you deceive (hintergehen) a friend for a personal benefit",
    options: [
      { val: "A", text: "No, never" },
      { val: "B", text: "Maybe, if he had done the same to me before" },
      { val: "C", text: "Depends on the benefit" },
      { val: "D", text: "Yes" }
    ]
  }, {
    question: "Would you lie for getting a certain advantage?",
    options: [
      { val: "A", text: "Yes, sure" },
      { val: "B", text: "It depends on which advantage" },
      { val: "C", text: "Depends on who i have to lie to" },
      { val: "D", text: "Never, i am a honest person" }
    ]
  }, {
    question: "How important is friendship to you",
    options: [
      { val: "A", text: "The most important ever!" },
      { val: "B", text: "Just family is more important" },
      { val: "C", text: "It ok, but just until a certain point!" },
      { val: "D", text: "Man ist sich selbst der Nächste" }
    ]
  },  {
    question: "If you would have to decide between your boy/girl-friend and friends",
    options: [
      { val: "A", text: "I would go for my partner" },
      { val: "B", text: "I would choose my friends" },
      { val: "C", text: "I could not decide" },
      { val: "D", text: "I would quit with both if they put in such situations" }
    ]
  }, {
    question: "How do you feel being alone by yourself.",
    options: [
      { val: "A", text: "Its the moments i enjoy most" },
      { val: "B", text:  "I hate it. I always need people around" },
      { val: "C", text: "It depends on how long i am being alone" },
      { val: "D", text: "It varies based on my mood"}
    ]
  }, {
    question: "Would you forgive a friend which has mistreated you",
    options: [
      { val: "A", text: "Yes, always" },
      { val: "B", text: "Just if it was the first time" },
      { val: "C", text: "Depends on what he has done" },
      { val: "D", text: "No, he has had his chance" }
    ]
  }, {
    question: "Where do you feel most being yourself / free",
    options: [
      { val: "A", text: "Alone at home" },
      { val: "B", text: "With my partner" },
      { val: "C", text: "Around my friends" },
      { val: "D", text: "Around my family" }
    ]
  }, {
    question: "What do you think about social media / virtual socialization platforms",
    options: [
      { val: "A", text: "I love them and use it a lot" },
      { val: "B", text: "Depends on how much time you spend there" },
      { val: "C", text: "I am quite critic about it but use it anyway" },
      { val: "D", text: "I hate it and do not use it" }
    ]
  }, {
    question: "Do you try present yourself as being better than you actually think you are?",
    options: [
      { val: "A", text: "Yes, who not?" },
      { val: "B", text: "Depends on, to whom" },
      { val: "C", text: "I already think i am the best" },
      { val: "D", text: "No, why should I?" }
    ]
  }, {
    question: "How  much time do you spend on your phone on a daily basis",
    options: [
      { val: "A", text: " Less than one hour" },
      { val: "B", text: "Between 1-2 hours" },
      { val: "C", text: "Between 2-3 hours" },
      { val: "D", text: "More than 3 hours" }
    ]
  },
  {
    question: "Do you think technology / internet brings us together",
    options: [
      { val: "A", text: "Yes, i have made a lot of friends online" },
      { val: "B", text: "Depends on the intensity we are using it" },
      { val: "C", text: "I do not have an opinion about this" },
      { val: "D", text: "I think internet has a bad influence upon our ability to socialize" }
    ]
  },
  {
    question: "Do you have friendships which you can maintain just thanks to the internet ",
    options: [
      { val: "A", text: "Yes" },
      { val: "B", text: "Yes, but we would find other ways if there would not be the internet" },
      { val: "C", text: "No, but I could imagine that this offers a great chance to maintain relations" },
      { val: "D", text: "I do not think it's possible to maintain a relation through the internet" }
    ]
  },
  {
    question: "What is your age",
    options: [
      { val: "A", text: "Between 18-22" },
      { val: "B", text: "Between 22-25" },
      { val: "C", text: "Between 25-28" },
      { val: "D", text: "Above 28" }
    ]
  },
  {
    question: "What do you think about sports",
    options: [
      { val: "A", text: "I love it and practice it by myself" },
      { val: "B", text: "I do not practice it but i like watching it on TV" },
      { val: "C", text: "I just practice body building" },
      { val: "D", text: "I hate sports in any form" }
    ]
  },
  {
    question: "How self critical / self reflected do you think you are ? ",
    options: [
      { val: "A", text: "I think I have a quite good self assessment" },
      { val: "B", text: "Sometimes I am too critical about myself" },
      { val: "C", text: "I could be more self critical" },
      { val: "D", text: "It's hard for me being critical about myself" }
    ]
  },
  {
    question: "What are your biggest strengths",
    options: [
      { val: "A", text: "I am a very determined person" },
      { val: "B", text: "I would say that I am very smart" },
      { val: "C", text: "I am a very communicative person" },
      { val: "D", text: "I am a empathic person" }
    ]
  },
  {
    question: "What are your biggest weaknesses",
    options: [
      { val: "A", text: "I am kind of jealous/envious" },
      { val: "B", text: "I am a lazy person and could be more consequent" },
      { val: "C", text: "I try to conceal my low self-esteem by overacting" },
      { val: "D", text: "I cannot handle money" }
    ]
  },
  {
    question: "How many friends / long term relations have you made over the internet",
    options: [
      { val: "A", text: "None" },
      { val: "B", text: "1-3" },
      { val: "C", text: "4-6" },
      { val: "D", text: "More than 6" }
    ]
  },
  {
    question: "How much money do you think you would need to have a completely carefree life",
    options: [
      { val: "A", text: "I do not need money for living a carefree life" },
      { val: "B", text: "Just as much to cover my minimum needs" },
      { val: "C", text: "At least 3.000 Euro" },
      { val: "D", text: "I could not have enough money" }
    ]
  },
  {
    question: "I do NOT trust others",
    options: [
      { val: "A", text: "Inaccurate" },
      { val: "B", text: "Neutral" },
      { val: "C", text: "Accurate" },
      { val: "D", text: "Accurate, but not for certain persons" }
    ]
  },
  {
    question: "Do you mind what your opponent thinks about you?",
    options: [
      { val: "A", text: "No not at all" },
      { val: "B", text: "Somehow I always care what other think about me" },
      { val: "C", text: "Yes, I hope he likes me" },
      { val: "D", text: "I know he likes me anyway" }
    ]
  },
  {
    question: "Are you a person which does like to follow the rules",
    options: [
      { val: "A", text: "No, I always do what I want" },
      { val: "B", text: "No, except a few cases when I think it is essential" },
      { val: "C", text: "Yes, i think everybody should follow all rules" },
      { val: "D", text: "Somehow, except rules which are kinda stupid" }
    ]
  },
  {
    question: "Are you a messy person?",
    options: [
      { val: "A", text: "No, I want precise cleanliness around me!" },
      { val: "B", text: "No, but i think you also should not exaggerate being too petty" },
      { val: "C", text: "Yes, somehow, but i still keep some general order" },
      { val: "D", text: "Yes I am quite chaotic" }
    ]
  },
  {
    question: "Would you say that you are a very organized person",
    options: [
      { val: "A", text: "Not at all!" },
      { val: "B", text: "Well, i get my things done last minute" },
      { val: "C", text: "I quite keep a strict plan which I almost follow" },
      { val: "D", text: "Yes, I can tell that I am really organized" }
    ]
  },
  {
    question: "Do you love what you are actually doing (Work/Study)",
    options: [
      { val: "A", text: "Not at all!" },
      { val: "B", text: "Somehow, but i think i could do other stuff better" },
      { val: "C", text: "Not yet, but i hope its getting better in time" },
      { val: "D", text: "Yes, it's kind of my passion" }
    ]
  },
  {
    question: "How satisfied are you with your actual situation in life?",
    options: [
      { val: "A", text: "I love it - it could not be better" },
      { val: "B", text: "Quite satisfied for the moment, but I still hope it's getting better" },
      { val: "C", text: "Not really happy, i need to change something" },
      { val: "D", text: "Not happy at all, i need a radical change" }
    ]
  },
  {
    question: "Do you think you have a lot in common with your opponent?",
    options: [
      { val: "A", text: "Not really" },
      { val: "B", text: "Partially yes!" },
      { val: "C", text: "Actually a lot of things" },
      { val: "D", text: "I still do not know yet" }
    ]
  },
];


module.exports = {
  questionPool
};
