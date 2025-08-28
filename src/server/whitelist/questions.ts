interface Question {
  type: string;
  id: string;
  question: string;
  optional: boolean;
}

interface MultipleChoiceQuestion extends Question {
  type: "options";
  options: string[];
  other: boolean;
}

interface TextQuestion extends Question {
  type: "text";
  style: "short" | "paragraph";
}

interface NumberQuestion extends Question {
  type: "number";
  min: number;
  max: number;
}

interface BooleanQuestion extends Question {
  type: "boolean";
}