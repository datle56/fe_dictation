export interface Sentence {
  index: number;
  text: string;
  referenceTranslation: string;
}

export interface DictationSentence {
  index: number;
  audio: string;
  text: string;
  duration: number;
}

export interface Lesson {
  id: string;
  title: string;
  skillType: string;
  level: string;
  sentences: Sentence[];
  dictationSentences?: DictationSentence[];
  fullText?: string;
  vietnameseText?: string;
  audioUrl?: string;
  transcript?: string;
  words?: Array<{
    word: string;
    definition: string;
    phonetic: string;
    examples: string[];
  }>;
  grammarRules?: Array<{
    rule: string;
    explanation: string;
    examples: string[];
  }>;
}

export const lessonsData: { [key: string]: Lesson } = {
  'reading-1': {
    id: 'reading-1',
    title: 'Climate Change and Global Warming',
    skillType: 'reading',
    level: 'intermediate',
    fullText: `Climate change represents one of the most pressing challenges of our time. Global temperatures have risen by approximately 1.1 degrees Celsius since the late 19th century, primarily due to human activities. The burning of fossil fuels releases greenhouse gases into the atmosphere, creating a heat-trapping effect. These changes are not just numbers on a chart; they translate into real-world consequences. Extreme weather events are becoming more frequent and severe. Sea levels are rising as polar ice caps melt, threatening coastal communities worldwide. Agricultural patterns are shifting, affecting food security for millions of people. The economic costs of climate change are staggering, with billions of dollars in damages annually. However, there is still hope if we act decisively. Renewable energy technologies are becoming more affordable and efficient. Many countries are committing to carbon neutrality by 2050. Individual actions, while important, must be coupled with systemic changes to make a meaningful impact.`,
    sentences: [
      {
        index: 0,
        text: "Climate change represents one of the most pressing challenges of our time.",
        referenceTranslation: "Biến đổi khí hậu là một trong những thách thức cấp bách nhất của thời đại chúng ta."
      },
      {
        index: 1,
        text: "Global temperatures have risen by approximately 1.1 degrees Celsius since the late 19th century, primarily due to human activities.",
        referenceTranslation: "Nhiệt độ toàn cầu đã tăng khoảng 1.1 độ C kể từ cuối thế kỷ 19, chủ yếu do các hoạt động của con người."
      },
      {
        index: 2,
        text: "The burning of fossil fuels releases greenhouse gases into the atmosphere, creating a heat-trapping effect.",
        referenceTranslation: "Việc đốt nhiên liệu hóa thạch giải phóng khí nhà kính vào khí quyển, tạo ra hiệu ứng giữ nhiệt."
      },
      {
        index: 3,
        text: "These changes are not just numbers on a chart; they translate into real-world consequences.",
        referenceTranslation: "Những thay đổi này không chỉ là những con số trên biểu đồ; chúng dẫn đến những hậu quả thực tế."
      },
      {
        index: 4,
        text: "Extreme weather events are becoming more frequent and severe.",
        referenceTranslation: "Các hiện tượng thời tiết cực đoan đang trở nên thường xuyên và nghiêm trọng hơn."
      },
      {
        index: 5,
        text: "Sea levels are rising as polar ice caps melt, threatening coastal communities worldwide.",
        referenceTranslation: "Mực nước biển đang dâng cao khi các tảng băng cực tan chảy, đe dọa các cộng đồng ven biển trên toàn thế giới."
      },
      {
        index: 6,
        text: "Agricultural patterns are shifting, affecting food security for millions of people.",
        referenceTranslation: "Các mô hình nông nghiệp đang thay đổi, ảnh hưởng đến an ninh lương thực của hàng triệu người."
      },
      {
        index: 7,
        text: "The economic costs of climate change are staggering, with billions of dollars in damages annually.",
        referenceTranslation: "Chi phí kinh tế của biến đổi khí hậu là đáng kinh ngạc, với thiệt hại hàng tỷ đô la mỗi năm."
      },
      {
        index: 8,
        text: "However, there is still hope if we act decisively.",
        referenceTranslation: "Tuy nhiên, vẫn còn hy vọng nếu chúng ta hành động quyết đoán."
      },
      {
        index: 9,
        text: "Renewable energy technologies are becoming more affordable and efficient.",
        referenceTranslation: "Các công nghệ năng lượng tái tạo đang trở nên hợp lý và hiệu quả hơn về chi phí."
      },
      {
        index: 10,
        text: "Many countries are committing to carbon neutrality by 2050.",
        referenceTranslation: "Nhiều quốc gia đang cam kết trung hòa carbon vào năm 2050."
      },
      {
        index: 11,
        text: "Individual actions, while important, must be coupled with systemic changes to make a meaningful impact.",
        referenceTranslation: "Các hành động cá nhân, mặc dù quan trọng, phải được kết hợp với những thay đổi hệ thống để tạo ra tác động có ý nghĩa."
      }
    ]
  },
  'writing-1': {
    id: 'writing-1',
    title: 'Describing Your Hometown',
    skillType: 'writing',
    level: 'beginner',
    vietnameseText: `Tôi sinh ra và lớn lên ở một thành phố nhỏ ven biển. Thành phố của tôi có khoảng 50,000 dân và nằm ở miền Nam Việt Nam. Khí hậu ở đây rất dễ chịu với mùa khô và mùa mưa rõ rệt. Điều tôi yêu thích nhất về quê hương là những bãi biển tuyệt đẹp với cát trắng mịn. Mọi người ở đây rất thân thiện và hiếu khách. Món ăn đặc sản của chúng tôi là hải sản tươi sống. Tuy nhiên, thành phố còn thiếu một số tiện ích hiện đại như trung tâm thương mại lớn. Tôi hy vọng trong tương lai quê hương sẽ phát triển hơn nữa.`,
    sentences: [
      {
        index: 0,
        text: "Tôi sinh ra và lớn lên ở một thành phố nhỏ ven biển.",
        referenceTranslation: "I was born and raised in a small coastal city."
      },
      {
        index: 1,
        text: "Thành phố của tôi có khoảng 50,000 dân và nằm ở miền Nam Việt Nam.",
        referenceTranslation: "My city has about 50,000 residents and is located in southern Vietnam."
      },
      {
        index: 2,
        text: "Khí hậu ở đây rất dễ chịu với mùa khô và mùa mưa rõ rệt.",
        referenceTranslation: "The climate here is very pleasant with distinct dry and rainy seasons."
      },
      {
        index: 3,
        text: "Điều tôi yêu thích nhất về quê hương là những bãi biển tuyệt đẹp với cát trắng mịn.",
        referenceTranslation: "What I love most about my hometown is the beautiful beaches with fine white sand."
      },
      {
        index: 4,
        text: "Mọi người ở đây rất thân thiện và hiếu khách.",
        referenceTranslation: "People here are very friendly and hospitable."
      },
      {
        index: 5,
        text: "Món ăn đặc sản của chúng tôi là hải sản tươi sống.",
        referenceTranslation: "Our specialty food is fresh seafood."
      },
      {
        index: 6,
        text: "Tuy nhiên, thành phố còn thiếu một số tiện ích hiện đại như trung tâm thương mại lớn.",
        referenceTranslation: "However, the city still lacks some modern amenities like large shopping centers."
      },
      {
        index: 7,
        text: "Tôi hy vọng trong tương lai quê hương sẽ phát triển hơn nữa.",
        referenceTranslation: "I hope that in the future my hometown will develop even further."
      }
    ]
  },
  'dictation-1': {
    id: 'dictation-1',
    title: 'Academic Vocabulary Dictation',
    skillType: 'dictation',
    level: 'intermediate',
    sentences: [], // Will be generated from dictationSentences
    dictationSentences: [
      {
        index: 0,
        audio: 'academic-sentence-1.mp3',
        text: 'The research methodology employed in this study was both comprehensive and rigorous.',
        duration: 4.5
      },
      {
        index: 1,
        audio: 'academic-sentence-2.mp3',
        text: 'Statistical analysis revealed significant correlations between the variables examined.',
        duration: 4.2
      },
      {
        index: 2,
        audio: 'academic-sentence-3.mp3',
        text: 'The hypothesis was subsequently validated through extensive empirical testing.',
        duration: 4.0
      },
      {
        index: 3,
        audio: 'academic-sentence-4.mp3',
        text: 'Contemporary literature suggests that this phenomenon requires further investigation.',
        duration: 4.3
      },
      {
        index: 4,
        audio: 'academic-sentence-5.mp3',
        text: 'The implications of these findings extend beyond the scope of this particular study.',
        duration: 4.6
      },
      {
        index: 5,
        audio: 'academic-sentence-6.mp3',
        text: 'Participants demonstrated remarkable consistency in their responses throughout the experiment.',
        duration: 4.8
      },
      {
        index: 6,
        audio: 'academic-sentence-7.mp3',
        text: 'The theoretical framework provides a solid foundation for understanding these complex relationships.',
        duration: 5.0
      },
      {
        index: 7,
        audio: 'academic-sentence-8.mp3',
        text: 'Preliminary results indicate that further research is warranted in this area.',
        duration: 4.1
      },
      {
        index: 8,
        audio: 'academic-sentence-9.mp3',
        text: 'The data collection process adhered to strict ethical guidelines and protocols.',
        duration: 4.4
      },
      {
        index: 9,
        audio: 'academic-sentence-10.mp3',
        text: 'These conclusions are consistent with previous studies conducted in similar contexts.',
        duration: 4.7
      }
    ]
  },
  'vocabulary-1': {
    id: 'vocabulary-1',
    title: 'Academic Vocabulary Set 1',
    skillType: 'vocabulary',
    level: 'intermediate',
    words: [
      {
        word: 'analyze',
        definition: 'to examine something in detail to understand or explain it',
        phonetic: '/ˈænəlaɪz/',
        examples: [
          'Scientists analyze data to draw conclusions.',
          'We need to analyze the problem before finding a solution.',
          'The report analyzes market trends over the past decade.'
        ]
      },
      {
        word: 'significant',
        definition: 'important, large, or meaningful',
        phonetic: '/sɪɡˈnɪfɪkənt/',
        examples: [
          'There was a significant increase in sales.',
          'Her research made a significant contribution to science.',
          'The difference between the two groups was statistically significant.'
        ]
      },
      {
        word: 'consequence',
        definition: 'a result or effect of an action or condition',
        phonetic: '/ˈkɒnsɪkwəns/',
        examples: [
          'The consequence of his decision was unexpected.',
          'Climate change has serious consequences for the environment.',
          'Every action has its consequences.'
        ]
      },
      {
        word: 'establish',
        definition: 'to set up, create, or prove something',
        phonetic: '/ɪˈstæblɪʃ/',
        examples: [
          'The company was established in 1995.',
          'We need to establish clear guidelines.',
          'The research established a link between diet and health.'
        ]
      },
      {
        word: 'approach',
        definition: 'a way of dealing with something; a method',
        phonetic: '/əˈproʊtʃ/',
        examples: [
          'We need a different approach to solve this problem.',
          'His teaching approach is very effective.',
          'The traditional approach may not work in this situation.'
        ]
      }
    ],
    sentences: [] // Will be generated from words
  }
};

// Generate sentences for vocabulary lessons
if (lessonsData['vocabulary-1'].words) {
  lessonsData['vocabulary-1'].sentences = lessonsData['vocabulary-1'].words!.map((word, index) => ({
    index,
    text: `Create a sentence using the word "${word.word}"`,
    referenceTranslation: word.examples[0]
  }));
}

// Generate sentences for dictation lessons
if (lessonsData['dictation-1'].dictationSentences) {
  lessonsData['dictation-1'].sentences = lessonsData['dictation-1'].dictationSentences!.map((dictation, index) => ({
    index,
    text: dictation.text,
    referenceTranslation: dictation.text
  }));
}